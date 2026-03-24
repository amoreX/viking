import Link from "next/link";
import Image from "next/image";
import { getUserProfile, MOCK_REPOS, BADGE_CATALOG } from "@/lib/mock-data";
import SyncButton from "@/components/dashboard/sync-button";
import ScoreDisplay from "@/components/ui/score-display";

export default function DashboardPage() {
  const profile = getUserProfile("vibemaster")!;
  const { user, scores, agentLines, vibeHours, badges, ranks } = profile;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={user.avatarUrl}
            alt={user.githubUsername}
            width={48}
            height={48}
            className="size-12 rounded-full"
          />
          <div>
            <h1 className="text-balance text-lg font-bold text-white">
              Welcome, {user.githubUsername}
            </h1>
            <p className="text-xs text-dim">
              Last synced: Mar 24, 2026, 2:30 PM
            </p>
          </div>
        </div>
        <SyncButton />
      </div>

      {/* Score Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { score: scores.daily, label: "Daily", rank: ranks.DAILY },
          { score: scores.weekly, label: "Weekly", rank: ranks.WEEKLY },
          { score: scores.allTime, label: "All Time", rank: ranks.ALL_TIME },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-surface p-5 text-center"
          >
            <ScoreDisplay
              score={Math.round(card.score * 10) / 10}
              label={card.label}
            />
            {card.rank && (
              <p className="mt-2 font-mono text-xs tabular-nums text-dim">
                Rank #{card.rank}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Agent Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-surface p-5 text-center">
          <p className="font-mono text-2xl font-semibold tabular-nums text-accent">
            {agentLines.toLocaleString()}
          </p>
          <p className="mt-1.5 text-xs font-medium text-dim uppercase">
            Agent lines shipped
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5 text-center">
          <p className="font-mono text-2xl font-semibold tabular-nums text-accent">
            ~{vibeHours}h
          </p>
          <p className="mt-1.5 text-xs font-medium text-dim uppercase">
            Est. vibe-coding time
          </p>
        </div>
      </div>

      {/* Badges */}
      <section className="mb-8">
        <h2 className="mb-3 text-[0.6875rem] font-semibold text-dim uppercase">
          Badges
        </h2>
        {badges.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface px-4 py-8 text-center">
            <p className="text-sm text-muted">No badges earned yet.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
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
        )}
      </section>

      {/* Repos */}
      <section className="mb-8">
        <h2 className="mb-3 text-[0.6875rem] font-semibold text-dim uppercase">
          Tracked Repositories ({MOCK_REPOS.length})
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {MOCK_REPOS.map((repo) => (
            <div
              key={repo.id}
              className="rounded-lg border border-border bg-surface px-4 py-3"
            >
              <p className="truncate text-sm font-medium text-neutral-200">
                {repo.fullName}
              </p>
              <div className="mt-1 flex items-center gap-3 text-xs text-dim">
                <span>{repo.language}</span>
                <span className="font-mono tabular-nums">{repo.stars} stars</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Profile link */}
      <div className="text-center">
        <Link
          href={`/user/${user.githubUsername}`}
          className="text-sm font-medium text-muted transition-colors hover:text-accent"
        >
          View public profile &rarr;
        </Link>
      </div>
    </div>
  );
}
