import { GitHubUser, GitHubRepo, GitHubEvent, LanguageStats } from '@/types/github';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

/**
 * Query to get basic user info and account creation date
 */
const USER_BASIC_INFO_QUERY = `
query userBasicInfo($login: String!) {
  user(login: $login) {
    name
    login
    avatarUrl
    bio
    company
    location
    websiteUrl
    createdAt
    twitterUsername

    pullRequests { totalCount }
    mergedPRs: pullRequests(states: MERGED) { totalCount }
    followers { totalCount }
    following { totalCount }
    repositoryDiscussions { totalCount }
    publicGists: gists(privacy: PUBLIC) { totalCount }

    repositories(
      first: 100, 
      ownerAffiliations: OWNER, 
      orderBy: {field: STARGAZERS, direction: DESC}
    ) {
      totalCount
      nodes {
        name
        description
        url
        stargazerCount
        forkCount
        watchers { totalCount }
        issues { totalCount }
        openIssues: issues(states: OPEN) { totalCount }
        closedIssues: issues(states: CLOSED) { totalCount }
        repositoryTopics(first: 10) {
          nodes {
            topic {
              name
            }
          }
        }
        pushedAt
        updatedAt
        createdAt
        primaryLanguage {
          name
        }
      }
    }
  }
}
`;

/**
 * Query to get contributions for a specific year range
 */
const CONTRIBUTIONS_QUERY = `
query userContributions($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
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
`;

interface ContributionDay {
  date: string;
  count: number;
}

/**
 * Fetches contributions for a specific year
 */
async function fetchContributionsForYear(
  username: string,
  year: number,
  isCurrentYear: boolean = false
) {
  const from = `${year}-01-01T00:00:00Z`;
  const to = isCurrentYear
    ? new Date().toISOString()
    : `${year}-12-31T23:59:59Z`;

  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Authorization: `bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: CONTRIBUTIONS_QUERY,
      variables: { login: username, from, to },
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API returned ${response.status}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data.user.contributionsCollection;
}

/**
 * Fetches all contributions since account creation
 */
async function fetchAllContributions(username: string, createdAt: string) {
  const accountCreationDate = new Date(createdAt);
  const startYear = accountCreationDate.getFullYear();
  const currentYear = new Date().getFullYear();

  const allContributionDays: ContributionDay[] = [];
  let totalStats = {
    totalCommitContributions: 0,
    totalPullRequestReviewContributions: 0,
    totalIssueContributions: 0,
    totalRepositoryContributions: 0,
    restrictedContributionsCount: 0,
  };

  console.log(`Fetching contributions from ${startYear} to ${currentYear}...`);

  // Fetch contributions year by year with a small delay to avoid rate limiting
  for (let year = startYear; year <= currentYear; year++) {
    console.log(`Fetching year ${year}...`);
    
    const isCurrentYear = year === currentYear;
    const contributionsData = await fetchContributionsForYear(
      username,
      year,
      isCurrentYear
    );

    // Accumulate totals
    totalStats.totalCommitContributions += contributionsData.totalCommitContributions;
    totalStats.totalPullRequestReviewContributions += contributionsData.totalPullRequestReviewContributions;
    totalStats.totalIssueContributions += contributionsData.totalIssueContributions;
    totalStats.totalRepositoryContributions += contributionsData.totalRepositoryContributions;
    totalStats.restrictedContributionsCount += contributionsData.restrictedContributionsCount;

    // Extract contribution days
    if (contributionsData.contributionCalendar?.weeks) {
      const yearDays = contributionsData.contributionCalendar.weeks.flatMap(
        (week: any) =>
          week.contributionDays.map((day: any) => ({
            date: day.date,
            count: day.contributionCount,
          }))
      );
      allContributionDays.push(...yearDays);
    }

    // Small delay to avoid rate limiting (optional, but recommended)
    if (year < currentYear) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`Total contributions fetched: ${totalStats.totalCommitContributions + totalStats.totalPullRequestReviewContributions + totalStats.totalIssueContributions + totalStats.totalRepositoryContributions + totalStats.restrictedContributionsCount}`);

  return {
    contributionDays: allContributionDays,
    stats: totalStats,
  };
}

/**
 * Fetches the complete GitHub data including all-time contributions
 */
export async function fetchGitHubData(username: string) {
  // First, fetch basic user info
  const basicResponse = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Authorization: `bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: USER_BASIC_INFO_QUERY,
      variables: { login: username },
    }),
  });

  if (!basicResponse.ok) {
    throw new Error(`GitHub API returned ${basicResponse.status}`);
  }

  const basicResult = await basicResponse.json();

  if (basicResult.errors) {
    throw new Error(basicResult.errors[0].message);
  }

  const userData = basicResult.data.user;

  // Fetch all contributions since account creation
  const { contributionDays, stats } = await fetchAllContributions(
    username,
    userData.createdAt
  );

  // Combine all data
  return {
    ...userData,
    allTimeContributions: {
      contributionDays,
      stats,
    },
  };
}

/**
 * Legacy REST function for Events (Recent activity timeline)
 */
export async function fetchGitHubEvents(username: string): Promise<GitHubEvent[]> {
  const response = await fetch(
    `https://api.github.com/users/${username}/events/public?per_page=30`
  );
  if (!response.ok) throw new Error('Failed to fetch events');
  return response.json();
}

/**
 * Formats numbers into human-readable strings (e.g., 1.2k)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

/**
 * Formats a raw date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Helper to extract language stats from the GraphQL nodes
 */
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