import { auth } from "@/lib/auth";
import { syncUser } from "@/lib/sync";
import { scoreUser } from "@/lib/scoring";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const syncResult = await syncUser(session.user.id);
    const scoreResult = await scoreUser(session.user.id);

    return Response.json({
      success: true,
      sync: syncResult,
      scoring: scoreResult,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 },
    );
  }
}
