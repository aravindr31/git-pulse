import { GitHubUser, GitHubRepo, GitHubEvent } from '@/types/github';

export type TrophyTier = 'S' | 'AAA' | 'AA' | 'A' | 'B' | 'C' | 'SECRET';

export interface Trophy {
  id: string;
  name: string;
  description: string;
  tier: TrophyTier;
  icon: string;
  achieved?: boolean;
  progress?: number;
  maxProgress?: number;
}
interface ContributionDay {
  date: string;
  count: number;
}
export function getTierColor(tier: TrophyTier): string {
  const colors: Record<TrophyTier, string> = {
    'S': '#FFD700',      // Gold
    'AAA': '#F5F5F5',    // Platinum/Silver
    'AA': '#FFA726',     // Bronze/Amber
    'A': '#00E676',      // Success Green
    'B': '#2979FF',      // Tech Blue
    'C': '#78909C',      // Steel/Slate
    'SECRET': '#FF00E4', // Neon Magenta/Cyber
  };
  return colors[tier] || '#9E9E9E';
}

export function calculateTrophies(githubData: any): Trophy[] {
  if (!githubData) return [];

  // --- DATA EXTRACTION FROM GRAPHQL STRUCTURE ---
  const totalStars = githubData.repositories.nodes.reduce(
    (sum: number, repo: any) => sum + (repo.stargazerCount || 0), 0
  );
  const totalForks = githubData.repositories.nodes.reduce(
    (sum: number, repo: any) => sum + (repo.forkCount || 0), 0
  );
  const languages = new Set(
    githubData.repositories.nodes
      .map((r: any) => r.primaryLanguage?.name)
      .filter(Boolean)
  );
  
  // Get all-time contribution data
  const allTimeData = githubData?.allTimeContributions;

  const days: ContributionDay[] = allTimeData.contributionDays;

  // Sort days oldest to newest (should already be sorted, but just in case)
  days.sort((a, b) => a.date.localeCompare(b.date));

  // Calculate total contributions from all-time stats
  const stats = allTimeData.stats;

  const accountAgeYears = (Date.now() - new Date(githubData.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365);
  
  // NEW: Using GraphQL All-Time Totals instead of 90-day REST events
  const allTimeCommits = stats.totalCommitContributions;
  const mergedPRs = githubData.mergedPRs.totalCount;
  const totalFollowers = githubData.followers.totalCount;
  const totalRepos = githubData.repositories.totalCount;

  const trophies: Trophy[] = [];

  // --- 1. COMMIT TROPHIES (Using All-Time Data) ---
const commitTiers: [number, TrophyTier, string][] = [
  [10000, 'S', 'GIT COMMANDER'],
  [5000, 'AAA', 'CODE MAESTRO'],
  [1000, 'AA', 'KEYBOARD NINJA'],
  [500, 'A', 'STEADY CODER'],
  [100, 'B', 'DEV IN MOTION'],
  [10, 'C', 'HELLO WORLD'],
];

  for (const [threshold, tier, name] of commitTiers) {
    if (allTimeCommits >= threshold) {
      trophies.push({
        id: `commits-${tier}`,
        name,
        description: `${threshold}+ all-time commits`,
        tier,
        icon: '⌨️',
        progress: allTimeCommits,
        maxProgress: threshold,
      });
      break;
    }
  }

  // --- 2. STAR TROPHIES ---
const starTiers: [number, TrophyTier, string][] = [
  [10000, 'S', 'CELESTIAL ARCHITECT'],
  [5000, 'AAA', 'SUPERNOVA'],
  [1000, 'AA', 'STELLAR COLLECTOR'],
  [500, 'A', 'SHOOTING STAR'],
  [100, 'B', 'STAR SEEKER'],
  [10, 'C', 'SPARK'],
];
  for (const [threshold, tier, name] of starTiers) {
    if (totalStars >= threshold) {
      trophies.push({ id: `stars-${tier}`, name, description: `Earned ${threshold}+ total stars`, tier, icon: '⭐', progress: totalStars, maxProgress: threshold });
      break;
    }
  }

  // --- 3. FOLLOWER TROPHIES ---
const followerTiers: [number, TrophyTier, string][] = [
  [1000, 'S', 'TRIBE LEADER'],
  [500, 'AAA', 'TRENDSETTER'],
  [250, 'AA', 'DEV ICON'],
  [100, 'A', 'RECOGNIZED'],
  [50, 'B', 'NETWORK BUILDER'],
  [10, 'C', 'HELLO CROWD'],
];
  for (const [threshold, tier, name] of followerTiers) {
    if (totalFollowers >= threshold) {
      trophies.push({ id: `followers-${tier}`, name, description: `Gained ${threshold}+ followers`, tier, icon: '👥', progress: totalFollowers, maxProgress: threshold });
      break;
    }
  }

  // --- 4. MERGED PR TROPHIES (New Merit-based Category) ---
const prTiers: [number, TrophyTier, string][] = [
  [500, 'S', 'PULL REQUEST CHAMPION'],
  [100, 'AAA', 'REPO KEEPER'],
  [50, 'AA', 'CODE ALLY'],
  [20, 'A', 'TEAM PLAYER'],
  [5, 'B', 'ASSIST DEV'],
  [1, 'C', 'FIRST PR'],
];
  for (const [threshold, tier, name] of prTiers) {
    if (mergedPRs >= threshold) {
      trophies.push({ id: `prs-${tier}`, name, description: `${threshold}+ merged pull requests`, tier, icon: '🚀', progress: mergedPRs, maxProgress: threshold });
      break;
    }
  }

  // --- 5. LANGUAGE TROPHIES ---
const langTiers: [number, TrophyTier, string][] = [
  [15, 'S', 'CODE POLYGLOT'],
  [10, 'AAA', 'LANGUAGE VIRTUOSO'],
  [7, 'AA', 'SYNTAX EXPLORER'],
  [5, 'A', 'VERSATILE CODER'],
  [3, 'B', 'APPRENTICE CODER'],
  [1, 'C', 'FIRST SYNTAX'],
];
  for (const [threshold, tier, name] of langTiers) {
    if (languages.size >= threshold) {
      trophies.push({ id: `languages-${tier}`, name, description: `Used ${threshold}+ languages`, tier, icon: '🌐', progress: languages.size, maxProgress: threshold });
      break;
    }
  }

  // --- 6. ACCOUNT AGE TROPHIES ---
const ageTiers: [number, TrophyTier, string][] = [
  [10, 'S', 'PLATFORM VETERAN'],
  [7, 'AAA', 'TIME KEEPER'],
  [5, 'AA', 'SEASONED DEV'],
  [3, 'A', 'ACTIVE CONTRIBUTOR'],
  [1, 'B', 'COMMITTED DEV'],
  [0.5, 'C', 'FRESH REPO'],
];

  for (const [threshold, tier, name] of ageTiers) {
    if (accountAgeYears >= threshold) {
      trophies.push({ id: `age-${tier}`, name, description: `Member for ${threshold}+ years`, tier, icon: '🏆', progress: Math.floor(accountAgeYears), maxProgress: threshold });
      break;
    }
  }

  // --- 7. SECRET TROPHIES ---
if (githubData.publicGists?.totalCount >= 100) {
  trophies.push({
    id: 'gist-master',
    name: 'GIST COLLECTOR',
    description: `${githubData.publicGists.totalCount} public gists created`,
    tier: 'SECRET',
    icon: '📝',
  });
}

  // Sort by tier importance
  const tierOrder: Record<TrophyTier, number> = { 'S': 0, 'AAA': 1, 'AA': 2, 'A': 3, 'B': 4, 'C': 5, 'SECRET': 6 };
  trophies.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);

  return trophies;
}