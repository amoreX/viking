"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-mono text-base font-bold text-accent">
          VIKING
        </Link>

        <div className="hidden items-center gap-6 sm:flex">
          <Link
            href="/"
            className="text-sm text-muted transition-colors hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/leaderboard"
            className="text-sm text-muted transition-colors hover:text-white"
          >
            Leaderboard
          </Link>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          {session?.user ? (
            <div className="flex items-center gap-3">
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "avatar"}
                  width={28}
                  height={28}
                  className="size-7 rounded-full"
                />
              )}
              <span className="text-sm text-neutral-300">
                {session.user.name}
              </span>
              <button
                onClick={() => signOut()}
                className="cursor-pointer rounded border border-border px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-border-hover hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="cursor-pointer rounded bg-accent-muted px-3 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Sign in
            </button>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="cursor-pointer text-muted sm:hidden"
          aria-label="Toggle navigation menu"
        >
          <svg
            className="size-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-border px-4 py-3 sm:hidden">
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-muted hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/leaderboard"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-muted hover:text-white"
            >
              Leaderboard
            </Link>
            <div className="border-t border-border pt-3">
              {session?.user ? (
                <div className="flex items-center gap-3">
                  {session.user.image && (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? "avatar"}
                      width={24}
                      height={24}
                      className="size-6 rounded-full"
                    />
                  )}
                  <span className="text-sm text-neutral-300">
                    {session.user.name}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="cursor-pointer text-xs text-dim hover:text-white"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signIn("github")}
                  className="cursor-pointer text-sm font-medium text-accent"
                >
                  Sign in with GitHub
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
