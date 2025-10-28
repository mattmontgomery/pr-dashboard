'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Repository } from '../types';
import { rehydrateRepository } from '../types';

interface UseRepositoriesOptions {
  token: string | null;
  autoFetch?: boolean;
}

interface UseRepositoriesResult {
  repositories: Repository[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRepositories({
  token,
  autoFetch = true,
}: UseRepositoriesOptions): UseRepositoriesResult {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRepositories = useCallback(async () => {
    if (!token) {
      setError('GitHub token is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const headers: HeadersInit = {};
      // Only send token header if it's a user-provided token (not 'server-configured')
      if (token !== 'server-configured') {
        headers['x-github-token'] = token;
      }

      const response = await fetch('/api/github/repos?perPage=100', {
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch repositories');
      }

      const data = await response.json();
      setRepositories((data.data || []).map(rehydrateRepository));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (autoFetch && token) {
      fetchRepositories();
    }
  }, [token, autoFetch, fetchRepositories]);

  return {
    repositories,
    isLoading,
    error,
    refetch: fetchRepositories,
  };
}
