import db from "@/lib/db";
import {
  createGitHubClient,
  fetchUserRepos,
  fetchMergedPRs,
  fetchPRFiles,
  fetchPRDetail,
} from "@/lib/github";

const GENERATED_FILE_PATTERNS = [
  /^package-lock\.json$/,
  /^yarn\.lock$/,
  /^pnpm-lock\.yaml$/,
  /(?:^|\/)(dist|build|\.next|node_modules|vendor)\//,
  /\.min\.js$/,
  /\.min\.css$/,
  /\.snap$/,
  /(?:^|\/)coverage\//,
];

function isGeneratedFile(filename: string): boolean {
  return GENERATED_FILE_PATTERNS.some((pattern) => pattern.test(filename));
}

/** Process repos in batches to limit concurrency. */
async function processInBatches<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(batch.map(fn));
    results.push(...batchResults);
  }

  return results;
}

export async function syncUser(userId: string) {
  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      githubAccessToken: true,
      githubUsername: true,
      lastSyncedAt: true,
    },
  });

  if (!user.githubAccessToken) {
    throw new Error(`User ${userId} has no GitHub access token`);
  }

  if (!user.githubUsername) {
    throw new Error(`User ${userId} has no GitHub username`);
  }

  const octokit = createGitHubClient(user.githubAccessToken);

  // Fetch and upsert repos
  const repos = await fetchUserRepos(octokit, user.githubUsername);

  for (const repo of repos) {
    await db.repo.upsert({
      where: { githubId: repo.id },
      create: {
        userId: user.id,
        githubId: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count ?? 0,
        isPrivate: repo.private,
        defaultBranch: repo.default_branch ?? "main",
      },
      update: {
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count ?? 0,
        isPrivate: repo.private,
        defaultBranch: repo.default_branch ?? "main",
      },
    });
  }

  // Take the 20 most recently pushed repos
  const recentRepos = repos
    .sort(
      (a, b) =>
        new Date(b.pushed_at ?? 0).getTime() -
        new Date(a.pushed_at ?? 0).getTime()
    )
    .slice(0, 20);

  const since =
    user.lastSyncedAt ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  let totalPRs = 0;
  let totalFiles = 0;
  let reposProcessed = 0;
  let reposFailed = 0;

  const repoResults = await processInBatches(recentRepos, 3, async (repo) => {
    const [owner, repoName] = repo.full_name.split("/");

    const dbRepo = await db.repo.findUnique({
      where: { githubId: repo.id },
    });

    if (!dbRepo) {
      throw new Error(`Repo ${repo.full_name} not found in DB after upsert`);
    }

    const mergedPRs = await fetchMergedPRs(
      octokit,
      owner,
      repoName,
      user.githubUsername!,
      since
    );

    let repoPRCount = 0;
    let repoFileCount = 0;

    for (const pr of mergedPRs) {
      const [detail, files] = await Promise.all([
        fetchPRDetail(octokit, owner, repoName, pr.number),
        fetchPRFiles(octokit, owner, repoName, pr.number),
      ]);

      const dbPR = await db.pullRequest.upsert({
        where: { githubId: pr.id },
        create: {
          repoId: dbRepo.id,
          githubId: pr.id,
          number: pr.number,
          title: pr.title,
          state: "merged",
          mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
          additions: detail.additions,
          deletions: detail.deletions,
          changedFiles: detail.changed_files,
          commitCount: detail.commits,
        },
        update: {
          title: pr.title,
          state: "merged",
          mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
          additions: detail.additions,
          deletions: detail.deletions,
          changedFiles: detail.changed_files,
          commitCount: detail.commits,
        },
      });

      // Delete existing files for this PR and re-insert
      await db.prFile.deleteMany({
        where: { pullRequestId: dbPR.id },
      });

      if (files.length > 0) {
        await db.prFile.createMany({
          data: files.map((file) => ({
            pullRequestId: dbPR.id,
            filename: file.filename,
            status: file.status ?? "modified",
            additions: file.additions,
            deletions: file.deletions,
            patch: file.patch ?? null,
            isGenerated: isGeneratedFile(file.filename),
          })),
        });
      }

      repoPRCount++;
      repoFileCount += files.length;
    }

    return { repoPRCount, repoFileCount };
  });

  for (const result of repoResults) {
    if (result.status === "fulfilled") {
      reposProcessed++;
      totalPRs += result.value.repoPRCount;
      totalFiles += result.value.repoFileCount;
    } else {
      reposFailed++;
      console.error("Failed to process repo:", result.reason);
    }
  }

  // Update lastSyncedAt
  await db.user.update({
    where: { id: userId },
    data: { lastSyncedAt: new Date() },
  });

  return {
    reposFound: repos.length,
    reposProcessed,
    reposFailed,
    totalPRs,
    totalFiles,
  };
}
