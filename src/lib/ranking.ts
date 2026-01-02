import { GitHubUser, GitHubRepo } from '@/types/github';

export type RankGrade = 'S' | 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D';

export interface RankResult {
  grade: RankGrade;
  score: number;
  breakdown: {
    followers: number;
    repos: number;
    stars: number;
    forks: number;
    accountAge: number;
  };
}

export function calculateUserRank(user: GitHubUser, repos: GitHubRepo[]): RankResult {
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
  
  const accountAgeYears = (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365);
  
  // Score calculations (logarithmic scaling for fairness)
  const followerScore = Math.min(30, Math.log10(user.followers + 1) * 10);
  const repoScore = Math.min(15, Math.log10(user.public_repos + 1) * 7);
  const starScore = Math.min(30, Math.log10(totalStars + 1) * 8);
  const forkScore = Math.min(15, Math.log10(totalForks + 1) * 6);
  const ageScore = Math.min(10, accountAgeYears * 1.5);
  
  const totalScore = followerScore + repoScore + starScore + forkScore + ageScore;
  
  let grade: RankGrade;
  if (totalScore >= 85) grade = 'S';
  else if (totalScore >= 75) grade = 'A+';
  else if (totalScore >= 65) grade = 'A';
  else if (totalScore >= 55) grade = 'A-';
  else if (totalScore >= 45) grade = 'B+';
  else if (totalScore >= 38) grade = 'B';
  else if (totalScore >= 30) grade = 'B-';
  else if (totalScore >= 22) grade = 'C+';
  else if (totalScore >= 15) grade = 'C';
  else if (totalScore >= 8) grade = 'C-';
  else grade = 'D';
  
  return {
    grade,
    score: Math.round(totalScore),
    breakdown: {
      followers: Math.round(followerScore),
      repos: Math.round(repoScore),
      stars: Math.round(starScore),
      forks: Math.round(forkScore),
      accountAge: Math.round(ageScore),
    },
  };
}

export function getRankColor(grade: RankGrade): string {
  const colors: Record<RankGrade, string> = {
    'S': '#FFD700',
    'A+': '#C0C0C0',
    'A': '#CD7F32',
    'A-': '#98FB98',
    'B+': '#87CEEB',
    'B': '#DDA0DD',
    'B-': '#F0E68C',
    'C+': '#D3D3D3',
    'C': '#A9A9A9',
    'C-': '#808080',
    'D': '#696969',
  };
  return colors[grade];
}
