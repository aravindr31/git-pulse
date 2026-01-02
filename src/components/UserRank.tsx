import { RankResult, getRankColor } from '@/lib/ranking';

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
          className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl font-bold"
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
      
      <div className="grid grid-cols-5 gap-2 mt-4 text-center">
        {Object.entries(rank.breakdown).map(([key, value]) => (
          <div key={key} className="p-2 rounded-lg bg-secondary/30">
            <div className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
            <div className="font-mono font-medium text-sm">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
