import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createGitHubClient } from '@/app/lib/github';
import { getGitHubToken } from '@/app/lib/token';
import { transformPullRequest } from '@/app/types';

export async function GET(request: NextRequest) {
  try {
    const token = getGitHubToken(request);

    if (!token) {
      return NextResponse.json({ error: 'GitHub token is required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const repositories = searchParams.get('repositories');
    const state = (searchParams.get('state') as 'open' | 'closed' | 'all') || 'open';
    const perPage = Number(searchParams.get('perPage')) || 30;
    const page = Number(searchParams.get('page')) || 1;

    if (!repositories) {
      return NextResponse.json(
        { error: 'repositories parameter is required (comma-separated owner/repo)' },
        { status: 400 }
      );
    }

    const repoList = repositories.split(',').map((repo) => {
      const [owner, name] = repo.trim().split('/');
      return { owner, repo: name };
    });

    const client = createGitHubClient(token);
    const results = await client.getPullRequestsForRepositories(repoList, {
      state,
      perPage,
      page,
    });

    // Flatten and transform all pull requests
    const allPullRequests = results.flatMap((result) =>
      result.pullRequests.map(transformPullRequest)
    );

    // Sort by updated date (most recent first)
    allPullRequests.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return NextResponse.json({
      data: allPullRequests,
      page,
      perPage,
      total: allPullRequests.length,
    });
  } catch (error) {
    console.error('Error fetching pull requests:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'Failed to fetch pull requests' }, { status: 500 });
  }
}
