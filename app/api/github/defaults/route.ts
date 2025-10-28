import { NextResponse } from 'next/server';

export async function GET() {
  const defaultRepos = process.env.GITHUB_DEFAULT_REPOS || '';
  const repos = defaultRepos
    .split(',')
    .map((repo) => repo.trim())
    .filter((repo) => repo.length > 0);

  return NextResponse.json({
    repositories: repos,
  });
}
