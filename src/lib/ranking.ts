import { RankGrade,RankResult } from '@/types/github';

interface ContributionDay {
  date: string;
  count: number;
}

export function getRankColor(grade: RankGrade): string {
  const colors: Record<string, string> = {
    'S': '#FFD700',
    'A+++': '#E5E7EB', 'A++': '#D1D5DB', 'A+': '#9CA3AF', 'A': '#6B7280',
    'B+++': '#60A5FA', 'B++': '#3B82F6', 'B+': '#2563EB', 'B': '#1D4ED8',
    'C+++': '#4ADE80', 'C++': '#22C55E', 'C+': '#16A34A', 'C': '#15803D',
    'D': '#475569',
  };
  return colors[grade] || '#475569';
}

const exponential_cdf = (x: number) => 1 - 2 ** -x;
const log_normal_cdf = (x: number) => x / (1 + x);


export function calculateUserRank(githubData: any): RankResult {

  const allTimeData = githubData?.allTimeContributions;

  const days: ContributionDay[] = allTimeData.contributionDays;

  days.sort((a, b) => a.date.localeCompare(b.date));

  // Calculate total contributions from all-time stats
  const stats = allTimeData.stats;
  const totalContributions =
    stats.totalCommitContributions +
    stats.totalPullRequestReviewContributions +
    stats.totalIssueContributions +
    stats.totalRepositoryContributions +
    stats.restrictedContributionsCount;

  // 1. Extract totals from GraphQL structure
  const commits = stats.totalCommitContributions;
  const prs = githubData.mergedPRs.totalCount; 
  const issues = stats.totalIssueContributions;
  const reviews = stats.totalPullRequestReviewContributions;
  const followers = githubData.followers.totalCount;
  const totalStars = githubData.repositories.nodes.reduce(
    (sum: number, repo: any) => sum + (repo.stargazerCount || 0), 
    0
  );

  // 2. Medians & Weights (Difficulty Setting)
  // Adjusted for all-time totals (since GraphQL gives all-time data)
  const COMMITS_MEDIAN = 1000, COMMITS_WEIGHT = 2;
  const PRS_MEDIAN = 50,      PRS_WEIGHT = 3;
  const ISSUES_MEDIAN = 25,    ISSUES_WEIGHT = 1;
  const REVIEWS_MEDIAN = 10,   REVIEWS_WEIGHT = 1;
  const STARS_MEDIAN = 50,     STARS_WEIGHT = 4;
  const FOLLOWERS_MEDIAN = 20, FOLLOWERS_WEIGHT = 1;

  const TOTAL_WEIGHT = 
    PRS_WEIGHT + COMMITS_WEIGHT + ISSUES_WEIGHT + 
    STARS_WEIGHT + FOLLOWERS_WEIGHT + REVIEWS_WEIGHT;

  // 3. Weighted CDF Calculation
  const weightedSum = (
    (PRS_WEIGHT * exponential_cdf(prs / PRS_MEDIAN)) +
    (COMMITS_WEIGHT * exponential_cdf(commits / COMMITS_MEDIAN)) +
    (ISSUES_WEIGHT * exponential_cdf(issues / ISSUES_MEDIAN)) +
    (STARS_WEIGHT * log_normal_cdf(totalStars / STARS_MEDIAN)) +
    (FOLLOWERS_WEIGHT * log_normal_cdf(followers / FOLLOWERS_MEDIAN)) +
    (REVIEWS_WEIGHT * exponential_cdf(reviews / REVIEWS_MEDIAN))
  );

  // Percentile: 0 is best (Top 0%), 100 is worst
  const rankValue = 1 - (weightedSum / TOTAL_WEIGHT);
  const percentile = Math.max(0.01, rankValue * 100); 

  const RANK_MAP: { threshold: number; grade: RankGrade }[] = [
    { threshold: 1,    grade: 'S' },    
    { threshold: 3,    grade: 'A+++' }, 
    { threshold: 7,    grade: 'A++' },  
    { threshold: 12,   grade: 'A+' },   
    { threshold: 20,   grade: 'A' },    
    { threshold: 28,   grade: 'B+++' },
    { threshold: 36,   grade: 'B++' },
    { threshold: 44,   grade: 'B+' },
    { threshold: 55,   grade: 'B' },
    { threshold: 65,   grade: 'C+++' },
    { threshold: 75,   grade: 'C++' },
    { threshold: 85,   grade: 'C+' },
    { threshold: 95,   grade: 'C' },
  ];

  const grade = RANK_MAP.find((r) => percentile <= r.threshold)?.grade || 'D';

  return {
    grade,
    percentile: parseFloat(percentile.toFixed(2)),
    score: Math.round(100 - percentile), 
    breakdown: {
      stars: totalStars,
      commits: commits,
      prs: prs,
      issues: issues,
    },
  };
}