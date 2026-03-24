"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useTheme } from "@/lib/theme-context";
import ProfileModal from "./profile-modal";

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

function cardClass(cards: string): string {
  switch (cards) {
    case "bordered": return "border border-border";
    case "filled": return "bg-surface";
    case "shadow": return "shadow-md shadow-black/20";
    case "thick": return "border-2 border-border";
    case "none":
    default: return "";
  }
}

function radiusClass(radius: string, variant: "row" | "card"): string {
  switch (radius) {
    case "rounded": return variant === "card" ? "rounded-xl" : "rounded-lg";
    case "pill": return "rounded-2xl";
    case "sharp":
    default: return "";
  }
}

function densityPadding(density: string, base: "row" | "card" | "tile"): string {
  if (base === "row") {
    switch (density) {
      case "compact": return "px-3 py-2";
      case "spacious": return "px-5 py-4";
      default: return "px-4 py-3";
    }
  }
  if (base === "card") {
    switch (density) {
      case "compact": return "p-3";
      case "spacious": return "p-6";
      default: return "p-4";
    }
  }
  // tile
  switch (density) {
    case "compact": return "p-3 gap-3";
    case "spacious": return "p-6 gap-5";
    default: return "p-4 gap-4";
  }
}

function densityGap(density: string): string {
  switch (density) {
    case "compact": return "gap-1";
    case "spacious": return "gap-3";
    default: return "gap-2";
  }
}

// ─── Badges renderer ───────────────────────────────────────────

function BadgeList({ badges, max = 3 }: { badges: string[]; max?: number }) {
  return (
    <>
      {badges.slice(0, max).map((slug) => {
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
      {badges.length > max && (
        <span className="text-xs text-dim">+{badges.length - max}</span>
      )}
    </>
  );
}

// ─── TABLE layout ──────────────────────────────────────────────

function TableLayout({
  entries,
  cards,
  radius,
  density,
  onSelect,
}: {
  entries: LeaderboardEntry[];
  cards: string;
  radius: string;
  density: string;
  onSelect: (username: string) => void;
}) {
  return (
    <div>
      {/* Desktop header */}
      <div className="hidden items-center border-b border-border px-4 py-2 text-[0.6875rem] font-medium text-dim uppercase sm:flex">
        <span className="w-12">#</span>
        <span className="flex-1">User</span>
        <span className="w-24 text-right">Agent Lines</span>
        <span className="w-16 text-right">Streak</span>
        <span className="w-24 text-right">Badges</span>
      </div>

      <div className={`flex flex-col ${densityGap(density)} py-1`}>
        {entries.map((entry) => (
          <button
            key={entry.username}
            type="button"
            onClick={() => onSelect(entry.username)}
            className={[
              "flex w-full cursor-pointer items-center text-left transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset",
              densityPadding(density, "row"),
              radiusClass(radius, "row"),
              entry.rank <= 3
                ? `border-accent/20 bg-accent-muted ${cards === "none" ? "border" : cardClass(cards)}`
                : cardClass(cards) || "border border-border",
            ].join(" ")}
          >
            {/* Rank */}
            <span className={`w-12 shrink-0 font-mono text-sm font-semibold tabular-nums ${rankColor[entry.rank] ?? "text-dim"}`}>
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

            {/* Streak */}
            <span className="hidden w-16 shrink-0 text-right font-mono text-sm tabular-nums text-muted sm:block">
              {entry.streak > 0 ? `${entry.streak}d` : "-"}
            </span>

            {/* Badges */}
            <span className="hidden w-24 shrink-0 items-center justify-end gap-1.5 sm:flex">
              <BadgeList badges={entry.badges} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── CARDS layout ──────────────────────────────────────────────

function CardsLayout({
  entries,
  cards,
  radius,
  density,
  onSelect,
}: {
  entries: LeaderboardEntry[];
  cards: string;
  radius: string;
  density: string;
  onSelect: (username: string) => void;
}) {
  const gridGap = density === "compact" ? "gap-2" : density === "spacious" ? "gap-5" : "gap-3";

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridGap}`}>
      {entries.map((entry) => (
        <button
          key={entry.username}
          type="button"
          onClick={() => onSelect(entry.username)}
          className={[
            "flex flex-col items-center text-center cursor-pointer transition-colors hover:bg-surface/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset",
            densityPadding(density, "card"),
            radiusClass(radius, "card"),
            entry.rank <= 3
              ? `bg-accent-muted ${cardClass(cards) || "border border-accent/20"}`
              : cardClass(cards) || "",
          ].join(" ")}
        >
          {/* Rank badge */}
          <span className={`font-mono text-xs font-bold tabular-nums mb-2 ${rankColor[entry.rank] ?? "text-dim"}`}>
            #{entry.rank}
          </span>

          {/* Avatar */}
          {entry.avatarUrl && (
            <Image
              src={entry.avatarUrl}
              alt={entry.username}
              width={48}
              height={48}
              className="size-12 rounded-full mb-2"
            />
          )}

          {/* Username */}
          <span className="text-sm font-semibold text-foreground truncate max-w-full">
            {entry.username}
          </span>

          {/* Agent lines — prominent */}
          <span className="font-mono text-2xl font-bold tabular-nums text-accent mt-1">
            {formatLines(entry.agentLines)}
          </span>
          <span className="text-[0.625rem] text-dim uppercase tracking-wider mt-0.5">
            agent lines
          </span>

          {/* Streak */}
          {entry.streak > 0 && (
            <span className="text-xs text-muted mt-2">
              {entry.streak}d streak
            </span>
          )}

          {/* Badges */}
          {entry.badges.length > 0 && (
            <span className="flex items-center gap-1.5 mt-2">
              <BadgeList badges={entry.badges} />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── COMPACT layout ────────────────────────────────────────────

function CompactLayout({
  entries,
  cards,
  radius,
  onSelect,
}: {
  entries: LeaderboardEntry[];
  cards: string;
  radius: string;
  onSelect: (username: string) => void;
}) {
  return (
    <div className={radiusClass(radius, "row")}>
      {/* Header */}
      <div className="flex items-center border-b border-border px-3 py-1.5 text-[0.625rem] font-medium text-dim uppercase tracking-wider">
        <span className="w-8 shrink-0">#</span>
        <span className="flex-1">User</span>
        <span className="w-20 text-right">Lines</span>
        <span className="hidden w-14 text-right sm:block">Streak</span>
      </div>

      {/* Rows */}
      {entries.map((entry, idx) => (
        <button
          key={entry.username}
          type="button"
          onClick={() => onSelect(entry.username)}
          className={[
            "flex w-full items-center cursor-pointer px-3 py-1.5 text-left transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-inset",
            idx < entries.length - 1 ? "border-b border-border" : "",
            entry.rank <= 3 ? "bg-accent-muted" : "",
            // no radius on individual rows in compact — the outer wrapper gets it
          ].join(" ")}
        >
          {/* Rank */}
          <span className={`w-8 shrink-0 font-mono text-xs font-semibold tabular-nums ${rankColor[entry.rank] ?? "text-dim"}`}>
            {entry.rank}
          </span>

          {/* Username — no avatar */}
          <span className="flex-1 truncate text-xs font-medium text-foreground">
            {entry.username}
          </span>

          {/* Agent lines */}
          <span className="w-20 shrink-0 text-right font-mono text-xs font-semibold tabular-nums text-accent">
            {formatLines(entry.agentLines)}
          </span>

          {/* Streak */}
          <span className="hidden w-14 shrink-0 text-right font-mono text-xs tabular-nums text-muted sm:block">
            {entry.streak > 0 ? `${entry.streak}d` : "-"}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── TILES layout ──────────────────────────────────────────────

function TilesLayout({
  entries,
  cards,
  radius,
  density,
  onSelect,
}: {
  entries: LeaderboardEntry[];
  cards: string;
  radius: string;
  density: string;
  onSelect: (username: string) => void;
}) {
  const gridGap = density === "compact" ? "gap-2" : density === "spacious" ? "gap-5" : "gap-3";

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridGap}`}>
      {entries.map((entry) => (
        <button
          key={entry.username}
          type="button"
          onClick={() => onSelect(entry.username)}
          className={[
            "flex items-center cursor-pointer text-left transition-colors hover:bg-surface/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset",
            densityPadding(density, "tile"),
            radiusClass(radius, "card"),
            entry.rank <= 3
              ? `bg-accent-muted ${cardClass(cards) || "border border-accent/20"}`
              : cardClass(cards) || "",
          ].join(" ")}
        >
          {/* Avatar — large */}
          {entry.avatarUrl && (
            <Image
              src={entry.avatarUrl}
              alt={entry.username}
              width={48}
              height={48}
              className="size-12 shrink-0 rounded-full"
            />
          )}

          {/* Content */}
          <div className="flex flex-col min-w-0 flex-1">
            {/* Top row: username + rank */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground truncate">
                {entry.username}
              </span>
              <span className={`font-mono text-xs font-semibold tabular-nums ${rankColor[entry.rank] ?? "text-dim"}`}>
                #{entry.rank}
              </span>
            </div>

            {/* Agent lines — big number */}
            <span className="font-mono text-xl font-bold tabular-nums text-accent leading-tight mt-0.5">
              {formatLines(entry.agentLines)}
              <span className="text-[0.625rem] font-normal text-dim ml-1">lines</span>
            </span>

            {/* Bottom: badges + streak */}
            <div className="flex items-center gap-2 mt-1">
              {entry.badges.length > 0 && (
                <span className="flex items-center gap-1">
                  <BadgeList badges={entry.badges} max={3} />
                </span>
              )}
              {entry.streak > 0 && (
                <span className="text-[0.625rem] text-muted">
                  {entry.streak}d streak
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── MINIMAL layout ────────────────────────────────────────────

function MinimalLayout({
  entries,
  density,
  onSelect,
}: {
  entries: LeaderboardEntry[];
  density: string;
  onSelect: (username: string) => void;
}) {
  const py = density === "compact" ? "py-0.5" : density === "spacious" ? "py-2" : "py-1";

  return (
    <div className="flex flex-col font-mono">
      {entries.map((entry) => (
        <button
          key={entry.username}
          type="button"
          onClick={() => onSelect(entry.username)}
          className={`block w-full text-left cursor-pointer ${py} text-sm text-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent`}
        >
          <span className={`tabular-nums ${rankColor[entry.rank] ?? "text-dim"}`}>
            {entry.rank}.
          </span>{" "}
          <span className="font-medium">{entry.username}</span>
          <span className="text-dim"> — </span>
          <span className="tabular-nums text-accent">{formatLines(entry.agentLines)}</span>
          <span className="text-dim"> lines</span>
        </button>
      ))}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────

export default function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const theme = useTheme();
  const { rows, cards, radius, density } = theme.layout;

  const [selectedProfile, setSelectedProfile] = useState<Parameters<typeof ProfileModal>[0]["profile"]>(null);

  const openProfile = useCallback((username: string) => {
    fetch(`/api/user/${username}`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setSelectedProfile({
          username: data.username,
          avatarUrl: data.avatarUrl,
          bio: data.bio,
          agentLines: data.agentLines,
          vibeHours: data.vibeHours,
          streak: data.streak,
          totalPRs: data.totalPRs,
          peakHour: data.peakHour,
          badges: data.badges,
          scores: data.scores,
          ranks: data.ranks,
        });
      })
      .catch((err) => console.error("Failed to fetch user profile:", err));
  }, []);

  return (
    <>
      {rows === "table" && (
        <TableLayout
          entries={entries}
          cards={cards}
          radius={radius}
          density={density}
          onSelect={openProfile}
        />
      )}

      {rows === "cards" && (
        <CardsLayout
          entries={entries}
          cards={cards}
          radius={radius}
          density={density}
          onSelect={openProfile}
        />
      )}

      {rows === "compact" && (
        <CompactLayout
          entries={entries}
          cards={cards}
          radius={radius}
          onSelect={openProfile}
        />
      )}

      {rows === "tiles" && (
        <TilesLayout
          entries={entries}
          cards={cards}
          radius={radius}
          density={density}
          onSelect={openProfile}
        />
      )}

      {rows === "minimal" && (
        <MinimalLayout
          entries={entries}
          density={density}
          onSelect={openProfile}
        />
      )}

      <ProfileModal
        profile={selectedProfile}
        onClose={() => setSelectedProfile(null)}
      />
    </>
  );
}
