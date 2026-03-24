import type { Metadata } from "next";
import { getLeaderboard } from "@/lib/mock-data";
import PeriodTabs from "@/components/leaderboard/period-tabs";
import LeaderboardTable from "@/components/leaderboard/leaderboard-table";

export const metadata: Metadata = {
  title: "Leaderboard - VIKING",
  description: "See who tops the vibecoder leaderboard today, this week, and all time.",
};

type Period = "daily" | "weekly" | "alltime";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: periodParam } = await searchParams;
  const period = (["daily", "weekly", "alltime"].includes(periodParam ?? "")
    ? periodParam
    : "daily") as Period;

  const entries = getLeaderboard(period);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-balance text-xl font-bold text-white">Leaderboard</h1>
      <PeriodTabs />
      <div className="mt-6">
        <LeaderboardTable entries={entries} />
      </div>
    </div>
  );
}
