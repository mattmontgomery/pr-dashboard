import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createGitHubClient } from '@/app/lib/github';
import { getGitHubToken } from '@/app/lib/token';
import { transformLabel } from '@/app/types';

export async function GET(request: NextRequest) {
  try {
    const token = getGitHubToken(request);

    if (!token) {
      return NextResponse.json({ error: 'GitHub token is required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const repositories = searchParams.get('repositories');

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
    const results = await client.getLabelsForRepositories(repoList);

    // Flatten and deduplicate labels by name
    const labelMap = new Map<string, ReturnType<typeof transformLabel>>();

    for (const result of results) {
      for (const label of result.labels) {
        const transformedLabel = transformLabel(label);
        if (!labelMap.has(transformedLabel.name)) {
          labelMap.set(transformedLabel.name, transformedLabel);
        }
      }
    }

    const uniqueLabels = Array.from(labelMap.values());

    return NextResponse.json({
      data: uniqueLabels,
      total: uniqueLabels.length,
    });
  } catch (error) {
    console.error('Error fetching labels:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'Failed to fetch labels' }, { status: 500 });
  }
}
