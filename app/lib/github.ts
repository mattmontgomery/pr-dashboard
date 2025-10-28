import type {
  GitHubAPIError as GitHubAPIErrorType,
  GitHubLabel,
  GitHubPullRequest,
  GitHubRateLimit,
  GitHubRepository,
} from '../types/github';

export class GitHubAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: GitHubAPIErrorType
  ) {
    super(message);
    this.name = 'GitHubAPIError';
  }
}

export interface GitHubClientOptions {
  token: string;
  baseUrl?: string;
}

export interface FetchPullRequestsOptions {
  state?: 'open' | 'closed' | 'all';
  sort?: 'created' | 'updated' | 'popularity' | 'long-running';
  direction?: 'asc' | 'desc';
  perPage?: number;
  page?: number;
}

export class GitHubClient {
  private token: string;
  private baseUrl: string;
  private rateLimitRemaining: number | null = null;
  private rateLimitReset: number | null = null;

  constructor(options: GitHubClientOptions) {
    this.token = options.token;
    this.baseUrl = options.baseUrl || 'https://api.github.com';
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Check rate limit before making request
    if (this.rateLimitRemaining !== null && this.rateLimitRemaining === 0) {
      const resetTime = this.rateLimitReset || Date.now();
      const waitTime = resetTime - Date.now();
      if (waitTime > 0) {
        throw new GitHubAPIError(
          `Rate limit exceeded. Resets at ${new Date(resetTime).toISOString()}`,
          429
        );
      }
    }

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Update rate limit info from headers
    const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
    const rateLimitReset = response.headers.get('x-ratelimit-reset');

    if (rateLimitRemaining) {
      this.rateLimitRemaining = Number.parseInt(rateLimitRemaining, 10);
    }
    if (rateLimitReset) {
      this.rateLimitReset = Number.parseInt(rateLimitReset, 10) * 1000;
    }

    if (!response.ok) {
      const error: GitHubAPIError = await response.json().catch(() => ({
        message: response.statusText,
      }));

      throw new GitHubAPIError(
        error.message || 'GitHub API request failed',
        response.status,
        error
      );
    }

    return response.json();
  }

  /**
   * Get rate limit information
   */
  async getRateLimit(): Promise<GitHubRateLimit> {
    const response = await this.fetch<{ rate: GitHubRateLimit }>('/rate_limit');
    return response.rate;
  }

  /**
   * Get repositories for the authenticated user
   */
  async getRepositories(
    options: {
      perPage?: number;
      page?: number;
      type?: 'all' | 'owner' | 'public' | 'private' | 'member';
      sort?: 'created' | 'updated' | 'pushed' | 'full_name';
      direction?: 'asc' | 'desc';
    } = {}
  ): Promise<GitHubRepository[]> {
    const params = new URLSearchParams({
      per_page: String(options.perPage || 30),
      page: String(options.page || 1),
      type: options.type || 'all',
      sort: options.sort || 'updated',
      direction: options.direction || 'desc',
    });

    return this.fetch<GitHubRepository[]>(`/user/repos?${params}`);
  }

  /**
   * Get a specific repository
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    return this.fetch<GitHubRepository>(`/repos/${owner}/${repo}`);
  }

  /**
   * Get pull requests for a repository
   */
  async getPullRequests(
    owner: string,
    repo: string,
    options: FetchPullRequestsOptions = {}
  ): Promise<GitHubPullRequest[]> {
    const params = new URLSearchParams({
      state: options.state || 'open',
      sort: options.sort || 'created',
      direction: options.direction || 'desc',
      per_page: String(options.perPage || 30),
      page: String(options.page || 1),
    });

    return this.fetch<GitHubPullRequest[]>(`/repos/${owner}/${repo}/pulls?${params}`);
  }

  /**
   * Get a specific pull request with full details
   */
  async getPullRequest(
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<GitHubPullRequest> {
    return this.fetch<GitHubPullRequest>(`/repos/${owner}/${repo}/pulls/${pullNumber}`);
  }

  /**
   * Get labels for a repository
   */
  async getLabels(
    owner: string,
    repo: string,
    options: { perPage?: number; page?: number } = {}
  ): Promise<GitHubLabel[]> {
    const params = new URLSearchParams({
      per_page: String(options.perPage || 100),
      page: String(options.page || 1),
    });

    return this.fetch<GitHubLabel[]>(`/repos/${owner}/${repo}/labels?${params}`);
  }

  /**
   * Search for repositories
   */
  async searchRepositories(
    query: string,
    options: { perPage?: number; page?: number; sort?: 'stars' | 'forks' | 'updated' } = {}
  ): Promise<{ items: GitHubRepository[]; total_count: number }> {
    const params = new URLSearchParams({
      q: query,
      per_page: String(options.perPage || 30),
      page: String(options.page || 1),
      ...(options.sort ? { sort: options.sort } : {}),
    });

    return this.fetch<{ items: GitHubRepository[]; total_count: number }>(
      `/search/repositories?${params}`
    );
  }

  /**
   * Get pull requests across multiple repositories
   */
  async getPullRequestsForRepositories(
    repositories: Array<{ owner: string; repo: string }>,
    options: FetchPullRequestsOptions = {}
  ): Promise<Array<{ repository: string; pullRequests: GitHubPullRequest[] }>> {
    const results = await Promise.allSettled(
      repositories.map(async ({ owner, repo }) => {
        const pullRequests = await this.getPullRequests(owner, repo, options);
        return { repository: `${owner}/${repo}`, pullRequests };
      })
    );

    return results
      .filter(
        (
          result
        ): result is PromiseFulfilledResult<{
          repository: string;
          pullRequests: GitHubPullRequest[];
        }> => result.status === 'fulfilled'
      )
      .map((result) => result.value);
  }

  /**
   * Get all labels across multiple repositories
   */
  async getLabelsForRepositories(
    repositories: Array<{ owner: string; repo: string }>
  ): Promise<Array<{ repository: string; labels: GitHubLabel[] }>> {
    const results = await Promise.allSettled(
      repositories.map(async ({ owner, repo }) => {
        const labels = await this.getLabels(owner, repo);
        return { repository: `${owner}/${repo}`, labels };
      })
    );

    return results
      .filter(
        (result): result is PromiseFulfilledResult<{ repository: string; labels: GitHubLabel[] }> =>
          result.status === 'fulfilled'
      )
      .map((result) => result.value);
  }
}

/**
 * Create a GitHub client instance
 */
export function createGitHubClient(token: string): GitHubClient {
  if (!token) {
    throw new Error('GitHub token is required');
  }

  return new GitHubClient({ token });
}
