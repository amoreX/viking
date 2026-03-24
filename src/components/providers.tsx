"use client";

import { ThemeProvider } from "@/lib/theme-context";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/store";

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") === "success") {
      const userId = params.get("userId");
      const username = params.get("username");
      const avatar = params.get("avatar");
      const bio = params.get("bio");
      const token = params.get("token");

      if (userId && username && avatar && token) {
        setUser({
          id: userId,
          username,
          avatar,
          bio: bio || null,
          accessToken: token,
        });

        // Clean URL params
        window.history.replaceState({}, "", "/");

        // Trigger a sync in the background
        setLoading(true);
        fetch("/api/sync", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user-id": userId,
          },
        })
          .catch((err) => console.error("Sync failed:", err))
          .finally(() => setLoading(false));
      }
    }
  }, [setUser, setLoading]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthHydrator>{children}</AuthHydrator>
    </ThemeProvider>
  );
}
