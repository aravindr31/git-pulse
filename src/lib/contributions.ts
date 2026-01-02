import { GitHubEvent } from '@/types/github';

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionData {
  days: ContributionDay[];
  totalContributions: number;
  longestStreak: number;
  currentStreak: number;
}

function getContributionLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

export function calculateContributions(events: GitHubEvent[]): ContributionData {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 365);

  // Create a map of dates to event counts
  const eventCounts: Record<string, number> = {};
  
  events.forEach((event) => {
    const date = event.created_at.split('T')[0];
    eventCounts[date] = (eventCounts[date] || 0) + 1;
  });

  // Generate all days for the past year
  const days: ContributionDay[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const count = eventCounts[dateStr] || 0;
    days.push({
      date: dateStr,
      count,
      level: getContributionLevel(count),
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Calculate streaks
  let longestStreak = 0;
  let currentStreak = 0;
  let tempStreak = 0;

  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) {
      tempStreak++;
      if (i === days.length - 1 || days[i + 1].count > 0 || i === days.length - 1) {
        currentStreak = tempStreak;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      if (i === days.length - 1) {
        currentStreak = 0;
      }
      tempStreak = 0;
    }
  }

  // Recalculate current streak properly
  currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  const totalContributions = Object.values(eventCounts).reduce((sum, count) => sum + count, 0);

  return {
    days,
    totalContributions,
    longestStreak,
    currentStreak,
  };
}

export function getLevelColor(level: number, theme: 'dark' | 'light' = 'dark'): string {
  const darkColors = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
  const lightColors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
  return theme === 'dark' ? darkColors[level] : lightColors[level];
}
