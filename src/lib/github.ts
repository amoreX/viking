import { Octokit } from "octokit";

export function createGitHubClient(accessToken: string) {
  return new Octokit({ auth: accessToken });
}

/** Fetch repos where user has push access, sorted by most recently pushed */
export async function fetchUserRepos(octokit: Octokit) {
  try {
    return await octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
      sort: "pushed",
      per_page: 100,
      affiliation: "owner,collaborator,organization_member",
    });
  } catch {
    return [];
  }
}

/** Fetch merged PRs for a repo authored by username, optionally since a date */
export async function fetchMergedPRs(
  octokit: Octokit,
  owner: string,
  repo: string,
  author: string,
  since?: Date
) {
  try {
    const prs = await octokit.rest.pulls.list({
      owner,
      repo,
      state: "closed",
      sort: "updated",
      direction: "desc",
      per_page: 100,
    });

    return prs.data.filter((pr) => {
      if (!pr.merged_at) return false;
      if (pr.user?.login !== author) return false;
      if (since && new Date(pr.merged_at) < since) return false;
      return true;
    });
  } catch {
    return [];
  }
}
