"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { BADGE_CATALOG, getUserProfile } from "@/lib/mock-data";
import ProfileModal from "./profile-modal";

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

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

const rankColor: Record<number, string> = {
  1: "text-yellow-400",
  2: "text-neutral-400",
  3: "text-orange-400",
};

function formatLines(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export default function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const [selectedProfile, setSelectedProfile] = useState<Parameters<typeof ProfileModal>[0]["profile"]>(null);

  const openProfile = useCallback((username: string) => {
    const p = getUserProfile(username);
    if (!p) return;
    setSelectedProfile({
      username: p.user.githubUsername,
      avatarUrl: p.user.avatarUrl,
      bio: p.user.bio,
      agentLines: p.agentLines,
      vibeHours: p.vibeHours,
      streak: p.stats.streak,
      totalPRs: p.stats.totalPRs,
      peakHour: p.stats.peakHour,
      badges: p.badges.map((b) => b.slug),
      scores: p.scores,
      ranks: {
        daily: p.ranks.DAILY,
        weekly: p.ranks.WEEKLY,
        allTime: p.ranks.ALL_TIME,
      },
    });
  }, []);

  return (
    <>
      <div>
        {/* Desktop header */}
        <div className="hidden items-center border-b border-border px-4 py-2 text-[0.6875rem] font-medium text-dim uppercase sm:flex">
          <span className="w-12">#</span>
          <span className="flex-1">User</span>
          <span className="w-24 text-right">Agent Lines</span>
          <span className="w-16 text-right">Streak</span>
          <span className="w-24 text-right">Badges</span>
        </div>

        <div className="flex flex-col gap-1 py-1">
          {entries.map((entry) => (
            <button
              key={entry.username}
              type="button"
              onClick={() => openProfile(entry.username)}
              className={`flex w-full cursor-pointer items-center rounded-lg border px-4 py-3 text-left transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset ${
                entry.rank <= 3
                  ? "border-accent/20 bg-accent-muted"
                  : "border-border"
              }`}
            >
              {/* Rank */}
              <span
                className={`w-12 shrink-0 font-mono text-sm font-semibold tabular-nums ${rankColor[entry.rank] ?? "text-dim"}`}
              >
                {entry.rank}
              </span>

              {/* User */}
              <span className="flex flex-1 items-center gap-2.5 overflow-hidden">
                {entry.avatarUrl && (
                  <Image
                    src={entry.avatarUrl}
                    alt={entry.username}
                    width={32}
                    height={32}
                    className="size-8 shrink-0 rounded-full"
                  />
                )}
                <span className="truncate text-sm font-medium text-neutral-200">
                  {entry.username}
                </span>
              </span>

              {/* Agent Lines */}
              <span className="w-24 shrink-0 text-right font-mono text-sm font-semibold tabular-nums text-accent">
                {formatLines(entry.agentLines)}
              </span>

              {/* Streak (hidden on mobile) */}
              <span className="hidden w-16 shrink-0 text-right font-mono text-sm tabular-nums text-muted sm:block">
                {entry.streak > 0 ? `${entry.streak}d` : "-"}
              </span>

              {/* Badges (hidden on mobile) */}
              <span className="hidden w-24 shrink-0 items-center justify-end gap-1.5 sm:flex">
                {entry.badges.slice(0, 3).map((slug) => {
                  const badge = BADGE_CATALOG[slug];
                  if (!badge) return null;
                  return (
                    <span
                      key={slug}
                      title={`${badge.name}: ${badge.description}`}
                      className="text-base leading-none"
                    >
                      {badge.emoji}
                    </span>
                  );
                })}
                {entry.badges.length > 3 && (
                  <span className="text-xs text-dim">
                    +{entry.badges.length - 3}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      <ProfileModal
        profile={selectedProfile}
        onClose={() => setSelectedProfile(null)}
      />
    </>
  );
}
