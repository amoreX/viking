"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuthStore } from "@/lib/store";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-mono text-base font-bold text-accent">
          VIKING
        </Link>

        <div className="hidden items-center gap-6 sm:flex">
          <Link href="/" className="text-sm text-muted transition-colors hover:text-foreground">
            Home
          </Link>
          <Link href="/leaderboard" className="text-sm text-muted transition-colors hover:text-foreground">
            Leaderboard
          </Link>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          {user ? (
            <div className="flex items-center gap-3">
              {user.avatar && (
                <Image
                  src={user.avatar}
                  alt={user.username}
                  width={28}
                  height={28}
                  className="size-7 rounded-full"
                />
              )}
              <span className="text-sm text-foreground">{user.username}</span>
              <button
                onClick={() => {
                  logout();
                  window.location.href = "/";
                }}
                className="cursor-pointer rounded border border-border px-3 py-1 text-xs font-medium text-dim transition-colors hover:border-border-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                window.location.href = "/api/auth/github";
              }}
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
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-border px-4 py-3 sm:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/" onClick={() => setMenuOpen(false)} className="text-sm text-muted hover:text-foreground">Home</Link>
            <Link href="/leaderboard" onClick={() => setMenuOpen(false)} className="text-sm text-muted hover:text-foreground">Leaderboard</Link>
            <div className="border-t border-border pt-3">
              {user ? (
                <div className="flex items-center gap-3">
                  {user.avatar && (
                    <Image src={user.avatar} alt={user.username} width={24} height={24} className="size-6 rounded-full" />
                  )}
                  <span className="text-sm text-foreground">{user.username}</span>
                  <button
                    onClick={() => {
                      logout();
                      window.location.href = "/";
                    }}
                    className="cursor-pointer text-xs text-dim hover:text-foreground"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    window.location.href = "/api/auth/github";
                  }}
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
