"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { BADGE_CATALOG } from "@/lib/mock-data";

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
  scores: { daily: number; weekly: number; allTime: number };
  ranks: { daily: number | null; weekly: number | null; allTime: number | null };
}

interface ProfileModalProps {
  profile: ProfileData | null;
  onClose: () => void;
}

export default function ProfileModal({ profile, onClose }: ProfileModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [profile, onClose]);

  if (!profile) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111111]">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-accent/40" />

        <div className="p-6">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-4 top-5 cursor-pointer rounded-lg p-1 text-dim transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close profile"
          >
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image
                src={profile.avatarUrl}
                alt={profile.username}
                width={56}
                height={56}
                className="size-14 rounded-full ring-2 ring-accent/30 ring-offset-2 ring-offset-[#111111]"
              />
              {profile.ranks.allTime && profile.ranks.allTime <= 3 && (
                <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[#111111] text-xs">
                  {profile.ranks.allTime === 1 ? "🥇" : profile.ranks.allTime === 2 ? "🥈" : "🥉"}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{profile.username}</h2>
              {profile.bio && (
                <p className="mt-0.5 text-sm text-muted">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Bento grid */}
          <div className="mt-5 grid grid-cols-4 gap-2">
            {/* Agent lines — spans 2 cols, tall */}
            <div className="col-span-2 row-span-2 flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <p className="font-mono text-3xl font-semibold tabular-nums text-accent">
                {profile.agentLines.toLocaleString()}
              </p>
              <p className="mt-1.5 text-[0.625rem] font-medium text-dim uppercase">
                Agent lines shipped
              </p>
            </div>

            {/* Vibe time */}
            <div className="col-span-2 flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="font-mono text-xl font-semibold tabular-nums text-accent">~{profile.vibeHours}h</p>
              <p className="mt-1 text-[0.625rem] font-medium text-dim uppercase">Vibe time</p>
            </div>

            {/* Quick stats row */}
            <div className="col-span-2 flex items-center justify-around rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3">
              <div className="text-center">
                <p className="font-mono text-sm font-semibold tabular-nums text-white">{profile.streak}d</p>
                <p className="text-[0.5625rem] text-dim uppercase">Streak</p>
              </div>
              <div className="h-6 w-px bg-white/[0.06]" />
              <div className="text-center">
                <p className="font-mono text-sm font-semibold tabular-nums text-white">{profile.totalPRs}</p>
                <p className="text-[0.5625rem] text-dim uppercase">PRs</p>
              </div>
              <div className="h-6 w-px bg-white/[0.06]" />
              <div className="text-center">
                <p className="font-mono text-sm font-semibold tabular-nums text-white">{profile.peakHour.replace(" UTC", "")}</p>
                <p className="text-[0.5625rem] text-dim uppercase">Peak</p>
              </div>
            </div>

            {/* Score tiles — 3 small cells spanning full width */}
            {[
              { value: profile.scores.daily, label: "Daily", rank: profile.ranks.daily },
              { value: profile.scores.weekly, label: "Weekly", rank: profile.ranks.weekly },
            ].map((s) => (
              <div key={s.label} className="col-span-2 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <div>
                  <p className="text-[0.5625rem] font-medium text-dim uppercase">{s.label}</p>
                  {s.rank && <p className="font-mono text-[0.625rem] tabular-nums text-dim">#{s.rank}</p>}
                </div>
                <p className="font-mono text-lg font-semibold tabular-nums text-accent">
                  {Math.round(s.value * 10) / 10}
                </p>
              </div>
            ))}

            {/* All time — full width highlight */}
            <div className="col-span-4 flex items-center justify-between rounded-xl border border-accent/20 bg-accent/[0.04] px-4 py-3">
              <div>
                <p className="text-[0.5625rem] font-medium text-dim uppercase">All Time</p>
                {profile.ranks.allTime && <p className="font-mono text-[0.625rem] tabular-nums text-dim">#{profile.ranks.allTime}</p>}
              </div>
              <p className="font-mono text-2xl font-semibold tabular-nums text-accent">
                {Math.round(profile.scores.allTime * 10) / 10}
              </p>
            </div>
          </div>

          {/* Badges */}
          {profile.badges.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {profile.badges.map((slug) => {
                const badge = BADGE_CATALOG[slug];
                if (!badge) return null;
                return (
                  <span
                    key={slug}
                    title={badge.description}
                    className="inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-xs font-medium text-muted"
                  >
                    <span className="leading-none">{badge.emoji}</span>
                    {badge.name}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
