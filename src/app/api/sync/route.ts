import { NextRequest } from "next/server";
import { syncUser } from "@/lib/sync";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const userId = request.headers.get("x-user-id");

    if (!authHeader?.startsWith("Bearer ") || !userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const ghRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!ghRes.ok) {
      return Response.json({ error: "Invalid GitHub token" }, { status: 401 });
    }

    const result = await syncUser(userId);
    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error("Sync error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}
