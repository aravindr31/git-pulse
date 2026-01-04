import { LanguageStats } from '@/types/github';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

const QUERY_FOR_BADGES = `
query userTrophyInfo($login: String!) {
  user(login: $login) {
    name
    createdAt
    # 1. Followers for Follower Trophies
    followers { totalCount }
    
    # 2. Merged PRs for PR Trophies
    mergedPRs: pullRequests(states: MERGED) { totalCount }
    
    # 3. Public Gists for Secret Trophies
    publicGists: gists(privacy: PUBLIC) { totalCount }
    
    # 4. Aggregates for Stars and Language Count
    # We use a smaller limit (100) as you only need up to 15 languages for S-tier
    repositories(
      first: 100, 
      ownerAffiliations: OWNER, 
      orderBy: {field: STARGAZERS, direction: DESC}
    ) {
      totalCount
      nodes {
        stargazerCount
        primaryLanguage {
          name
        }
      }
    }

    # 5. Total Contributions (All-time summary without the calendar grid)
    contributionsCollection {
      totalCommitContributions
      restrictedContributionsCount
    }
  }
}
`
const QUERY_FOR_RANKING = `
query userRankingInfo($login: String!) {
  user(login: $login) {
    # 1. Followers for ranking
    followers {
      totalCount
    }
    # 2. Merged PRs specifically (more merit-based than total PRs)
    mergedPRs: pullRequests(states: MERGED) {
      totalCount
    }
    # 3. Repository Stars (limit to 100 for performance)
    repositories(
      first: 100
      ownerAffiliations: OWNER
      orderBy: {field: STARGAZERS, direction: DESC}
    ) {
      nodes {
        stargazerCount
      }
    }
    # 4. All-Time Totals (This replaces the need for multi-year fetching)
    contributionsCollection {
      totalCommitContributions
      totalIssueContributions
      totalPullRequestReviewContributions
      totalRepositoryContributions
      restrictedContributionsCount
    }
  }
}
`

const QUERY_FOR_STREAKS = `
query userAllTimeStreak($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from to: $to) {
      totalCommitContributions
      totalPullRequestReviewContributions
      totalIssueContributions
      totalRepositoryContributions
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks { 
          contributionDays { 
            date 
            contributionCount 
            } 
          }
      }
    }
  }
}
`

const UNIFIED_DASHBOARD_QUERY = `
query unifiedDashboard($login: String!) {
  user(login: $login) {
    # 1. ProfileCard Data
    name
    login
    avatarUrl
    bio
    company
    location
    websiteUrl
    createdAt
    twitterUsername
    followers { totalCount }
    following { totalCount }
    publicGists: gists(privacy: PUBLIC) { totalCount }
    
    # 2. RepoList & LangChart Data
    repositories(
      first: 50, 
      ownerAffiliations: OWNER, 
      orderBy: {field: STARGAZERS, direction: DESC}
    ) {
      totalCount
      nodes {
        id
        name
        description
        url: url
        stargazerCount
        forkCount
        pushedAt
        primaryLanguage {
          name
        }
        watchers { totalCount }
        openIssues: issues(states: OPEN) { totalCount }
        repositoryTopics(first: 5) {
          nodes {
            topic {
              name
            }
          }
        }
      }
    }

    # 3. UserRank & Badge Logic (Merged PRs & All-time Stats)
    mergedPRs: pullRequests(states: MERGED) {
      totalCount
    }
    contributionsCollection {
      totalCommitContributions
      totalIssueContributions
      totalPullRequestReviewContributions
      totalRepositoryContributions
      restrictedContributionsCount
    }
  }
}
`

interface ContributionDay {
  date: string;
  count: number;
}
export async function fetchUnifiedDashboardData(username: string, token?: string) {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Cloudflare-Worker-App',
    },
    body: JSON.stringify({
      query: UNIFIED_DASHBOARD_QUERY,
      variables: { login: username },
    }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);

  const user = result.data.user;

  // Flatten the stats so calculateTrophies and calculateUserRank work perfectly
  return {
    ...user,
    allTimeContributions: {
      contributionDays: [], // We don't need the grid for these 5 components
      stats: {
        totalCommitContributions: user.contributionsCollection.totalCommitContributions,
        totalPullRequestReviewContributions: user.contributionsCollection.totalPullRequestReviewContributions,
        totalIssueContributions: user.contributionsCollection.totalIssueContributions,
        totalRepositoryContributions: user.contributionsCollection.totalRepositoryContributions,
        restrictedContributionsCount: user.contributionsCollection.restrictedContributionsCount,
      }
    }
  };
}

export async function fetchBadgeData(username: string, token?: string) {
  console.log('Fetching badge data for', username);
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Cloudflare-Worker-App',
    },
    body: JSON.stringify({
      query: QUERY_FOR_BADGES,
      variables: { login: username },
    }),
  });

  if (!response.ok) throw new Error('Failed to fetch badge data');
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);

  const user = result.data.user;

  return {
      ...user,
      allTimeContributions: {
        contributionDays: [], // Empty because badges don't need the calendar
        stats: {
          totalCommitContributions: user.contributionsCollection.totalCommitContributions,
          totalPullRequestReviewContributions: 0, // Mocked to prevent UI errors
          totalIssueContributions: 0,
          totalRepositoryContributions: 0,
          restrictedContributionsCount: user.contributionsCollection.restrictedContributionsCount,
        },
      },
    };
}

export async function fetchRankingData(username: string, token?: string) {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Cloudflare-Worker-App',
    },
    body: JSON.stringify({
      query: QUERY_FOR_RANKING,
      variables: { login: username },
    }),
  });

  const result = await response.json();
  const user = result.data.user;

  // Transform to match ranking.ts expectations
  return {
    ...user,
    allTimeContributions: {
      contributionDays: [], // Ranking doesn't need the actual calendar
      stats: {
        totalCommitContributions: user.contributionsCollection.totalCommitContributions,
        totalPullRequestReviewContributions: user.contributionsCollection.totalPullRequestReviewContributions,
        totalIssueContributions: user.contributionsCollection.totalIssueContributions,
        totalRepositoryContributions: user.contributionsCollection.totalRepositoryContributions,
        restrictedContributionsCount: user.contributionsCollection.restrictedContributionsCount,
      }
    }
  };
}

export async function fetchStreakData(username: string, token?: string) {
  const from  = new Date();
  from.setFullYear(from .getFullYear() - 1);

  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Cloudflare-Worker-App',
    },
    body: JSON.stringify({
      query: QUERY_FOR_STREAKS,
      variables: { 
        login: username, 
        from: from.toISOString(),
        to: (new Date()).toISOString()
      },
    }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  
  const collection = result.data.user.contributionsCollection;

  const contributionDays =
    collection.contributionCalendar.weeks.flatMap((w: any) =>
      w.contributionDays.map((d: any) => ({
        date: d.date,
        count: d.contributionCount,
      }))
    );

  return {
    allTimeContributions: {
      contributionDays,
      stats: {
        totalCommitContributions: collection.totalCommitContributions,
        totalPullRequestReviewContributions: collection.totalPullRequestReviewContributions,
        totalIssueContributions: collection.totalIssueContributions,
        totalRepositoryContributions: collection.totalRepositoryContributions,
        restrictedContributionsCount: collection.restrictedContributionsCount,
      },
    },
  };
}

export function calculateLanguageStats(repoNodes: any[]): LanguageStats {
  const stats: LanguageStats = {};
  repoNodes.forEach((repo) => {
    if (repo.primaryLanguage?.name) {
      const lang = repo.primaryLanguage.name;
      stats[lang] = (stats[lang] || 0) + 1;
    }
  });
  return stats;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
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