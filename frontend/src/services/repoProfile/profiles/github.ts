export interface GithubPinnedRepo {
  name: string;
  description?: string | null;
  url: string;
  stars: number;
  languages: string[];
  project_link?: string | null;
  topics: string[];
}

export interface GithubProfile {
  handle: string;
  profile_link: string;
  followers_count: number;
  public_repo_count: number;
  organizations: string[];
  pinned_repos: GithubPinnedRepo[];
  avatar?: string | null;
  contribution_count: number;
}
