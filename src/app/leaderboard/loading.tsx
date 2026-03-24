export default function LeaderboardLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 h-7 w-36 animate-pulse rounded bg-surface" />
      <div className="mb-6 flex gap-1 border-b border-border pb-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-9 w-20 animate-pulse rounded bg-surface" />
        ))}
      </div>

      <div className="mb-2 hidden grid-cols-[3rem_1fr_5rem_6rem_3.5rem_8rem_3.5rem] gap-3 px-4 sm:grid">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-3 animate-pulse rounded bg-surface" />
        ))}
      </div>

      <div className="flex flex-col gap-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-border px-4 py-3"
          >
            <div className="size-4 animate-pulse rounded bg-surface" />
            <div className="size-8 animate-pulse rounded-full bg-border" />
            <div className="h-4 flex-1 animate-pulse rounded bg-surface" />
            <div className="h-4 w-12 animate-pulse rounded bg-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
