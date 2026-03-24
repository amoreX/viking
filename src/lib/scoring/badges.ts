import db from "@/lib/db";

interface BadgeStats {
  weeklyMergedPRs: number;
  hasOneShotPR: boolean;
  streak: number;
  wasDaily1: boolean;
  mergeStreak: number;
  hasLateNightCommit: boolean;
  avgAILikelihood: number;
  maxDailyAdditions: number;
}

interface BadgeDefinition {
  slug: string;
  name: string;
  emoji: string;
  description: string;
  check: (stats: BadgeStats) => boolean;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    slug: "pr-goblin",
    name: "PR Goblin",
    emoji: "👺",
    description: "Merged 10+ PRs in a week",
    check: (stats) => stats.weeklyMergedPRs >= 10,
  },
  {
    slug: "one-shot-killer",
    name: "One-Shot Killer",
    emoji: "🎯",
    description: "Landed a massive PR in a single commit",
    check: (stats) => stats.hasOneShotPR,
  },
  {
    slug: "locked-in",
    name: "Locked In",
    emoji: "🔒",
    description: "7-day coding streak",
    check: (stats) => stats.streak >= 7,
  },
  {
    slug: "vibe-lord",
    name: "Vibe Lord",
    emoji: "👑",
    description: "Hit #1 on the daily leaderboard",
    check: (stats) => stats.wasDaily1,
  },
  {
    slug: "merge-addict",
    name: "Merge Addict",
    emoji: "💉",
    description: "Merged PRs 5 days in a row",
    check: (stats) => stats.mergeStreak >= 5,
  },
  {
    slug: "3am-goblin",
    name: "3AM Commit Goblin",
    emoji: "🌙",
    description: "Pushed code between 2-5 AM",
    check: (stats) => stats.hasLateNightCommit,
  },
  {
    slug: "boilerplate-beast",
    name: "Boilerplate Beast",
    emoji: "🤖",
    description: "Average AI-likelihood above 0.7",
    check: (stats) => stats.avgAILikelihood > 0.7,
  },
  {
    slug: "agent-maxxer",
    name: "Agent Maxxer",
    emoji: "⚡",
    description: "Shipped 1000+ lines in a day",
    check: (stats) => stats.maxDailyAdditions >= 1000,
  },
];

async function getUserBadgeStats(userId: string): Promise<BadgeStats> {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Weekly merged PRs
  const weeklyMergedPRs = await db.pullRequest.count({
    where: {
      repo: { userId, includedInScoring: true },
      mergedAt: { not: null, gte: weekAgo },
    },
  });

  // One-shot PR: single commit, 200+ additions, merged
  const oneShotPR = await db.pullRequest.findFirst({
    where: {
      repo: { userId, includedInScoring: true },
      mergedAt: { not: null },
      commitCount: 1,
      additions: { gte: 200 },
    },
  });

  // Current streak from daily snapshots
  const snapshots = await db.dailySnapshot.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 30,
    select: { date: true, prsMerged: true, additions: true, vibeScore: true },
  });

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < snapshots.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    const snapDate = new Date(snapshots[i].date);
    snapDate.setHours(0, 0, 0, 0);
    if (
      snapDate.getTime() === expectedDate.getTime() &&
      snapshots[i].vibeScore > 0
    ) {
      streak++;
    } else {
      break;
    }
  }

  // Merge streak: consecutive days with merged PRs
  let mergeStreak = 0;
  for (let i = 0; i < snapshots.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    const snapDate = new Date(snapshots[i].date);
    snapDate.setHours(0, 0, 0, 0);
    if (
      snapDate.getTime() === expectedDate.getTime() &&
      snapshots[i].prsMerged > 0
    ) {
      mergeStreak++;
    } else {
      break;
    }
  }

  // Was daily #1
  const wasDaily1 = await db.dailySnapshot.findFirst({
    where: { userId, rank: 1 },
  });

  // Late night commits (2-5 AM)
  const lateNightCommit = await db.commit.findFirst({
    where: {
      repo: { userId },
    },
  });
  // Check in-app since Prisma can't filter by hour directly
  let hasLateNightCommit = false;
  if (lateNightCommit) {
    const allCommits = await db.commit.findMany({
      where: { repo: { userId } },
      select: { authoredAt: true },
    });
    hasLateNightCommit = allCommits.some((c: { authoredAt: Date }) => {
      const hour = c.authoredAt.getHours();
      return hour >= 2 && hour < 5;
    });
  }

  // Average AI likelihood from scores
  const allTimeScore = await db.score.findFirst({
    where: { userId, periodType: "ALL_TIME" },
    orderBy: { computedAt: "desc" },
  });
  const avgAILikelihood = allTimeScore?.aiLikelihood ?? 0;

  // Max daily additions
  const maxDailySnapshot = await db.dailySnapshot.findFirst({
    where: { userId },
    orderBy: { additions: "desc" },
  });
  const maxDailyAdditions = maxDailySnapshot?.additions ?? 0;

  return {
    weeklyMergedPRs,
    hasOneShotPR: !!oneShotPR,
    streak,
    wasDaily1: !!wasDaily1,
    mergeStreak,
    hasLateNightCommit,
    avgAILikelihood,
    maxDailyAdditions,
  };
}

export async function awardBadges(userId: string): Promise<string[]> {
  const stats = await getUserBadgeStats(userId);
  const awardedSlugs: string[] = [];

  for (const def of BADGE_DEFINITIONS) {
    if (!def.check(stats)) continue;

    // Upsert the badge definition
    const badge = await db.badge.upsert({
      where: { slug: def.slug },
      create: {
        slug: def.slug,
        name: def.name,
        description: def.description,
        emoji: def.emoji,
      },
      update: {
        name: def.name,
        description: def.description,
        emoji: def.emoji,
      },
    });

    // Upsert user-badge association
    await db.userBadge.upsert({
      where: {
        userId_badgeId: { userId, badgeId: badge.id },
      },
      create: { userId, badgeId: badge.id },
      update: {},
    });

    awardedSlugs.push(def.slug);
  }

  return awardedSlugs;
}
