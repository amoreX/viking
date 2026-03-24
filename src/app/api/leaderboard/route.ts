import { supabase } from "@/lib/supabase";
import { NextRequest } from "next/server";

const SCORE_COLUMN: Record<string, string> = {
  daily: "score_daily",
  weekly: "score_weekly",
  alltime: "score_alltime",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const period = searchParams.get("period") ?? "daily";
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10) || 50, 100);

    const column = SCORE_COLUMN[period] ?? "score_daily";

    const { data: users, error } = await supabase
      .from("users")
      .select("username, avatar_url, agent_lines, vibe_hours, streak, badges, score_daily, score_weekly, score_alltime")
      .order(column, { ascending: false })
      .limit(limit);

    if (error) throw error;

    const entries = (users ?? []).map((u: any, i: number) => ({
      rank: i + 1,
      username: u.username,
      avatarUrl: u.avatar_url ?? "",
      vibeScore: Math.round((u[column] ?? 0) * 100) / 100,
      agentLines: u.agent_lines ?? 0,
      vibeHours: u.vibe_hours ?? 0,
      streak: u.streak ?? 0,
      badges: u.badges ?? [],
    }));

    return Response.json(entries);
  } catch (error) {
    console.error("Leaderboard error:", error);
    return Response.json([]);
  }
}
