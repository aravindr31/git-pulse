import { GitHubUser, GitHubRepo, GitHubEvent, LanguageStats } from '@/types/github';

const BASE_URL = 'https://api.github.com';

export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const response = await fetch(`${BASE_URL}/users/${username}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('User not found');
    }
    throw new Error('Failed to fetch user data');
  }
  return response.json();
}

export async function fetchGitHubRepos(username: string): Promise<GitHubRepo[]> {
  const response = await fetch(
    `${BASE_URL}/users/${username}/repos?sort=updated&per_page=100`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch repositories');
  }
  return response.json();
}

export async function fetchGitHubEvents(username: string): Promise<GitHubEvent[]> {
  const response = await fetch(
    `${BASE_URL}/users/${username}/events/public?per_page=30`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  return response.json();
}

export function calculateLanguageStats(repos: GitHubRepo[]): LanguageStats {
  const stats: LanguageStats = {};
  repos.forEach((repo) => {
    if (repo.language) {
      stats[repo.language] = (stats[repo.language] || 0) + 1;
    }
  });
  return stats;
}

export function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Java: '#b07219',
    Go: '#00ADD8',
    Rust: '#dea584',
    Ruby: '#701516',
    PHP: '#4F5D95',
    CSS: '#563d7c',
    HTML: '#e34c26',
    Shell: '#89e051',
    C: '#555555',
    'C++': '#f34b7d',
    'C#': '#178600',
    Swift: '#ffac45',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    Vue: '#41b883',
    Svelte: '#ff3e00',
  };
  return colors[language] || '#8b949e';
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(dateString);
}
