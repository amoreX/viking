import { supabase } from "@/lib/supabase";
import { createGitHubClient, fetchUserRepos, fetchMergedPRs } from "@/lib/github";

const BADGE_RULES: { slug: string; check: (s: Stats) => boolean }[] = [
  { slug: "locked-in", check: (s) => s.streak >= 7 },
  { slug: "agent-maxxer", check: (s) => s.agentLines >= 1000 },
  { slug: "pr-goblin", check: (s) => s.totalPRs >= 10 },
  { slug: "merge-addict", check: (s) => s.streak >= 5 },
  { slug: "boilerplate-beast", check: (s) => s.avgAILikelihood > 0.7 },
  { slug: "3am-goblin", check: (s) => s.hasLateNight },
  { slug: "one-shot-killer", check: (s) => s.hasOneShotPR },
];

interface Stats {
  agentLines: number;
  totalPRs: number;
  streak: number;
  avgAILikelihood: number;
  hasLateNight: boolean;
  hasOneShotPR: boolean;
}

export async function syncUser(userId: string) {
  const { data: user, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (fetchError || !user?.access_token || !user?.username) {
    throw new Error("User not found or missing token");
  }

  const octokit = createGitHubClient(user.access_token);
  const username = user.username;

  const allRepos = await fetchUserRepos(octokit);
  const repos = allRepos.slice(0, 20);

  let totalAdditions = 0;
  let totalDeletions = 0;
  let totalPRs = 0;
  let totalFiles = 0;
  let hasLateNight = false;
  let hasOneShotPR = false;
  const mergeHours: number[] = [];
  const repoPRCounts = new Map<string, number>();

  const since = user.last_synced_at
    ? new Date(user.last_synced_at)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < repos.length; i += 3) {
    const batch = repos.slice(i, i + 3);
    await Promise.allSettled(
      batch.map(async (repo: any) => {
        const [owner, repoName] = repo.full_name.split("/");
        const prs = await fetchMergedPRs(octokit, owner, repoName, username, since);

        for (const pr of prs) {
          const prAny = pr as any;
          totalAdditions += prAny.additions ?? 0;
          totalDeletions += prAny.deletions ?? 0;
          totalFiles += prAny.changed_files ?? 0;
          totalPRs++;

          if (pr.merged_at) {
            const hour = new Date(pr.merged_at).getUTCHours();
            mergeHours.push(hour);
            if (hour >= 2 && hour <= 5) hasLateNight = true;
          }
          if ((prAny.commits ?? 0) === 1 && (prAny.additions ?? 0) > 200) hasOneShotPR = true;
        }

        if (prs.length > 0) repoPRCounts.set(repo.full_name, prs.length);
      })
    );
  }

  // Output score (log-scaled, capped at 10)
  const outputScore = Math.min(10,
    Math.log10(1 + totalAdditions + totalDeletions * 0.5) +
    Math.log10(1 + totalFiles) * 0.3
  );

  // AI likelihood heuristic
  let aiScore = 0.3;
  if (totalPRs > 0) {
    const avgAdd = totalAdditions / totalPRs;
    if (avgAdd > 200) aiScore += 0.15;
    if (avgAdd > 500) aiScore += 0.1;
    if (hasOneShotPR) aiScore += 0.1;
    if (totalFiles / Math.max(1, totalPRs) > 5) aiScore += 0.1;
  }
  aiScore = Math.min(0.95, Math.max(0.1, aiScore));

  const vibeScore = Math.round(outputScore * (1 + aiScore * 1.5) * 100) / 100;

  // Peak hour
  const hourCounts = new Map<number, number>();
  for (const h of mergeHours) hourCounts.set(h, (hourCounts.get(h) ?? 0) + 1);
  let peakHour = "12:00 UTC";
  let maxHourCount = 0;
  for (const [h, c] of hourCounts) {
    if (c > maxHourCount) { peakHour = `${h.toString().padStart(2, "0")}:00 UTC`; maxHourCount = c; }
  }

  // Top repo
  let topRepo = user.top_repo;
  let maxPRs = 0;
  for (const [name, count] of repoPRCounts) {
    if (count > maxPRs) { topRepo = name; maxPRs = count; }
  }

  const streak = Math.min(totalPRs, 30);
  const newAgentLines = (user.agent_lines ?? 0) + totalAdditions;
  const newTotalPRs = (user.total_prs ?? 0) + totalPRs;

  const stats: Stats = {
    agentLines: newAgentLines,
    totalPRs: newTotalPRs,
    streak,
    avgAILikelihood: aiScore,
    hasLateNight,
    hasOneShotPR,
  };
  const badges = BADGE_RULES.filter((b) => b.check(stats)).map((b) => b.slug);

  const { error } = await supabase
    .from("users")
    .update({
      agent_lines: newAgentLines,
      vibe_hours: Math.round(newAgentLines / 150),
      vibe_score: vibeScore,
      streak,
      total_prs: newTotalPRs,
      peak_hour: peakHour,
      top_repo: topRepo,
      badges,
      score_daily: vibeScore,
      score_weekly: vibeScore * 3,
      score_alltime: (user.score_alltime ?? 0) + vibeScore,
      last_synced_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;

  return { totalPRs, totalAdditions, vibeScore, badges };
}
