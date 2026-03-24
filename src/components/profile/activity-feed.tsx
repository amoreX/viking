interface Activity {
  repoName: string;
  prTitle: string;
  prNumber: number;
  mergedAt: string;
  outputScore: number;
  aiLikelihood: number;
  vibeScore: number;
}

interface ActivityFeedProps {
  activities: Activity[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface px-4 py-12 text-center">
        <p className="text-sm text-muted">No scored PRs yet.</p>
        <p className="mt-1 text-xs text-dim">
          Merged pull requests will appear here once synced.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {activities.map((a) => (
        <div
          key={`${a.repoName}-${a.prNumber}`}
          className="rounded-lg border border-border bg-surface px-4 py-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-dim">{a.repoName}</p>
              <p className="mt-0.5 truncate text-sm text-pretty font-medium text-neutral-200">
                {a.prTitle}{" "}
                <span className="text-dim">#{a.prNumber}</span>
              </p>
              <p className="mt-1 text-xs text-dim">
                {formatDate(a.mergedAt)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded bg-accent-muted px-2 py-0.5 font-mono text-xs font-medium tabular-nums text-accent">
                {a.vibeScore}
              </span>
              <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-xs font-medium tabular-nums text-muted">
                {a.aiLikelihood}% AI
              </span>
              <span className="hidden rounded bg-white/5 px-2 py-0.5 font-mono text-xs tabular-nums text-dim sm:inline-block">
                {a.outputScore}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
