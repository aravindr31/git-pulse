export type StreakStats = {
  totalContributions: number;
  currentStreak: {
    days: number;
    from: string | null;
    to: string | null;
  };
  longestStreak: {
    days: number;
    from: string | null;
    to: string | null;
  };
};

interface ContributionDay {
  date: string;
  count: number;
}

export function calculateStreaks(githubData: any): StreakStats {
  // Get all-time contribution data
  const allTimeData = githubData?.allTimeContributions;

  if (!allTimeData?.contributionDays || allTimeData.contributionDays.length === 0) {
    return {
      totalContributions: 0,
      currentStreak: { days: 0, from: null, to: null },
      longestStreak: { days: 0, from: null, to: null },
    };
  }

  const days: ContributionDay[] = allTimeData.contributionDays;

  // Sort days oldest to newest (should already be sorted, but just in case)
  days.sort((a, b) => a.date.localeCompare(b.date));

  // Calculate total contributions from all-time stats
  const stats = allTimeData.stats;
  const totalContributions =
    stats.totalCommitContributions +
    stats.totalPullRequestReviewContributions +
    stats.totalIssueContributions +
    stats.totalRepositoryContributions +
    stats.restrictedContributionsCount;

  // ---- Calculate longest streak ----
  let longestStreak = 0;
  let longestStart: string | null = null;
  let longestEnd: string | null = null;
  let currentRun = 0;
  let currentRunStart: string | null = null;

  for (const day of days) {
    if (day.count > 0) {
      currentRun++;
      if (!currentRunStart) currentRunStart = day.date;

      if (currentRun > longestStreak) {
        longestStreak = currentRun;
        longestStart = currentRunStart;
        longestEnd = day.date;
      }
    } else {
      currentRun = 0;
      currentRunStart = null;
    }
  }

  // ---- Calculate current streak ----
  let currentStreak = 0;
  let currentStart: string | null = null;
  let currentEnd: string | null = null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reversed = [...days].reverse();

  // Find the most recent contribution
  const mostRecentContribution = reversed.find((day) => day.count > 0);

  if (mostRecentContribution) {
    const mostRecentDate = new Date(mostRecentContribution.date);
    mostRecentDate.setHours(0, 0, 0, 0);

    const daysSinceLastContribution = Math.floor(
      (today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // If last contribution was today or yesterday (1-day grace period), count the streak
    if (daysSinceLastContribution <= 1) {
      for (const day of reversed) {
        if (day.count > 0) {
          currentStreak++;
          currentStart = day.date;
          if (!currentEnd) currentEnd = day.date;
        } else if (currentStreak > 0) {
          // Once we've started counting and hit a zero, stop
          break;
        }
      }
    }
  }

  return {
    totalContributions,
    currentStreak: {
      days: currentStreak,
      from: currentStart,
      to: currentEnd,
    },
    longestStreak: {
      days: longestStreak,
      from: longestStart,
      to: longestEnd,
    },
  };
}