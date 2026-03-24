"use client";

import type { Metadata } from "next";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import ScoreDisplay from "@/components/ui/score-display";

const BADGE_CATALOG: Record<string, { emoji: string; name: string; description: string }> = {
  "vibe-lord":        { emoji: "👑", name: "Vibe Lord",        description: "Hit #1 on the daily leaderboard" },
  "locked-in":        { emoji: "🔒", name: "Locked In",        description: "7-day coding streak" },
  "boilerplate-beast":{ emoji: "🤖", name: "Boilerplate Beast",description: "Average AI-likelihood above 0.7" },
  "one-shot-killer":  { emoji: "🎯", name: "One-Shot Killer",  description: "Landed a massive PR in a single commit" },
  "merge-addict":     { emoji: "💉", name: "Merge Addict",     description: "Merged PRs 5 days in a row" },
  "agent-maxxer":     { emoji: "⚡", name: "Agent Maxxer",     description: "Shipped 1000+ lines in a day" },
  "pr-goblin":        { emoji: "👺", name: "PR Goblin",        description: "Merged 10+ PRs in a week" },
  "3am-goblin":       { emoji: "🌙", name: "3AM Goblin",       description: "Pushed code between 2-5 AM" },
};

interface ProfileData {
  username: string;
  avatarUrl: string;
  bio: string | null;
  agentLines: number;
  vibeHours: number;
  streak: number;
  totalPRs: number;
  peakHour: string;
  badges: string[];
  badgeDetails: { slug: string; name: string; emoji: string; description: string }[];
  scores: { daily: number; weekly: number; allTime: number };
  ranks: { daily: number | null; weekly: number | null; allTime: number | null };
}

export default function UserProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params.username;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/user/${username}`)
      .then((res) => {
        if (!res.ok) { setNotFound(true); return null; }
        return res.json();
      })
      .then((data) => { if (data) setProfile(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted">Loading profile...</p>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <p className="font-mono text-4xl font-bold text-accent">404</p>
        <p className="mt-2 text-sm text-muted">User not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 pb-8 sm:flex-row sm:items-start">
        {profile.avatarUrl && (
          <Image
            src={profile.avatarUrl}
            alt={username}
            width={80}
            height={80}
            className="size-20 rounded-full"
          />
        )}
        <div className="text-center sm:text-left">
          <h1 className="text-balance text-xl font-bold text-foreground">{username}</h1>
          {profile.bio && (
            <p className="mt-1 max-w-md text-pretty text-sm text-muted">{profile.bio}</p>
          )}
          <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 font-mono text-xs tabular-nums text-dim sm:justify-start">
            <span>{profile.streak}d streak</span>
            <span>{profile.totalPRs} PRs merged</span>
            <span>Peak {profile.peakHour}</span>
          </div>
        </div>
      </div>

      {/* Score Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { score: profile.scores.daily, label: "Daily", rank: profile.ranks.daily },
          { score: profile.scores.weekly, label: "Weekly", rank: profile.ranks.weekly },
          { score: profile.scores.allTime, label: "All Time", rank: profile.ranks.allTime },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-surface p-5 text-center">
            <ScoreDisplay score={Math.round(card.score * 10) / 10} label={card.label} />
            {card.rank && (
              <p className="mt-2 font-mono text-xs tabular-nums text-dim">Rank #{card.rank}</p>
            )}
          </div>
        ))}
      </div>

      {/* Agent Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-surface p-5 text-center">
          <p className="font-mono text-2xl font-semibold tabular-nums text-accent">
            {profile.agentLines.toLocaleString()}
          </p>
          <p className="mt-1.5 text-xs font-medium text-dim uppercase">Agent lines shipped</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5 text-center">
          <p className="font-mono text-2xl font-semibold tabular-nums text-accent">~{profile.vibeHours}h</p>
          <p className="mt-1.5 text-xs font-medium text-dim uppercase">Est. vibe-coding time</p>
        </div>
      </div>

      {/* Badges */}
      <section>
        <h2 className="mb-3 text-[0.6875rem] font-semibold text-dim uppercase">Badges</h2>
        {profile.badgeDetails && profile.badgeDetails.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.badgeDetails.map((badge) => (
              <span
                key={badge.slug}
                title={badge.description}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-muted"
              >
                <span className="text-base leading-none">{badge.emoji}</span>
                <span className="font-medium">{badge.name}</span>
              </span>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface px-4 py-8 text-center">
            <p className="text-sm text-muted">No badges earned yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}
