import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getUserProfile, BADGE_CATALOG } from "@/lib/mock-data";
import ScoreDisplay from "@/components/ui/score-display";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username} - VIKING`,
    description: `${username}'s vibecoder profile on VIKING.`,
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = getUserProfile(username);

  if (!profile) {
    notFound();
  }

  const { user, scores, agentLines, vibeHours, badges, ranks, stats } = profile;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-4 pb-8 sm:flex-row sm:items-start">
        <Image
          src={user.avatarUrl}
          alt={username}
          width={80}
          height={80}
          className="size-20 rounded-full"
        />
        <div className="text-center sm:text-left">
          <h1 className="text-balance text-xl font-bold text-white">{username}</h1>
          {user.bio && (
            <p className="mt-1 max-w-md text-pretty text-sm text-muted">{user.bio}</p>
          )}
          <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 font-mono text-xs tabular-nums text-dim sm:justify-start">
            <span>{stats.streak}d streak</span>
            <span>{stats.totalPRs} PRs merged</span>
            <span>Peak {stats.peakHour}</span>
          </div>
        </div>
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
      <section>
        <h2 className="mb-3 text-[0.6875rem] font-semibold text-dim uppercase">
          Badges
        </h2>
        {badges.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface px-4 py-8 text-center">
            <p className="text-sm text-muted">No badges earned yet.</p>
            <p className="mt-1 text-xs text-dim">
              Badges are awarded for streaks, high output, and shipping volume.
            </p>
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
    </div>
  );
}
