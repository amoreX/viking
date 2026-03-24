"use client";

import { useState } from "react";

type SyncState = "idle" | "loading" | "success" | "error";

export default function SyncButton() {
  const [state, setState] = useState<SyncState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSync() {
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      if (!res.ok) throw new Error("Sync failed");
      setState("success");
      setTimeout(() => {
        setState("idle");
        window.location.reload();
      }, 1500);
    } catch {
      setState("error");
      setErrorMsg("Could not reach GitHub. Try again.");
      setTimeout(() => setState("idle"), 5000);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleSync}
        disabled={state === "loading"}
        className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-accent-muted px-4 text-sm font-medium text-accent transition-colors hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
      >
        {state === "loading" && (
          <svg
            className="size-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {state === "idle" && "Sync PRs"}
        {state === "loading" && "Syncing\u2026"}
        {state === "success" && "Synced!"}
        {state === "error" && "Retry sync"}
      </button>
      {state === "error" && errorMsg && (
        <p className="text-xs text-red-400">{errorMsg}</p>
      )}
    </div>
  );
}
