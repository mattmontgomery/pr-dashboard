import type { NextRequest } from 'next/server';

/**
 * Get GitHub token from environment variable or request header
 * Priority: Environment variable > Request header
 */
export function getGitHubToken(request?: NextRequest): string | null {
  // First, check for environment variable
  const envToken = process.env.GITHUB_TOKEN;
  if (envToken) {
    return envToken;
  }

  // Fall back to header token if provided
  if (request) {
    const headerToken = request.headers.get('x-github-token');
    if (headerToken) {
      return headerToken;
    }
  }

  return null;
}

/**
 * Check if a GitHub token is configured in environment
 */
export function hasEnvToken(): boolean {
  return !!process.env.GITHUB_TOKEN;
}
