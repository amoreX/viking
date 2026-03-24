import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-6xl font-bold text-accent">404</p>
      <h1 className="mt-4 text-balance text-lg font-bold text-white">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-muted">
        This page doesn&rsquo;t exist or was removed.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-accent-muted px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Back to home
      </Link>
    </div>
  );
}
