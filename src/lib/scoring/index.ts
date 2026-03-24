import { ScorePeriod } from "@/generated/prisma";
import db from "@/lib/db";

import { computeAILikelihood } from "./ai-likelihood";
import { awardBadges } from "./badges";
import { computeOutputScore } from "./output-score";
import { computeVibeScore } from "./vibe-score";

interface ScoredPR {
  id: string;
  mergedAt: Date;
  outputScore: number;
  aiLikelihood: number;
  vibeScore: number;
}

interface DayAggregate {
  date: string;
  prs: ScoredPR[];
  totalVibeScore: number;
  totalAdditions: number;
  totalDeletions: number;
  prsMerged: number;
}

interface PrFileRow {
  filename: string;
  additions: number;
  deletions: number;
  status: string;
  isGenerated: boolean;
}

interface PrRow {
  id: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  commitCount: number;
  mergedAt: Date | null;
  files: PrFileRow[];
}

interface SnapshotRow {
  date: Date;
  vibeScore: number;
}

interface ScoreSummary {
  prsScored: number;
  dailySnapshots: number;
  scores: { period: ScorePeriod; vibeScore: number }[];
  badgesAwarded: string[];
}

function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

function startOfDay(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function endOfDay(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59.999Z`);
}

export async function scoreUser(userId: string): Promise<ScoreSummary> {
  // 1. Fetch all merged PRs for user with files (from included repos)
  const pullRequests: PrRow[] = await db.pullRequest.findMany({
    where: {
      repo: { userId, includedInScoring: true },
      mergedAt: { not: null },
    },
    include: { files: true },
  });

  // 2. Score each PR
  const scoredPRs: ScoredPR[] = pullRequests.map((pr: PrRow) => {
    const outputScore = computeOutputScore({
      additions: pr.additions,
      deletions: pr.deletions,
      changedFiles: pr.changedFiles,
      files: pr.files.map((f: PrFileRow) => ({
        filename: f.filename,
        additions: f.additions,
        deletions: f.deletions,
        isGenerated: f.isGenerated,
      })),
    });

    const aiLikelihood = computeAILikelihood({
      additions: pr.additions,
      deletions: pr.deletions,
      changedFiles: pr.changedFiles,
      commitCount: pr.commitCount,
      files: pr.files.map((f: PrFileRow) => ({
        filename: f.filename,
        additions: f.additions,
        deletions: f.deletions,
        status: f.status,
        isGenerated: f.isGenerated,
      })),
    });

    const vibeScore = computeVibeScore(outputScore, aiLikelihood);

    return {
      id: pr.id,
      mergedAt: pr.mergedAt!,
      outputScore,
      aiLikelihood,
      vibeScore,
    };
  });

  // 3. Aggregate into daily scores
  const dailyMap = new Map<string, DayAggregate>();

  for (const pr of scoredPRs) {
    const dateStr = toDateString(pr.mergedAt);
    const existing = dailyMap.get(dateStr);

    const originalPR = pullRequests.find((p: PrRow) => p.id === pr.id)!;
    const meaningfulFiles = originalPR.files.filter(
      (f: PrFileRow) => !f.isGenerated,
    );
    const meaningfulAdditions = meaningfulFiles.reduce(
      (sum: number, f: PrFileRow) => sum + f.additions,
      0,
    );
    const meaningfulDeletions = meaningfulFiles.reduce(
      (sum: number, f: PrFileRow) => sum + f.deletions,
      0,
    );

    if (existing) {
      existing.prs.push(pr);
      existing.totalVibeScore += pr.vibeScore;
      existing.totalAdditions += meaningfulAdditions;
      existing.totalDeletions += meaningfulDeletions;
      existing.prsMerged += 1;
    } else {
      dailyMap.set(dateStr, {
        date: dateStr,
        prs: [pr],
        totalVibeScore: pr.vibeScore,
        totalAdditions: meaningfulAdditions,
        totalDeletions: meaningfulDeletions,
        prsMerged: 1,
      });
    }
  }

  // 4. Upsert DailySnapshot records
  for (const [dateStr, day] of dailyMap) {
    await db.dailySnapshot.upsert({
      where: {
        userId_date: { userId, date: startOfDay(dateStr) },
      },
      create: {
        userId,
        date: startOfDay(dateStr),
        prsMerged: day.prsMerged,
        additions: day.totalAdditions,
        deletions: day.totalDeletions,
        vibeScore: Math.round(day.totalVibeScore * 100) / 100,
      },
      update: {
        prsMerged: day.prsMerged,
        additions: day.totalAdditions,
        deletions: day.totalDeletions,
        vibeScore: Math.round(day.totalVibeScore * 100) / 100,
      },
    });
  }

  // 5. Compute period scores
  const today = new Date();
  const todayStr = toDateString(today);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6); // 7 days including today
  const weekAgoStr = toDateString(weekAgo);

  // Fetch all snapshots for aggregation
  const allSnapshots: SnapshotRow[] = await db.dailySnapshot.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  });

  // DAILY
  const todaySnapshot = allSnapshots.find(
    (s: SnapshotRow) => toDateString(s.date) === todayStr,
  );
  const dailyVibeScore = todaySnapshot?.vibeScore ?? 0;
  const todayPRs = dailyMap.get(todayStr)?.prs ?? [];
  const dailyOutputScore = todayPRs.reduce(
    (sum: number, p: ScoredPR) => sum + p.outputScore,
    0,
  );
  const dailyAILikelihood = todayPRs.length
    ? todayPRs.reduce(
        (sum: number, p: ScoredPR) => sum + p.aiLikelihood,
        0,
      ) / todayPRs.length
    : 0;

  // WEEKLY
  const weeklySnapshots = allSnapshots.filter(
    (s: SnapshotRow) =>
      toDateString(s.date) >= weekAgoStr && toDateString(s.date) <= todayStr,
  );
  const weeklyVibeScore = weeklySnapshots.reduce(
    (sum: number, s: SnapshotRow) => sum + s.vibeScore,
    0,
  );
  const weeklyPRs = scoredPRs.filter((p: ScoredPR) => {
    const d = toDateString(p.mergedAt);
    return d >= weekAgoStr && d <= todayStr;
  });
  const weeklyOutputScore = weeklyPRs.reduce(
    (sum: number, p: ScoredPR) => sum + p.outputScore,
    0,
  );
  const weeklyAILikelihood = weeklyPRs.length
    ? weeklyPRs.reduce(
        (sum: number, p: ScoredPR) => sum + p.aiLikelihood,
        0,
      ) / weeklyPRs.length
    : 0;

  // ALL_TIME
  const allTimeVibeScore = allSnapshots.reduce(
    (sum: number, s: SnapshotRow) => sum + s.vibeScore,
    0,
  );
  const allTimeOutputScore = scoredPRs.reduce(
    (sum: number, p: ScoredPR) => sum + p.outputScore,
    0,
  );
  const allTimeAILikelihood = scoredPRs.length
    ? scoredPRs.reduce(
        (sum: number, p: ScoredPR) => sum + p.aiLikelihood,
        0,
      ) / scoredPRs.length
    : 0;

  // Find the earliest snapshot date for ALL_TIME range
  const earliestDate =
    allSnapshots.length > 0 ? allSnapshots[0].date : startOfDay(todayStr);

  interface PeriodConfig {
    periodType: ScorePeriod;
    periodStart: Date;
    periodEnd: Date;
    outputScore: number;
    aiLikelihood: number;
    vibeScore: number;
  }

  const periodConfigs: PeriodConfig[] = [
    {
      periodType: ScorePeriod.DAILY,
      periodStart: startOfDay(todayStr),
      periodEnd: endOfDay(todayStr),
      outputScore: Math.round(dailyOutputScore * 100) / 100,
      aiLikelihood: Math.round(dailyAILikelihood * 100) / 100,
      vibeScore: Math.round(dailyVibeScore * 100) / 100,
    },
    {
      periodType: ScorePeriod.WEEKLY,
      periodStart: startOfDay(weekAgoStr),
      periodEnd: endOfDay(todayStr),
      outputScore: Math.round(weeklyOutputScore * 100) / 100,
      aiLikelihood: Math.round(weeklyAILikelihood * 100) / 100,
      vibeScore: Math.round(weeklyVibeScore * 100) / 100,
    },
    {
      periodType: ScorePeriod.ALL_TIME,
      periodStart: earliestDate,
      periodEnd: endOfDay(todayStr),
      outputScore: Math.round(allTimeOutputScore * 100) / 100,
      aiLikelihood: Math.round(allTimeAILikelihood * 100) / 100,
      vibeScore: Math.round(allTimeVibeScore * 100) / 100,
    },
  ];

  // Upsert Score records
  for (const config of periodConfigs) {
    await db.score.upsert({
      where: {
        userId_periodType_periodStart: {
          userId,
          periodType: config.periodType,
          periodStart: config.periodStart,
        },
      },
      create: {
        userId,
        periodType: config.periodType,
        periodStart: config.periodStart,
        periodEnd: config.periodEnd,
        outputScore: config.outputScore,
        aiLikelihood: config.aiLikelihood,
        vibeScore: config.vibeScore,
      },
      update: {
        periodEnd: config.periodEnd,
        outputScore: config.outputScore,
        aiLikelihood: config.aiLikelihood,
        vibeScore: config.vibeScore,
        computedAt: new Date(),
      },
    });
  }

  // 6. Award badges
  const badgesAwarded = await awardBadges(userId);

  // 7. Return summary
  return {
    prsScored: scoredPRs.length,
    dailySnapshots: dailyMap.size,
    scores: periodConfigs.map((c: PeriodConfig) => ({
      period: c.periodType,
      vibeScore: c.vibeScore,
    })),
    badgesAwarded,
  };
}
