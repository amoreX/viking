import db from "@/lib/db";
import { syncUser } from "@/lib/sync";
import { scoreUser } from "@/lib/scoring";

export async function POST(request: Request) {
  const cronSecret = request.headers.get("authorization");

  if (!process.env.CRON_SECRET || cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await db.user.findMany({
    where: {
      githubAccessToken: { not: null },
      githubUsername: { not: null },
    },
    select: { id: true, githubUsername: true },
  });

  const results: {
    username: string;
    success: boolean;
    error?: string;
  }[] = [];

  for (const user of users) {
    try {
      await syncUser(user.id);
      await scoreUser(user.id);
      results.push({ username: user.githubUsername!, success: true });
    } catch (error) {
      console.error(`Cron: failed to process ${user.githubUsername}:`, error);
      results.push({
        username: user.githubUsername!,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return Response.json({
    processed: users.length,
    succeeded,
    failed,
    results,
  });
}
