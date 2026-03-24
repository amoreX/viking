import { supabase } from "@/lib/supabase";
import { NextRequest } from "next/server";

const BADGE_CATALOG: Record<string, { emoji: string; name: string; description: string }> = {
  "vibe-lord":        { emoji: "👑", name: "Vibe Lord",        description: "Hit #1 on the daily leaderboard" },
  "locked-in":        { emoji: "🔒", name: "Locked In",        description: "7-day coding streak" },
  "boilerplate-beast":{ emoji: "🤖", name: "Boilerplate Beast",description: "Average AI-likelihood above 0.7" },
  "one-shot-killer":  { emoji: "🎯", name: "One-Shot Killer",  description: "Landed a massive PR in a single commit" },
  "merge-addict":     { emoji: "💉", name: "Merge Addict",     description: "Merged PRs 5 days in a row" },
  "agent-maxxer":     { emoji: "⚡", name: "Agent Maxxer",     description: "Shipped 1000+ lines in a day" },
  "pr-goblin":        { emoji: "👺", name: "PR Goblin",        description: "Merged 10+ PRs in a week" },
  "3am-goblin":       { emoji: "🌙", name: "3AM Goblin",       description: "Pushed code between 2-5 AM" },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Compute ranks
    async function getRank(column: string, value: number): Promise<number | null> {
      if (!value) return null;
      const { count } = await supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .gt(column, value);
      return (count ?? 0) + 1;
    }

    const [dailyRank, weeklyRank, allTimeRank] = await Promise.all([
      getRank("score_daily", user.score_daily),
      getRank("score_weekly", user.score_weekly),
      getRank("score_alltime", user.score_alltime),
    ]);

    const badges = (user.badges ?? []) as string[];
    const badgeDetails = badges
      .map((slug: string) => BADGE_CATALOG[slug] ? { slug, ...BADGE_CATALOG[slug] } : null)
      .filter(Boolean);

    return Response.json({
      username: user.username,
      avatarUrl: user.avatar_url ?? "",
      bio: user.bio,
      agentLines: user.agent_lines ?? 0,
      vibeHours: user.vibe_hours ?? 0,
      streak: user.streak ?? 0,
      totalPRs: user.total_prs ?? 0,
      peakHour: user.peak_hour ?? "12:00 UTC",
      badges,
      badgeDetails,
      scores: {
        daily: user.score_daily ?? 0,
        weekly: user.score_weekly ?? 0,
        allTime: user.score_alltime ?? 0,
      },
      ranks: {
        daily: dailyRank,
        weekly: weeklyRank,
        allTime: allTimeRank,
      },
    });
  } catch (error) {
    console.error("User profile error:", error);
    return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
