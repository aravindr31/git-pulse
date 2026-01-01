import { LanguageStats } from '@/types/github';
import { getLanguageColor } from '@/lib/github';

interface LanguageChartProps {
  stats: LanguageStats;
}

export function LanguageChart({ stats }: LanguageChartProps) {
  const entries = Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary" />
        Languages
      </h3>

      {/* Bar chart */}
      <div className="h-3 rounded-full overflow-hidden flex mb-4 bg-secondary">
        {entries.map(([lang, count]) => {
          const percentage = (count / total) * 100;
          return (
            <div
              key={lang}
              className="h-full transition-all duration-500"
              style={{
                width: `${percentage}%`,
                backgroundColor: getLanguageColor(lang),
              }}
              title={`${lang}: ${percentage.toFixed(1)}%`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {entries.map(([lang, count]) => {
          const percentage = ((count / total) * 100).toFixed(1);
          return (
            <div key={lang} className="flex items-center gap-2 text-sm">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: getLanguageColor(lang) }}
              />
              <span className="text-foreground truncate">{lang}</span>
              <span className="text-muted-foreground ml-auto font-mono text-xs">
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
