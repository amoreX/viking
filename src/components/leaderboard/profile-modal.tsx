"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useTheme } from "@/lib/theme-context";

const BADGE_CATALOG: Record<string, { emoji: string; name: string; description: string }> = {
  "vibe-lord":        { emoji: "\u{1F451}", name: "Vibe Lord",        description: "Hit #1 on the daily leaderboard" },
  "locked-in":        { emoji: "\u{1F512}", name: "Locked In",        description: "7-day coding streak" },
  "boilerplate-beast":{ emoji: "\u{1F916}", name: "Boilerplate Beast",description: "Average AI-likelihood above 0.7" },
  "one-shot-killer":  { emoji: "\u{1F3AF}", name: "One-Shot Killer",  description: "Landed a massive PR in a single commit" },
  "merge-addict":     { emoji: "\u{1F489}", name: "Merge Addict",     description: "Merged PRs 5 days in a row" },
  "agent-maxxer":     { emoji: "\u26A1",    name: "Agent Maxxer",     description: "Shipped 1000+ lines in a day" },
  "pr-goblin":        { emoji: "\u{1F47A}", name: "PR Goblin",        description: "Merged 10+ PRs in a week" },
  "3am-goblin":       { emoji: "\u{1F319}", name: "3AM Goblin",       description: "Pushed code between 2-5 AM" },
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
  scores: { daily: number; weekly: number; allTime: number };
  ranks: { daily: number | null; weekly: number | null; allTime: number | null };
}

interface ProfileModalProps {
  profile: ProfileData | null;
  onClose: () => void;
}

// ── Shared helpers ───────────────────────────────────────

const MONO_THEME_IDS = new Set(["terminal", "mono", "brutalist"]);

function radiusClass(radius: "rounded" | "sharp" | "pill") {
  if (radius === "sharp") return "rounded-none";
  if (radius === "pill") return "rounded-3xl";
  return "rounded-2xl";
}

function cardBorderClass(cards: string) {
  if (cards === "thick") return "border-2 border-border";
  if (cards === "bordered") return "border border-border";
  if (cards === "shadow") return "border border-white/[0.08] shadow-lg";
  if (cards === "filled") return "border border-white/[0.06] bg-surface";
  // "none"
  return "border border-white/[0.08]";
}

function rankStr(rank: number | null) {
  return rank ? ` (#${rank})` : "";
}

function scoreStr(value: number) {
  return String(Math.round(value * 10) / 10);
}

// ── Close button (shared) ────────────────────────────────

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute right-4 top-5 cursor-pointer rounded-lg p-1 text-dim transition-colors hover:bg-white/5 hover:text-foreground"
      aria-label="Close profile"
    >
      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

// ── Badge row (shared) ───────────────────────────────────

function BadgeRow({ badges, compact }: { badges: string[]; compact?: boolean }) {
  if (badges.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-1.5 ${compact ? "mt-3" : "mt-4"}`}>
      {badges.map((slug) => {
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
  );
}

// ── BENTO layout ─────────────────────────────────────────

function BentoLayout({ profile, onClose }: { profile: ProfileData; onClose: () => void }) {
  return (
    <>
      {/* Top accent bar */}
      <div className="h-1 w-full bg-accent/40" />

      <div className="p-6">
        <CloseButton onClick={onClose} />

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Image
              src={profile.avatarUrl}
              alt={profile.username}
              width={56}
              height={56}
              className="size-14 rounded-full ring-2 ring-accent/30 ring-offset-2 ring-offset-[var(--background)]"
            />
            {profile.ranks.allTime && profile.ranks.allTime <= 3 && (
              <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[var(--background)] text-xs">
                {profile.ranks.allTime === 1 ? "\u{1F947}" : profile.ranks.allTime === 2 ? "\u{1F948}" : "\u{1F949}"}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{profile.username}</h2>
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
              <p className="font-mono text-sm font-semibold tabular-nums text-foreground">{profile.streak}d</p>
              <p className="text-[0.5625rem] text-dim uppercase">Streak</p>
            </div>
            <div className="h-6 w-px bg-white/[0.06]" />
            <div className="text-center">
              <p className="font-mono text-sm font-semibold tabular-nums text-foreground">{profile.totalPRs}</p>
              <p className="text-[0.5625rem] text-dim uppercase">PRs</p>
            </div>
            <div className="h-6 w-px bg-white/[0.06]" />
            <div className="text-center">
              <p className="font-mono text-sm font-semibold tabular-nums text-foreground">{profile.peakHour.replace(" UTC", "")}</p>
              <p className="text-[0.5625rem] text-dim uppercase">Peak</p>
            </div>
          </div>

          {/* Score tiles */}
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
                {scoreStr(s.value)}
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
              {scoreStr(profile.scores.allTime)}
            </p>
          </div>
        </div>

        {/* Badges */}
        <BadgeRow badges={profile.badges} />
      </div>
    </>
  );
}

// ── MINIMAL layout ───────────────────────────────────────

function MinimalLayout({
  profile,
  onClose,
  mono,
}: {
  profile: ProfileData;
  onClose: () => void;
  mono: boolean;
}) {
  const fontCls = mono ? "font-mono" : "";
  return (
    <div className={`p-5 ${fontCls}`}>
      <CloseButton onClick={onClose} />

      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <Image
          src={profile.avatarUrl}
          alt={profile.username}
          width={40}
          height={40}
          className="size-10 rounded-full ring-1 ring-accent/30"
        />
        <div>
          <h2 className="text-base font-bold text-foreground">{profile.username}</h2>
          {profile.bio && (
            <p className="mt-0.5 text-xs text-muted">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Stat lines */}
      <div className="mt-4 space-y-2 text-sm text-foreground">
        <p>
          <span className="text-dim">Agent Lines:</span>{" "}
          {profile.agentLines.toLocaleString()}
        </p>
        <p>
          <span className="text-dim">Vibe Time:</span> ~{profile.vibeHours}h
        </p>
        <p>
          <span className="text-dim">Streak:</span> {profile.streak}d
        </p>
        <p>
          <span className="text-dim">Daily:</span> {scoreStr(profile.scores.daily)}
          {rankStr(profile.ranks.daily)}{" "}
          <span className="text-dim">&middot;</span>{" "}
          <span className="text-dim">Weekly:</span> {scoreStr(profile.scores.weekly)}
          {rankStr(profile.ranks.weekly)}{" "}
          <span className="text-dim">&middot;</span>{" "}
          <span className="text-dim">All Time:</span> {scoreStr(profile.scores.allTime)}
          {rankStr(profile.ranks.allTime)}
        </p>
      </div>

      {/* Badges */}
      <BadgeRow badges={profile.badges} compact />
    </div>
  );
}

// ── WIDE layout ──────────────────────────────────────────

function WideLayout({ profile, onClose }: { profile: ProfileData; onClose: () => void }) {
  return (
    <div className="p-6">
      <CloseButton onClick={onClose} />

      <div className="grid grid-cols-[auto_1fr] gap-6">
        {/* Left column */}
        <div className="flex flex-col items-center text-center" style={{ width: 160 }}>
          <Image
            src={profile.avatarUrl}
            alt={profile.username}
            width={80}
            height={80}
            className="size-20 rounded-full ring-2 ring-accent/30 ring-offset-2 ring-offset-[var(--background)]"
          />
          <h2 className="mt-3 text-base font-bold text-foreground">{profile.username}</h2>
          {profile.bio && (
            <p className="mt-1 text-xs text-muted leading-snug">{profile.bio}</p>
          )}
          <BadgeRow badges={profile.badges} compact />
        </div>

        {/* Right column */}
        <div className="space-y-2.5">
          {/* Agent lines */}
          <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <p className="text-xs font-medium text-dim uppercase">Agent Lines</p>
            <p className="font-mono text-xl font-semibold tabular-nums text-accent">
              {profile.agentLines.toLocaleString()}
            </p>
          </div>

          {/* Vibe time */}
          <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <p className="text-xs font-medium text-dim uppercase">Vibe Time</p>
            <p className="font-mono text-xl font-semibold tabular-nums text-accent">
              ~{profile.vibeHours}h
            </p>
          </div>

          {/* Streak + PRs + Peak row */}
          <div className="flex gap-2">
            {[
              { label: "Streak", value: `${profile.streak}d` },
              { label: "PRs", value: String(profile.totalPRs) },
              { label: "Peak", value: profile.peakHour.replace(" UTC", "") },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-1 flex-col items-center rounded-lg border border-white/[0.06] bg-white/[0.02] py-2.5"
              >
                <p className="font-mono text-sm font-semibold tabular-nums text-foreground">{s.value}</p>
                <p className="text-[0.5625rem] text-dim uppercase">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Score tiles */}
          {[
            { label: "Daily", value: profile.scores.daily, rank: profile.ranks.daily },
            { label: "Weekly", value: profile.scores.weekly, rank: profile.ranks.weekly },
            { label: "All Time", value: profile.scores.allTime, rank: profile.ranks.allTime },
          ].map((s) => (
            <div
              key={s.label}
              className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                s.label === "All Time"
                  ? "border border-accent/20 bg-accent/[0.04]"
                  : "border border-white/[0.06] bg-white/[0.02]"
              }`}
            >
              <div>
                <p className="text-[0.5625rem] font-medium text-dim uppercase">{s.label}</p>
                {s.rank && <p className="font-mono text-[0.625rem] tabular-nums text-dim">#{s.rank}</p>}
              </div>
              <p className={`font-mono font-semibold tabular-nums text-accent ${s.label === "All Time" ? "text-2xl" : "text-lg"}`}>
                {scoreStr(s.value)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────

export default function ProfileModal({ profile, onClose }: ProfileModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

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

  const { modal, cards, radius } = theme.layout;
  const isMono = MONO_THEME_IDS.has(theme.id);

  // Width class per layout
  const widthClass =
    modal === "minimal" ? "max-w-sm" : modal === "wide" ? "max-w-xl" : "max-w-lg";

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div
        className={`relative w-full overflow-hidden bg-[var(--background)] ${widthClass} ${radiusClass(radius)} ${cardBorderClass(cards)}`}
      >
        {modal === "bento" && (
          <BentoLayout profile={profile} onClose={onClose} />
        )}
        {modal === "minimal" && (
          <MinimalLayout profile={profile} onClose={onClose} mono={isMono} />
        )}
        {modal === "wide" && (
          <WideLayout profile={profile} onClose={onClose} />
        )}
      </div>
    </div>
  );
}
