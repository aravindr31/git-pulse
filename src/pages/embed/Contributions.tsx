import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchGitHubUser, fetchGitHubEvents } from '@/lib/github';
import { calculateContributions, getLevelColor } from '@/lib/contributions';

export default function EmbedContributions() {
  const { username } = useParams<{ username: string }>();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['github-user', username],
    queryFn: () => fetchGitHubUser(username!),
    enabled: !!username,
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['github-events', username],
    queryFn: () => fetchGitHubEvents(username!),
    enabled: !!username && !!user,
  });

  const contributions = events ? calculateContributions(events) : null;

  if (userLoading || eventsLoading || !contributions) {
    return (
      <svg width="800" height="150" xmlns="http://www.w3.org/2000/svg">
        <text x="400" y="75" textAnchor="middle" fill="#666" fontSize="14">Loading...</text>
      </svg>
    );
  }

  // Generate weeks data
  const weeks: typeof contributions.days[] = [];
  let currentWeek: typeof contributions.days = [];

  const firstDay = new Date(contributions.days[0]?.date || new Date());
  const startPadding = firstDay.getDay();
  for (let i = 0; i < startPadding; i++) {
    currentWeek.push({ date: '', count: 0, level: 0 });
  }

  contributions.days.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const cellSize = 12;
  const cellGap = 3;
  const leftPadding = 40;
  const topPadding = 30;
  const width = leftPadding + weeks.length * (cellSize + cellGap) + 20;
  const height = topPadding + 7 * (cellSize + cellGap) + 50;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <svg 
      width={width} 
      height={height} 
      xmlns="http://www.w3.org/2000/svg"
      style={{ background: 'transparent' }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .cell {
          animation: fadeIn 0.3s ease-out forwards;
          opacity: 0;
        }
        .title { font: bold 14px system-ui, sans-serif; fill: #c9d1d9; }
        .subtitle { font: 12px system-ui, sans-serif; fill: #8b949e; }
        .month-label { font: 10px system-ui, sans-serif; fill: #8b949e; }
        .day-label { font: 10px system-ui, sans-serif; fill: #8b949e; }
        .legend-text { font: 10px system-ui, sans-serif; fill: #8b949e; }
      `}</style>

      {/* Title */}
      <text x={leftPadding} y="18" className="title">
        @{username}'s Contributions
      </text>
      <text x={width - 20} y="18" textAnchor="end" className="subtitle">
        {contributions.totalContributions} total • 🔥 {contributions.currentStreak} day streak
      </text>

      {/* Day labels */}
      <text x="5" y={topPadding + cellSize + 4} className="day-label">Mon</text>
      <text x="5" y={topPadding + 3 * (cellSize + cellGap) + 4} className="day-label">Wed</text>
      <text x="5" y={topPadding + 5 * (cellSize + cellGap) + 4} className="day-label">Fri</text>

      {/* Month labels */}
      {weeks.map((week, weekIndex) => {
        const firstValidDay = week.find(d => d.date);
        if (firstValidDay) {
          const date = new Date(firstValidDay.date);
          if (date.getDate() <= 7) {
            return (
              <text 
                key={weekIndex}
                x={leftPadding + weekIndex * (cellSize + cellGap)} 
                y={topPadding - 8}
                className="month-label"
              >
                {months[date.getMonth()]}
              </text>
            );
          }
        }
        return null;
      })}

      {/* Contribution grid */}
      {weeks.map((week, weekIndex) => (
        week.map((day, dayIndex) => (
          <rect
            key={`${weekIndex}-${dayIndex}`}
            className="cell"
            x={leftPadding + weekIndex * (cellSize + cellGap)}
            y={topPadding + dayIndex * (cellSize + cellGap)}
            width={cellSize}
            height={cellSize}
            rx="2"
            fill={getLevelColor(day.level)}
            style={{ animationDelay: `${(weekIndex * 7 + dayIndex) * 2}ms` }}
          >
            {day.date && <title>{day.count} contributions on {day.date}</title>}
          </rect>
        ))
      ))}

      {/* Legend */}
      <text x={width - 140} y={height - 15} className="legend-text">Less</text>
      {[0, 1, 2, 3, 4].map((level, i) => (
        <rect
          key={level}
          x={width - 115 + i * (cellSize + 2)}
          y={height - 25}
          width={cellSize}
          height={cellSize}
          rx="2"
          fill={getLevelColor(level)}
        />
      ))}
      <text x={width - 20} y={height - 15} textAnchor="end" className="legend-text">More</text>
    </svg>
  );
}
