import { Trophy, getTierColor } from '@/lib/badges';

interface TrophyDisplayProps {
  trophies: Trophy[];
}

export function TrophyDisplay({ trophies }: TrophyDisplayProps) {
  if (trophies.length === 0) return null;

  return (
    <div className="glass-card p-4">
      <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
        <span className="w-2 h-2 rounded-full bg-primary" />
        Trophies
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {trophies.map((trophy) => (
          <div
            key={trophy.id}
            className="relative p-3 rounded-lg bg-secondary/30 border border-border/30 hover:border-primary/30 transition-all group"
          >
            <div 
              className="absolute top-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded"
              style={{ 
                backgroundColor: getTierColor(trophy.tier) + '20',
                color: getTierColor(trophy.tier) 
              }}
            >
              {trophy.tier}
            </div>
            <div className="text-2xl mb-2">{trophy.icon}</div>
            <div className="font-medium text-sm truncate">{trophy.name}</div>
            <div className="text-xs text-muted-foreground truncate group-hover:whitespace-normal">
              {trophy.description}
            </div>
            {trophy.progress !== undefined && trophy.maxProgress !== undefined && (
              <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(100, (trophy.progress / trophy.maxProgress) * 100)}%`,
                    backgroundColor: getTierColor(trophy.tier)
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
