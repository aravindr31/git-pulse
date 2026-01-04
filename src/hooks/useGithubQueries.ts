import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL;

const HEADERS = {
  "x-api-key": import.meta.env.VITE_CLIENT_API_KEY || '',
  "Content-Type": "application/json",
  "Accept": "application/json",
};

/**
 * Hook for the main Profile/Dashboard data
 */
export const useGithubData = (username: string | undefined) => {
  return useQuery({
    queryKey: ['github-data', username],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/data?username=${username}`, {
        headers: HEADERS,
      });
      if (!response.ok) throw new Error(await response.text() || 'Failed to fetch dashboard data');
      return response.json();
    },
    enabled: !!username,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

/**
 * Hook for Badge-specific data
 */
export const useGithubBadges = (username: string | undefined) => {
  return useQuery({
    queryKey: ['github-badges', username],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/badges?username=${username}`, { 
        headers: HEADERS,
      });
      if (!response.ok) throw new Error('Failed to fetch badge data');
      return response.json();
    },
    enabled: !!username,
  });
};


export const useGithubStreaks = (username: string | undefined) => {
  return useQuery({
    queryKey: ['github-streaks', username],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/streaks?username=${username}`, {
        headers: HEADERS,
      });
      if (!response.ok) throw new Error('Failed to fetch streak data');
      return response.json();
    },
    enabled: !!username,
  });
};

export const useGithubRank = (username: string | undefined) => {
    return useQuery({
    queryKey: ['github-rank', username],
    queryFn: async () => {
        const response = await fetch(`${API_URL}/api/rank?username=${username}`, {
        headers: HEADERS,
        });
        if (!response.ok) throw new Error('Failed to fetch rank data');
        return response.json();
    },
    enabled: !!username,
    });

}