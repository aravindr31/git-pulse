import { ContributionData, getLevelColor } from '@/lib/contributions';

interface ContributionChartProps {
  data: ContributionData;
}

export default function ContributionChart({ data }: ContributionChartProps) {
  const weeks: typeof data.days[] = [];
  let currentWeek: typeof data.days = [];

  // Pad the first week to start on Sunday
  const firstDay = new Date(data.days[0]?.date || new Date());
  const startPadding = firstDay.getDay();
  for (let i = 0; i < startPadding; i++) {
    currentWeek.push({ date: '', count: 0, level: 0 });
  }

  data.days.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Contribution Activity</h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{data.totalContributions} contributions</span>
          <span>🔥 {data.currentStreak} day streak</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {/* Days of week labels */}
          <div className="flex flex-col gap-1 mr-2 text-xs text-muted-foreground">
            <span className="h-3"></span>
            <span className="h-3">Mon</span>
            <span className="h-3"></span>
            <span className="h-3">Wed</span>
            <span className="h-3"></span>
            <span className="h-3">Fri</span>
            <span className="h-3"></span>
          </div>

          {/* Grid */}
          <div className="flex flex-col">
            {/* Month labels */}
            <div className="flex gap-1 mb-1">
              {weeks.map((week, weekIndex) => {
                const firstValidDay = week.find(d => d.date);
                if (firstValidDay) {
                  const date = new Date(firstValidDay.date);
                  if (date.getDate() <= 7) {
                    return (
                      <span key={weekIndex} className="w-3 text-xs text-muted-foreground">
                        {months[date.getMonth()]}
                      </span>
                    );
                  }
                }
                return <span key={weekIndex} className="w-3"></span>;
              })}
            </div>

            {/* Contribution grid */}
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className="w-3 h-3 rounded-sm transition-all hover:scale-125 hover:ring-1 hover:ring-primary/50"
                      style={{ backgroundColor: getLevelColor(day.level) }}
                      title={day.date ? `${day.count} contributions on ${day.date}` : ''}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: getLevelColor(level) }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
