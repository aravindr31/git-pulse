export interface ContributionDay {
  date: string;
  count: number;
}

export interface StreakStats {
  totalContributions: number;
  currentStreak: { days: number; from: string | null; to: string | null };
  longestStreak: { days: number; from: string | null; to: string | null };
}

export function calculateStreaks(contributionDays: ContributionDay[], totalStats: any): StreakStats {
  if (!contributionDays || contributionDays.length === 0) {
    return {
      totalContributions: 0,
      currentStreak: { days: 0, from: null, to: null },
      longestStreak: { days: 0, from: null, to: null },
    };
  }

  // 1. Sort days oldest to newest
  const sortedDays = [...contributionDays].sort((a, b) => a.date.localeCompare(b.date));

  // 2. Calculate total contributions
  const totalContributions = 
    (totalStats?.totalCommitContributions || 0) +
    (totalStats?.totalPullRequestReviewContributions || 0) +
    (totalStats?.totalIssueContributions || 0) +
    (totalStats?.totalRepositoryContributions || 0) +
    (totalStats?.restrictedContributionsCount || 0);

  // 3. Calculate longest streak
  let longestStreak = 0;
  let longestStart: string | null = null;
  let longestEnd: string | null = null;
  let tempRun = 0;
  let tempStart: string | null = null;

  for (const day of sortedDays) {
    if (day.count > 0) {
      tempRun++;
      if (!tempStart) tempStart = day.date;
      if (tempRun > longestStreak) {
        longestStreak = tempRun;
        longestStart = tempStart;
        longestEnd = day.date;
      }
    } else {
      tempRun = 0;
      tempStart = null;
    }
  }

  // 4. Calculate current streak (with 48h grace period for Timezones)
  let currentStreak = 0;
  let currentStart: string | null = null;
  let currentEnd: string | null = null;

  const reversed = [...sortedDays].reverse();
  const mostRecent = reversed.find(d => d.count > 0);

  if (mostRecent) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastContribDate = new Date(mostRecent.date);
    lastContribDate.setHours(0, 0, 0, 0);

    // Calculate days between "now" and last contribution
    const diffTime = Math.abs(today.getTime() - lastContribDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If last contrib was today or yesterday (diffDays <= 1), streak is active
    if (diffDays <= 1) {
      for (const day of reversed) {
        if (day.count > 0) {
          currentStreak++;
          currentStart = day.date;
          if (!currentEnd) currentEnd = day.date;
        } else if (currentStreak > 0) {
          break;
        }
      }
    }
  }

  return {
    totalContributions,
    currentStreak: { days: currentStreak, from: currentStart, to: currentEnd },
    longestStreak: { days: longestStreak, from: longestStart, to: longestEnd },
  };
}