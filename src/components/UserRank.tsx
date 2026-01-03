import { getRankColor } from '@/lib/ranking';
import { RankResult } from '@/types/github';

interface UserRankProps {
  rank: RankResult;
}

export function UserRank({ rank }: UserRankProps) {
  return (
    <div className="glass-card p-4">
      <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
        <span className="w-2 h-2 rounded-full bg-primary" />
        User Rank
      </h3>
      
      <div className="flex items-center gap-4">
        <div 
          className="min-w-[5rem] px-2 h-20 rounded-xl flex items-center justify-center text-3xl font-bold"
          style={{ 
            backgroundColor: getRankColor(rank.grade) + '20',
            color: getRankColor(rank.grade),
            border: `2px solid ${getRankColor(rank.grade)}40`
          }}
        >
          {rank.grade}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Score</span>
            <span className="font-mono font-medium">{rank.score}/100</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${rank.score}%`,
                backgroundColor: getRankColor(rank.grade)
              }}
            />
          </div>
        </div>
      </div>
      
<div className="mt-6 space-y-3">
  {Object.entries(rank.breakdown).map(([key, value]) => {
    const medians: Record<string, number> = {
      followers: 100,
      stars: 200,
      repos: 50,
      forks: 50,
      accountAge: 10,
    };

    const maxValue = medians[key] || 100;
    const percentage = Math.min(100, ((value as number) / maxValue) * 100);
    const label = key.replace(/([A-Z])/g, ' $1');

    return (
      <div key={key} className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground uppercase font-semibold">{label}</span>
          <span className="font-mono font-medium">{value}</span>
        </div>
        
        <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
            style={{ 
              width: `${percentage}%`,
              opacity: 0.4 + (percentage / 100) * 0.6 // Gets brighter as it fills
            }}
          />
        </div>
      </div>
    );
  })}
</div>
    </div>
  );
}
