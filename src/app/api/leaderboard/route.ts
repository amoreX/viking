import db from "@/lib/db";
import { ScorePeriod } from "@/generated/prisma";
import { NextRequest } from "next/server";

const PERIOD_MAP: Record<string, ScorePeriod> = {
  daily: ScorePeriod.DAILY,
  weekly: ScorePeriod.WEEKLY,
  alltime: ScorePeriod.ALL_TIME,
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const periodParam = searchParams.get("period") ?? "daily";
  const period = PERIOD_MAP[periodParam] ?? ScorePeriod.DAILY;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10) || 50, 100);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10) || 0;

  const scores = await db.score.findMany({
    where: { periodType: period },
    orderBy: { vibeScore: "desc" },
    take: limit,
    skip: offset,
    include: {
      user: {
        select: {
          githubUsername: true,
          avatarUrl: true,
          image: true,
        },
      },
    },
  });

  const entries = scores.map((s: any, i: number) => ({
    rank: offset + i + 1,
    username: s.user.githubUsername ?? "unknown",
    avatarUrl: s.user.avatarUrl ?? s.user.image ?? "",
    vibeScore: Math.round(s.vibeScore * 100) / 100,
    aiLikelihood: Math.round(s.aiLikelihood * 100) / 100,
    outputScore: Math.round(s.outputScore * 100) / 100,
  }));

  return Response.json(entries);
}
