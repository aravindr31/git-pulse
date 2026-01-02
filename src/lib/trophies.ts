import { GitHubUser, GitHubRepo, GitHubEvent } from '@/types/github';

export type TrophyTier = 'S' | 'AAA' | 'AA' | 'A' | 'B' | 'C' | 'SECRET';

export interface Trophy {
  id: string;
  name: string;
  description: string;
  tier: TrophyTier;
  icon: string;
  achieved: boolean;
  progress?: number;
  maxProgress?: number;
}

export function getTierColor(tier: TrophyTier): string {
  const colors: Record<TrophyTier, string> = {
    'S': '#FFD700',
    'AAA': '#C0C0C0',
    'AA': '#CD7F32',
    'A': '#4CAF50',
    'B': '#2196F3',
    'C': '#9E9E9E',
    'SECRET': '#9C27B0',
  };
  return colors[tier];
}

export function calculateTrophies(user: GitHubUser, repos: GitHubRepo[], events: GitHubEvent[]): Trophy[] {
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
  const languages = new Set(repos.map(r => r.language).filter(Boolean));
  const accountAgeYears = (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365);
  
  const trophies: Trophy[] = [];
  
  // Star Trophies
  const starTiers: [number, TrophyTier, string][] = [
    [10000, 'S', 'SuperStar'],
    [5000, 'AAA', 'MegaStar'],
    [1000, 'AA', 'Star Collector'],
    [500, 'A', 'Rising Star'],
    [100, 'B', 'Star Gatherer'],
    [10, 'C', 'First Stars'],
  ];
  
  for (const [threshold, tier, name] of starTiers) {
    if (totalStars >= threshold) {
      trophies.push({
        id: `stars-${tier}`,
        name,
        description: `Earned ${threshold}+ total stars`,
        tier,
        icon: '⭐',
        achieved: true,
        progress: totalStars,
        maxProgress: threshold,
      });
      break;
    }
  }
  
  // Follower Trophies
  const followerTiers: [number, TrophyTier, string][] = [
    [10000, 'S', 'Famous'],
    [5000, 'AAA', 'Influencer'],
    [1000, 'AA', 'Popular'],
    [500, 'A', 'Well Known'],
    [100, 'B', 'Growing Community'],
    [10, 'C', 'First Followers'],
  ];
  
  for (const [threshold, tier, name] of followerTiers) {
    if (user.followers >= threshold) {
      trophies.push({
        id: `followers-${tier}`,
        name,
        description: `Gained ${threshold}+ followers`,
        tier,
        icon: '👥',
        achieved: true,
        progress: user.followers,
        maxProgress: threshold,
      });
      break;
    }
  }
  
  // Repository Trophies
  const repoTiers: [number, TrophyTier, string][] = [
    [500, 'S', 'Repository Master'],
    [200, 'AAA', 'Prolific Creator'],
    [100, 'AA', 'Active Creator'],
    [50, 'A', 'Repository Builder'],
    [20, 'B', 'Getting Started'],
    [5, 'C', 'First Repos'],
  ];
  
  for (const [threshold, tier, name] of repoTiers) {
    if (user.public_repos >= threshold) {
      trophies.push({
        id: `repos-${tier}`,
        name,
        description: `Created ${threshold}+ public repositories`,
        tier,
        icon: '📁',
        achieved: true,
        progress: user.public_repos,
        maxProgress: threshold,
      });
      break;
    }
  }
  
  // Fork Trophies
  const forkTiers: [number, TrophyTier, string][] = [
    [5000, 'S', 'Open Source Legend'],
    [1000, 'AAA', 'Fork Master'],
    [500, 'AA', 'Community Favorite'],
    [100, 'A', 'Forked Often'],
    [50, 'B', 'Growing Forks'],
    [10, 'C', 'First Forks'],
  ];
  
  for (const [threshold, tier, name] of forkTiers) {
    if (totalForks >= threshold) {
      trophies.push({
        id: `forks-${tier}`,
        name,
        description: `Repositories forked ${threshold}+ times`,
        tier,
        icon: '🍴',
        achieved: true,
        progress: totalForks,
        maxProgress: threshold,
      });
      break;
    }
  }
  
  // Language Trophies
  const langTiers: [number, TrophyTier, string][] = [
    [15, 'S', 'Polyglot Master'],
    [10, 'AAA', 'Multi-Linguist'],
    [7, 'AA', 'Language Explorer'],
    [5, 'A', 'Diverse Coder'],
    [3, 'B', 'Learning Languages'],
    [1, 'C', 'First Language'],
  ];
  
  for (const [threshold, tier, name] of langTiers) {
    if (languages.size >= threshold) {
      trophies.push({
        id: `languages-${tier}`,
        name,
        description: `Used ${threshold}+ programming languages`,
        tier,
        icon: '🌐',
        achieved: true,
        progress: languages.size,
        maxProgress: threshold,
      });
      break;
    }
  }
  
  // Account Age Trophies
  const ageTiers: [number, TrophyTier, string][] = [
    [10, 'S', 'GitHub Veteran'],
    [7, 'AAA', 'Long Timer'],
    [5, 'AA', 'Experienced'],
    [3, 'A', 'Regular User'],
    [1, 'B', 'Active Member'],
    [0.5, 'C', 'Newcomer'],
  ];
  
  for (const [threshold, tier, name] of ageTiers) {
    if (accountAgeYears >= threshold) {
      trophies.push({
        id: `age-${tier}`,
        name,
        description: `GitHub member for ${threshold}+ years`,
        tier,
        icon: '🏆',
        achieved: true,
        progress: Math.floor(accountAgeYears),
        maxProgress: threshold,
      });
      break;
    }
  }
  
  // Secret Trophies
  if (user.public_gists >= 100) {
    trophies.push({
      id: 'gist-master',
      name: 'Gist Master',
      description: 'Created 100+ public gists',
      tier: 'SECRET',
      icon: '📝',
      achieved: true,
    });
  }
  
  if (user.bio && user.blog && user.location && user.company) {
    trophies.push({
      id: 'complete-profile',
      name: 'Profile Complete',
      description: 'Filled out all profile information',
      tier: 'SECRET',
      icon: '✨',
      achieved: true,
    });
  }
  
  // Sort by tier importance
  const tierOrder: Record<TrophyTier, number> = { 'S': 0, 'AAA': 1, 'AA': 2, 'A': 3, 'B': 4, 'C': 5, 'SECRET': 6 };
  trophies.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);
  
  return trophies;
}
