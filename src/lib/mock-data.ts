export const MOCK_USERS = [
  { id: "1", githubUsername: "vibemaster", avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4", bio: "shipping code at the speed of thought", image: null },
  { id: "2", githubUsername: "cursor-demon", avatarUrl: "https://avatars.githubusercontent.com/u/2?v=4", bio: "tab tab tab tab tab", image: null },
  { id: "3", githubUsername: "agentmaxxer", avatarUrl: "https://avatars.githubusercontent.com/u/3?v=4", bio: "let the AI cook", image: null },
  { id: "4", githubUsername: "pr-goblin", avatarUrl: "https://avatars.githubusercontent.com/u/4?v=4", bio: "merge or die", image: null },
  { id: "5", githubUsername: "boilerplate-king", avatarUrl: "https://avatars.githubusercontent.com/u/5?v=4", bio: "scaffolding is my passion", image: null },
  { id: "6", githubUsername: "claude-whisperer", avatarUrl: "https://avatars.githubusercontent.com/u/6?v=4", bio: null, image: null },
  { id: "7", githubUsername: "midnight-shipper", avatarUrl: "https://avatars.githubusercontent.com/u/7?v=4", bio: "3am is peak productivity", image: null },
  { id: "8", githubUsername: "one-shot-wonder", avatarUrl: "https://avatars.githubusercontent.com/u/8?v=4", bio: null, image: null },
  { id: "9", githubUsername: "refactor-andy", avatarUrl: "https://avatars.githubusercontent.com/u/9?v=4", bio: "deleting code is my cardio", image: null },
  { id: "10", githubUsername: "lockfile-larry", avatarUrl: "https://avatars.githubusercontent.com/u/10?v=4", bio: null, image: null },
];

export const MOCK_BADGES_MAP: Record<string, string[]> = {
  "1": ["vibe-lord", "locked-in", "boilerplate-beast"],
  "2": ["one-shot-killer", "merge-addict"],
  "3": ["agent-maxxer", "locked-in"],
  "4": ["pr-goblin"],
  "5": ["boilerplate-beast", "agent-maxxer"],
  "7": ["3am-goblin"],
};

export const BADGE_CATALOG: Record<string, { emoji: string; name: string; description: string }> = {
  "vibe-lord":        { emoji: "👑", name: "Vibe Lord",        description: "Hit #1 on the daily leaderboard" },
  "locked-in":        { emoji: "🔒", name: "Locked In",        description: "7-day coding streak" },
  "boilerplate-beast":{ emoji: "🤖", name: "Boilerplate Beast",description: "Average AI-likelihood above 0.7" },
  "one-shot-killer":  { emoji: "🎯", name: "One-Shot Killer",  description: "Landed a massive PR in a single commit" },
  "merge-addict":     { emoji: "💉", name: "Merge Addict",     description: "Merged PRs 5 days in a row" },
  "agent-maxxer":     { emoji: "⚡", name: "Agent Maxxer",     description: "Shipped 1000+ lines in a day" },
  "pr-goblin":        { emoji: "👺", name: "PR Goblin",        description: "Merged 10+ PRs in a week" },
  "3am-goblin":       { emoji: "🌙", name: "3AM Goblin",       description: "Pushed code between 2-5 AM" },
};

export const MOCK_SCORES = [
  { userId: "1",  daily: 42.5,  weekly: 187.3, allTime: 1247.8, agentLines: 48210, vibeHours: 312 },
  { userId: "2",  daily: 38.1,  weekly: 156.9, allTime: 1103.2, agentLines: 41870, vibeHours: 278 },
  { userId: "3",  daily: 31.7,  weekly: 142.1, allTime: 984.5,  agentLines: 36540, vibeHours: 241 },
  { userId: "4",  daily: 28.4,  weekly: 134.6, allTime: 876.1,  agentLines: 29180, vibeHours: 198 },
  { userId: "5",  daily: 24.9,  weekly: 118.3, allTime: 812.7,  agentLines: 34920, vibeHours: 215 },
  { userId: "6",  daily: 21.2,  weekly: 97.8,  allTime: 743.3,  agentLines: 22410, vibeHours: 167 },
  { userId: "7",  daily: 19.8,  weekly: 88.4,  allTime: 691.9,  agentLines: 19870, vibeHours: 148 },
  { userId: "8",  daily: 15.3,  weekly: 72.1,  allTime: 534.2,  agentLines: 15340, vibeHours: 112 },
  { userId: "9",  daily: 11.6,  weekly: 54.7,  allTime: 423.8,  agentLines: 8920,  vibeHours: 74 },
  { userId: "10", daily: 8.2,   weekly: 38.9,  allTime: 312.4,  agentLines: 6140,  vibeHours: 51 },
];

export const MOCK_REPOS = [
  { id: "r1", fullName: "vibemaster/saas-kit", language: "TypeScript", stars: 234 },
  { id: "r2", fullName: "vibemaster/api-gateway", language: "Go", stars: 89 },
  { id: "r3", fullName: "vibemaster/design-system", language: "TypeScript", stars: 45 },
  { id: "r4", fullName: "vibemaster/cli-tools", language: "Rust", stars: 12 },
];

function resolveBadges(userId: string) {
  const slugs = MOCK_BADGES_MAP[userId] ?? [];
  return slugs.map((slug) => ({ ...BADGE_CATALOG[slug], slug, awardedAt: "2026-03-15T00:00:00Z" }));
}

export function getLeaderboard(period: "daily" | "weekly" | "alltime") {
  const scoreKey = period === "daily" ? "daily" : period === "weekly" ? "weekly" : "allTime";

  return MOCK_SCORES
    .sort((a, b) => b[scoreKey] - a[scoreKey])
    .map((s, i) => {
      const user = MOCK_USERS.find((u) => u.id === s.userId)!;
      return {
        rank: i + 1,
        username: user.githubUsername,
        avatarUrl: user.avatarUrl,
        vibeScore: Math.round(s[scoreKey] * 10) / 10,
        agentLines: s.agentLines,
        vibeHours: s.vibeHours,
        streak: Math.max(0, 12 - i * 2 + (period === "daily" ? 0 : 3)),
        badges: resolveBadges(s.userId).map((b) => b.slug),
      };
    });
}

export function getTopUsers() {
  return getLeaderboard("alltime").slice(0, 5);
}

export function getStats() {
  return {
    vibecoders: 1_247,
    agentLines: 2_841_000,
    vibeHours: 18_420,
  };
}

export function getUserProfile(username: string) {
  const user = MOCK_USERS.find((u) => u.githubUsername === username);
  if (!user) return null;

  const scores = MOCK_SCORES.find((s) => s.userId === user.id);
  if (!scores) return null;

  const badges = resolveBadges(user.id);

  const allTime = getLeaderboard("alltime");
  const weekly = getLeaderboard("weekly");
  const daily = getLeaderboard("daily");

  return {
    user,
    scores: {
      daily: scores.daily,
      weekly: scores.weekly,
      allTime: scores.allTime,
    },
    agentLines: scores.agentLines,
    vibeHours: scores.vibeHours,
    badges,
    ranks: {
      DAILY: (daily.findIndex((e) => e.username === username) + 1) || null,
      WEEKLY: (weekly.findIndex((e) => e.username === username) + 1) || null,
      ALL_TIME: (allTime.findIndex((e) => e.username === username) + 1) || null,
    },
    stats: {
      streak: 7,
      totalPRs: 142,
      peakHour: "14:00 UTC",
      favoriteRepo: "vibemaster/saas-kit",
    },
  };
}
