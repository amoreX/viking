import { Octokit } from "octokit";

export function createGitHubClient(accessToken: string) {
  return new Octokit({ auth: accessToken });
}

export async function fetchUserRepos(octokit: Octokit, username: string) {
  try {
    const repos = await octokit.paginate(
      octokit.rest.repos.listForAuthenticatedUser,
      {
        affiliation: "owner,collaborator,organization_member",
        sort: "pushed",
        per_page: 100,
      }
    );

    return repos.filter((repo) => repo.permissions?.push);
  } catch (error) {
    console.error(`Failed to fetch repos for ${username}:`, error);
    throw error;
  }
}

export async function fetchMergedPRs(
  octokit: Octokit,
  owner: string,
  repo: string,
  author: string,
  since?: Date
) {
  try {
    const pulls = await octokit.paginate(
      octokit.rest.pulls.list,
      {
        owner,
        repo,
        state: "closed",
        sort: "updated",
        direction: "desc",
        per_page: 100,
      }
    );

    return pulls.filter((pr) => {
      if (!pr.merged_at) return false;
      if (pr.user?.login?.toLowerCase() !== author.toLowerCase()) return false;
      if (since && new Date(pr.merged_at) < since) return false;
      return true;
    });
  } catch (error) {
    console.error(`Failed to fetch PRs for ${owner}/${repo}:`, error);
    throw error;
  }
}

export async function fetchPRFiles(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number
) {
  try {
    const files = await octokit.paginate(
      octokit.rest.pulls.listFiles,
      {
        owner,
        repo,
        pull_number: prNumber,
        per_page: 100,
      }
    );

    return files;
  } catch (error) {
    console.error(
      `Failed to fetch files for PR #${prNumber} in ${owner}/${repo}:`,
      error
    );
    throw error;
  }
}

export async function fetchPRDetail(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number
) {
  try {
    const { data } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });

    return data;
  } catch (error) {
    console.error(
      `Failed to fetch PR #${prNumber} detail in ${owner}/${repo}:`,
      error
    );
    throw error;
  }
}
