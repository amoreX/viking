import Link from "next/link";
import Image from "next/image";
import { getTopUsers, getStats, BADGE_CATALOG } from "@/lib/mock-data";

export default function Home() {
  const topUsers = getTopUsers();
  const stats = getStats();

  return (
    <div className="min-h-dvh">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 pb-20 pt-24 text-center sm:pt-32">
        <h1 className="text-balance text-7xl font-bold text-accent sm:text-8xl">
          VIKING
        </h1>
        <p className="mt-4 text-balance text-lg font-medium text-neutral-200 sm:text-xl">
          The leaderboard for vibecoders
        </p>
        <p className="mt-3 max-w-lg text-pretty text-[0.9375rem] leading-relaxed text-muted">
          Connect your GitHub. We estimate how many lines your AI agents
          shipped, score your vibe-coded output, and rank you against other
          developers. Who&rsquo;s the most locked-in vibecoder today?
        </p>
        <Link
          href="/api/auth/signin"
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-6 text-sm font-semibold text-black transition-colors hover:bg-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Sign in with GitHub
        </Link>
      </section>

      {/* Preview Leaderboard */}
      <section className="mx-auto max-w-2xl px-4 pb-16">
        <h2 className="mb-6 text-center text-[0.6875rem] font-semibold text-dim uppercase">
          Top Vibecoders
        </h2>
        <div className="rounded-xl border border-border bg-surface p-1">
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
                className="flex-1 truncate text-sm font-medium text-neutral-200 hover:text-white"
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
        <div className="mt-4 text-center">
          <Link
            href="/leaderboard"
            className="text-sm font-medium text-muted transition-colors hover:text-accent"
          >
            View full leaderboard &rarr;
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto grid max-w-3xl grid-cols-1 gap-6 px-4 pb-20 sm:grid-cols-3">
        {[
          { value: stats.vibecoders.toLocaleString(), label: "Vibecoders ranked" },
          { value: `${(stats.agentLines / 1_000_000).toFixed(1)}M`, label: "Agent lines shipped" },
          { value: `${(stats.vibeHours / 1000).toFixed(1)}k`, label: "Hours vibe-coded" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-surface p-6 text-center"
          >
            <p className="font-mono text-3xl font-semibold tabular-nums text-accent">
              {stat.value}
            </p>
            <p className="mt-1.5 text-xs font-medium text-dim uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      {/* Disclaimer */}
      <section className="border-t border-border px-4 py-10 text-center">
        <p className="mx-auto max-w-md text-pretty text-xs leading-relaxed text-dim">
          Agent lines and vibe scores are heuristic estimates based on commit
          patterns, diff sizes, and code structure. This is for fun and
          bragging rights, not forensic analysis.
        </p>
      </section>
    </div>
  );
}
