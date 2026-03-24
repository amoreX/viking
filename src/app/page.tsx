"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useTheme } from "@/lib/theme-context";
import { useAuthStore } from "@/lib/store";

// ── Badge catalog (inline to avoid mock-data import) ─────────
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

// ── Types ────────────────────────────────────────────────────
interface TopUser {
  rank: number;
  username: string;
  avatarUrl: string;
  vibeScore: number;
  badges: string[];
}

interface StatsData {
  vibecoders: number;
  agentLines: number;
  vibeHours: number;
}

// ── Helpers ──────────────────────────────────────────────────

function cardClass(cards: string, isLight: boolean) {
  switch (cards) {
    case "bordered":
      return "border border-border";
    case "filled":
      return "bg-surface";
    case "shadow":
      return isLight ? "shadow-sm" : "shadow-md shadow-black/20";
    case "thick":
      return "border-2 border-border";
    case "none":
    default:
      return "";
  }
}

function radiusCard(radius: string) {
  switch (radius) {
    case "pill":
      return "rounded-2xl";
    case "sharp":
      return "rounded-none";
    default:
      return "rounded-xl";
  }
}

function radiusButton(radius: string) {
  switch (radius) {
    case "pill":
      return "rounded-full";
    case "sharp":
      return "rounded-sm";
    default:
      return "rounded-lg";
  }
}

function heroPadding(density: string) {
  switch (density) {
    case "compact":
      return "py-16 sm:py-20";
    case "spacious":
      return "py-24 sm:py-36";
    default:
      return "py-20 sm:py-28";
  }
}

function statsGap(density: string) {
  switch (density) {
    case "compact":
      return "gap-3";
    case "spacious":
      return "gap-6";
    default:
      return "gap-4";
  }
}

// ── Shared sub-components ────────────────────────────────────

const GitHubIcon = () => (
  <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

function CTAButton({ radius, loggedIn, children, className = "" }: { radius: string; loggedIn: boolean; children: React.ReactNode; className?: string }) {
  if (loggedIn) {
    return (
      <Link
        href="/leaderboard"
        className={`inline-flex h-11 items-center gap-2 bg-accent px-6 text-sm font-semibold text-black transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${radiusButton(radius)} ${className}`}
      >
        {children}
      </Link>
    );
  }

  return (
    <a
      href="/api/auth/github"
      className={`inline-flex h-11 items-center gap-2 bg-accent px-6 text-sm font-semibold text-black transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${radiusButton(radius)} ${className}`}
    >
      <GitHubIcon />
      {children}
    </a>
  );
}

function LeaderboardPreview({
  card,
  radius,
  isLight,
  topUsers,
}: {
  card: string;
  radius: string;
  isLight: boolean;
  topUsers: TopUser[];
}) {
  return (
    <div>
      <h2 className="mb-4 text-[0.6875rem] font-semibold text-dim uppercase">
        Top Vibecoders
      </h2>
      <div className={`${radiusCard(radius)} ${cardClass(card, isLight)} p-1`}>
        {topUsers.map((user) => (
          <div
            key={user.username}
            className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-white/[0.03]"
          >
            <span
              className={`w-6 font-mono text-sm font-semibold tabular-nums ${
                user.rank === 1
                  ? "text-yellow-400"
                  : user.rank === 2
                    ? "text-neutral-400"
                    : user.rank === 3
                      ? "text-orange-400"
                      : "text-dim"
              }`}
            >
              {user.rank}
            </span>
            <Image
              src={user.avatarUrl}
              alt={user.username}
              width={28}
              height={28}
              className="size-7 rounded-full"
            />
            <Link
              href={`/user/${user.username}`}
              className="flex-1 truncate text-sm font-medium text-foreground hover:text-accent"
            >
              {user.username}
            </Link>
            <div className="flex items-center gap-1.5">
              {user.badges.slice(0, 2).map((slug) => {
                const badge = BADGE_CATALOG[slug];
                if (!badge) return null;
                return (
                  <span key={slug} title={badge.name} className="text-sm leading-none">
                    {badge.emoji}
                  </span>
                );
              })}
            </div>
            <span className="font-mono text-sm font-semibold tabular-nums text-accent">
              {user.vibeScore}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Link
          href="/leaderboard"
          className="text-sm font-medium text-muted transition-colors hover:text-accent"
        >
          View full leaderboard &rarr;
        </Link>
      </div>
    </div>
  );
}

function StatsSection({
  mode,
  card,
  radius,
  density,
  isLight,
  stats,
}: {
  mode: string;
  card: string;
  radius: string;
  density: string;
  isLight: boolean;
  stats: StatsData;
}) {
  const statItems = [
    { value: stats.vibecoders.toLocaleString(), label: "Vibecoders ranked" },
    { value: `${(stats.agentLines / 1_000_000).toFixed(1)}M`, label: "Agent lines shipped" },
    { value: `${(stats.vibeHours / 1000).toFixed(1)}k`, label: "Hours vibe-coded" },
  ];

  if (mode === "hidden") return null;

  if (mode === "inline") {
    return (
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <p className="text-center text-sm text-muted">
          {stats.vibecoders.toLocaleString()} ranked &middot;{" "}
          {(stats.agentLines / 1_000_000).toFixed(1)}M lines &middot;{" "}
          {(stats.vibeHours / 1000).toFixed(1)}k hours
        </p>
      </section>
    );
  }

  // "cards" mode
  return (
    <section
      className={`mx-auto grid max-w-3xl grid-cols-1 px-4 pb-20 sm:grid-cols-3 ${statsGap(density)}`}
    >
      {statItems.map((stat) => (
        <div
          key={stat.label}
          className={`${radiusCard(radius)} ${cardClass(card, isLight)} p-6 text-center`}
        >
          <p className="font-mono text-3xl font-semibold tabular-nums text-accent">
            {stat.value}
          </p>
          <p className="mt-1.5 text-xs font-medium text-dim uppercase">{stat.label}</p>
        </div>
      ))}
    </section>
  );
}

// ── Hero Layouts ─────────────────────────────────────────────

function HeroCentered({ radius, loggedIn }: { radius: string; loggedIn: boolean }) {
  return (
    <>
      <h1 className="text-balance text-7xl font-bold text-accent sm:text-8xl">VIKING</h1>
      <p className="mt-4 text-balance text-lg font-medium text-foreground sm:text-xl">
        The leaderboard for vibecoders
      </p>
      <p className="mt-3 max-w-lg text-pretty text-[0.9375rem] leading-relaxed text-muted">
        Connect your GitHub. We estimate how many lines your AI agents shipped, score your
        vibe-coded output, and rank you against other developers. Who&rsquo;s the most locked-in
        vibecoder today?
      </p>
      <div className="mt-8">
        <CTAButton radius={radius} loggedIn={loggedIn}>
          {loggedIn ? "Go to Leaderboard" : "Sign in with GitHub"}
        </CTAButton>
      </div>
    </>
  );
}

function HeroLeft({
  radius,
  card,
  isLight,
  loggedIn,
  topUsers,
}: {
  radius: string;
  card: string;
  isLight: boolean;
  loggedIn: boolean;
  topUsers: TopUser[];
}) {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-12 lg:grid-cols-2">
      <div className="text-left">
        <h1 className="text-balance text-6xl font-bold text-accent sm:text-7xl">VIKING</h1>
        <p className="mt-4 text-lg font-medium text-foreground sm:text-xl">
          The leaderboard for vibecoders
        </p>
        <p className="mt-3 max-w-xl text-pretty text-[0.9375rem] leading-relaxed text-muted">
          Connect your GitHub. We estimate how many lines your AI agents shipped, score your
          vibe-coded output, and rank you against other developers. Who&rsquo;s the most locked-in
          vibecoder today?
        </p>
        <div className="mt-8">
          <CTAButton radius={radius} loggedIn={loggedIn}>
            {loggedIn ? "Go to Leaderboard" : "Sign in with GitHub"}
          </CTAButton>
        </div>
      </div>
      <div className="hidden lg:block">
        <LeaderboardPreview card={card} radius={radius} isLight={isLight} topUsers={topUsers} />
      </div>
    </div>
  );
}

function HeroSplit({
  radius,
  card,
  isLight,
  loggedIn,
  topUsers,
}: {
  radius: string;
  card: string;
  isLight: boolean;
  loggedIn: boolean;
  topUsers: TopUser[];
}) {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
      <div className="text-left">
        <h1 className="text-balance text-5xl font-bold text-accent sm:text-6xl">VIKING</h1>
        <p className="mt-4 text-lg font-medium text-foreground">
          The leaderboard for vibecoders
        </p>
        <div className="mt-8">
          <CTAButton radius={radius} loggedIn={loggedIn}>
            {loggedIn ? "Go to Leaderboard" : "Sign in with GitHub"}
          </CTAButton>
        </div>
      </div>
      <div>
        <LeaderboardPreview card={card} radius={radius} isLight={isLight} topUsers={topUsers} />
      </div>
    </div>
  );
}

function HeroMinimal({ radius, loggedIn }: { radius: string; loggedIn: boolean }) {
  return (
    <>
      <h1 className="text-balance text-6xl font-bold text-accent sm:text-8xl">VIKING</h1>
      <p className="mt-6 text-lg text-muted">Rank your vibe-coded output.</p>
      <div className="mt-10">
        <CTAButton radius={radius} loggedIn={loggedIn}>
          {loggedIn ? "Go to Leaderboard" : "Sign in with GitHub"}
        </CTAButton>
      </div>
    </>
  );
}

function HeroTerminal({ radius, loggedIn, stats }: { radius: string; loggedIn: boolean; stats: StatsData }) {
  return (
    <div className="mx-auto max-w-xl text-left font-mono">
      <p className="text-2xl font-bold text-accent sm:text-3xl">$ viking --leaderboard</p>
      <div className="mt-6 space-y-2 text-sm text-muted">
        <p>&rarr; {stats.vibecoders.toLocaleString()} vibecoders tracked</p>
        <p>
          &rarr; {(stats.agentLines / 1_000_000).toFixed(1)}M agent lines shipped
        </p>
        <p>&rarr; {(stats.vibeHours / 1000).toFixed(1)}k hours vibe-coded</p>
      </div>
      <div className="mt-8">
        {loggedIn ? (
          <Link
            href="/leaderboard"
            className={`inline-flex h-11 items-center gap-2 bg-accent px-6 font-mono text-sm font-semibold text-black transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${radiusButton(radius)}`}
          >
            $ go-to-leaderboard
          </Link>
        ) : (
          <a
            href="/api/auth/github"
            className={`inline-flex h-11 items-center gap-2 bg-accent px-6 font-mono text-sm font-semibold text-black transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${radiusButton(radius)}`}
          >
            <GitHubIcon />
            $ sign-in --github
          </a>
        )}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────

export default function Home() {
  const theme = useTheme();
  const { hero, cards, density, radius, stats: statsMode } = theme.layout;
  const isLight = theme.category === "light";
  const { user } = useAuthStore();
  const loggedIn = !!user;

  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [stats, setStats] = useState<StatsData>({ vibecoders: 0, agentLines: 0, vibeHours: 0 });

  useEffect(() => {
    fetch("/api/leaderboard?period=alltime&limit=5")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTopUsers(data);
          // Compute stats from the full leaderboard entries
          const totalAgentLines = data.reduce((sum: number, u: any) => sum + (u.agentLines ?? 0), 0);
          const totalVibeHours = data.reduce((sum: number, u: any) => sum + (u.vibeHours ?? 0), 0);
          setStats({
            vibecoders: data.length,
            agentLines: totalAgentLines,
            vibeHours: totalVibeHours,
          });
        }
      })
      .catch(() => {});

    // Also fetch total count for stats
    fetch("/api/leaderboard?period=alltime&limit=100")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const totalAgentLines = data.reduce((sum: number, u: any) => sum + (u.agentLines ?? 0), 0);
          const totalVibeHours = data.reduce((sum: number, u: any) => sum + (u.vibeHours ?? 0), 0);
          setStats({
            vibecoders: data.length,
            agentLines: totalAgentLines,
            vibeHours: totalVibeHours,
          });
        }
      })
      .catch(() => {});
  }, []);

  const isCenteredStyle = hero === "centered" || hero === "minimal";
  const heroAlign = isCenteredStyle || hero === "terminal" ? "items-center text-center" : "";

  return (
    <div className="min-h-dvh">
      {/* Hero */}
      <section
        className={`flex flex-col justify-center px-4 ${heroPadding(density)} ${heroAlign}`}
      >
        {hero === "centered" && <HeroCentered radius={radius} loggedIn={loggedIn} />}
        {hero === "left" && <HeroLeft radius={radius} card={cards} isLight={isLight} loggedIn={loggedIn} topUsers={topUsers} />}
        {hero === "split" && <HeroSplit radius={radius} card={cards} isLight={isLight} loggedIn={loggedIn} topUsers={topUsers} />}
        {hero === "minimal" && <HeroMinimal radius={radius} loggedIn={loggedIn} />}
        {hero === "terminal" && <HeroTerminal radius={radius} loggedIn={loggedIn} stats={stats} />}
      </section>

      {/* Leaderboard preview -- centered layout shows it below the hero */}
      {hero === "centered" && (
        <section className="mx-auto max-w-2xl px-4 pb-16 text-center">
          <LeaderboardPreview card={cards} radius={radius} isLight={isLight} topUsers={topUsers} />
        </section>
      )}

      {/* Left layout shows leaderboard on mobile below (hidden on lg where it's in the sidebar) */}
      {hero === "left" && (
        <section className="mx-auto max-w-2xl px-4 pb-16 lg:hidden">
          <LeaderboardPreview card={cards} radius={radius} isLight={isLight} topUsers={topUsers} />
        </section>
      )}

      {/* Stats */}
      <StatsSection
        mode={statsMode}
        card={cards}
        radius={radius}
        density={density}
        isLight={isLight}
        stats={stats}
      />

      {/* Disclaimer */}
      <section className="border-t border-border px-4 py-10 text-center">
        <p className="mx-auto max-w-md text-pretty text-xs leading-relaxed text-dim">
          Agent lines and vibe scores are heuristic estimates based on commit patterns, diff
          sizes, and code structure. This is for fun and bragging rights, not forensic analysis.
        </p>
      </section>
    </div>
  );
}
