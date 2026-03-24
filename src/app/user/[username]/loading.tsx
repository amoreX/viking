export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-col items-center gap-4 pb-8 sm:flex-row sm:items-start">
        <div className="size-20 animate-pulse rounded-full bg-border" />
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <div className="h-6 w-40 animate-pulse rounded bg-surface" />
          <div className="h-4 w-64 animate-pulse rounded bg-surface" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-3 w-16 animate-pulse rounded bg-surface" />
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-5"
          >
            <div className="h-10 w-20 animate-pulse rounded bg-border" />
            <div className="h-3 w-12 animate-pulse rounded bg-border" />
          </div>
        ))}
      </div>

      <div className="mb-8">
        <div className="mb-3 h-3 w-16 animate-pulse rounded bg-surface" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 w-20 animate-pulse rounded-full bg-surface" />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 h-3 w-28 animate-pulse rounded bg-surface" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-surface px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 animate-pulse rounded bg-border" />
                  <div className="h-4 w-48 animate-pulse rounded bg-border" />
                  <div className="h-3 w-16 animate-pulse rounded bg-border" />
                </div>
                <div className="flex gap-2">
                  <div className="h-5 w-10 animate-pulse rounded bg-border" />
                  <div className="h-5 w-14 animate-pulse rounded bg-border" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
