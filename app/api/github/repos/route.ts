import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createGitHubClient } from '@/app/lib/github';
import { getGitHubToken } from '@/app/lib/token';
import { transformRepository } from '@/app/types';

export async function GET(request: NextRequest) {
  try {
    const token = getGitHubToken(request);

    if (!token) {
      return NextResponse.json({ error: 'GitHub token is required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const perPage = Number(searchParams.get('perPage')) || 30;
    const page = Number(searchParams.get('page')) || 1;
    const type =
      (searchParams.get('type') as 'all' | 'owner' | 'public' | 'private' | 'member') || 'all';
    const sort =
      (searchParams.get('sort') as 'created' | 'updated' | 'pushed' | 'full_name') || 'updated';
    const direction = (searchParams.get('direction') as 'asc' | 'desc') || 'desc';

    const client = createGitHubClient(token);
    const repos = await client.getRepositories({
      perPage,
      page,
      type,
      sort,
      direction,
    });

    const transformedRepos = repos.map(transformRepository);

    return NextResponse.json({
      data: transformedRepos,
      page,
      perPage,
      total: transformedRepos.length,
    });
  } catch (error) {
    console.error('Error fetching repositories:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
  }
}
