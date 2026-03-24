"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuthStore } from "@/lib/store";

interface ProfileData {
  agentLines: number;
  vibeHours: number;
  streak: number;
  badges: string[];
  badgeDetails: { slug: string; name: string; emoji: string; description: string }[];
  scores: { daily: number; weekly: number; allTime: number };
  ranks: { daily: number | null; weekly: number | null; allTime: number | null };
}

export default function MyStatsPanel() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    if (!user) return;

    fetch(`/api/user/${user.username}`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data) setProfile(data);
      })
      .catch((err) => console.error("Failed to fetch profile:", err));
  }, [user]);

  if (!user || !profile) return null;

  const { agentLines, vibeHours, streak, badgeDetails, scores, ranks } = profile;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        {user.avatar && (
          <Image
            src={user.avatar}
            alt={user.username}
            width={40}
            height={40}
            className="size-10 rounded-full ring-2 ring-accent/30 ring-offset-2 ring-offset-background"
          />
        )}
        <div>
          <p className="text-sm font-bold text-foreground">{user.username}</p>
          <p className="text-[0.625rem] text-dim">Your stats</p>
        </div>
      </div>

      {/* Agent lines -- hero number */}
      <div className="mt-5 rounded-lg border border-border bg-background/50 p-4 text-center">
        <p className="font-mono text-2xl font-semibold tabular-nums text-accent">
          {agentLines.toLocaleString()}
        </p>
        <p className="mt-1 text-[0.5625rem] font-medium text-dim uppercase">
          Agent lines shipped
        </p>
      </div>

      {/* Quick stats */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border bg-background/50 p-3 text-center">
          <p className="font-mono text-base font-semibold tabular-nums text-accent">~{vibeHours}h</p>
          <p className="text-[0.5625rem] text-dim uppercase">Vibe time</p>
        </div>
        <div className="rounded-lg border border-border bg-background/50 p-3 text-center">
          <p className="font-mono text-base font-semibold tabular-nums text-foreground">{streak}d</p>
          <p className="text-[0.5625rem] text-dim uppercase">Streak</p>
        </div>
      </div>

      {/* Ranks */}
      <div className="mt-4">
        <p className="mb-2 text-[0.5625rem] font-semibold text-dim uppercase">Rankings</p>
        <div className="space-y-1.5">
          {[
            { label: "Daily", score: scores.daily, rank: ranks.daily },
            { label: "Weekly", score: scores.weekly, rank: ranks.weekly },
            { label: "All Time", score: scores.allTime, rank: ranks.allTime },
          ].map(({ label, score, rank }) => (
            <div key={label} className="flex items-center justify-between text-xs">
              <span className="text-dim">{label}</span>
              {rank ? (
                <span className="font-mono tabular-nums text-foreground">
                  #{rank}
                  <span className="ml-2 text-accent">{Math.round(score * 10) / 10}</span>
                </span>
              ) : (
                <span className="text-dim">&mdash;</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      {badgeDetails && badgeDetails.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[0.5625rem] font-semibold text-dim uppercase">Badges</p>
          <div className="flex flex-wrap gap-1.5">
            {badgeDetails.map((badge) => (
              <span
                key={badge.slug}
                title={badge.description}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-background/50 px-2 py-0.5 text-[0.6875rem] text-muted"
              >
                <span className="leading-none">{badge.emoji}</span>
                {badge.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
