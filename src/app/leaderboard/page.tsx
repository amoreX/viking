"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import PeriodTabs from "@/components/leaderboard/period-tabs";
import LeaderboardTable from "@/components/leaderboard/leaderboard-table";
import MyStatsPanel from "@/components/leaderboard/my-stats-panel";

type Period = "daily" | "weekly" | "alltime";

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatarUrl: string;
  vibeScore: number;
  agentLines: number;
  vibeHours: number;
  streak: number;
  badges: string[];
}

export default function LeaderboardPage() {
  const searchParams = useSearchParams();
  const periodParam = searchParams.get("period");
  const period = (["daily", "weekly", "alltime"].includes(periodParam ?? "")
    ? periodParam
    : "daily") as Period;

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?period=${period}`)
      .then((res) => res.json())
      .then((data) => setEntries(data))
      .catch((err) => {
        console.error("Failed to fetch leaderboard:", err);
        setEntries([]);
      })
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-balance text-xl font-bold text-foreground">Leaderboard</h1>

      <div className="flex gap-8">
        {/* Main leaderboard */}
        <div className="min-w-0 flex-1">
          <PeriodTabs />
          <div className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-sm text-muted">Loading leaderboard...</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-sm text-muted">No entries yet. Be the first to sync!</p>
              </div>
            ) : (
              <LeaderboardTable entries={entries} />
            )}
          </div>
        </div>

        {/* Sidebar -- your stats */}
        <div className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20">
            <MyStatsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
