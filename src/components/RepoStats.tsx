import { GitHubRepo } from '@/types/github';
import { formatNumber, getTimeAgo } from '@/lib/github';
import { Star, GitFork, AlertCircle, Eye } from 'lucide-react';

interface RepoStatsProps {
  repos: GitHubRepo[];
}

export function RepoStats({ repos }: RepoStatsProps) {
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazerCount, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forkCount, 0);
  const totalIssues = repos.reduce((sum, repo) => sum + repo.openIssues.totalCount, 0);
  const totalWatchers = repos.reduce((sum, repo) => sum + repo.watchers.totalCount, 0);
  
  const mostRecent = repos.length > 0 
    ? repos.sort((a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime())[0]
    : null;

  return (
    <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '0.15s' }}>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-accent" />
        Repository Stats
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-500/10">
            <Star className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <div className="font-mono font-bold text-lg">{formatNumber(totalStars)}</div>
            <div className="text-xs text-muted-foreground">Total Stars</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <GitFork className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <div className="font-mono font-bold text-lg">{formatNumber(totalForks)}</div>
            <div className="text-xs text-muted-foreground">Total Forks</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10">
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </div>
          <div>
            <div className="font-mono font-bold text-lg">{formatNumber(totalIssues)}</div>
            <div className="text-xs text-muted-foreground">Open Issues</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Eye className="h-4 w-4 text-purple-500" />
          </div>
          <div>
            <div className="font-mono font-bold text-lg">{formatNumber(totalWatchers)}</div>
            <div className="text-xs text-muted-foreground">Watchers</div>
          </div>
        </div>
      </div>

      {mostRecent && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            Last active: <span className="text-foreground font-medium">{mostRecent.name}</span>
            <span className="ml-2">{getTimeAgo(mostRecent.pushedAt)}</span>
          </p>
        </div>
      )}
    </div>
  );
}
