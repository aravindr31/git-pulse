import { GitHubRepo } from '@/types/github';
import { formatNumber, getLanguageColor, getTimeAgo } from '@/lib/github';
import { Star, GitFork, ExternalLink, Code2 } from 'lucide-react';

interface RepoListProps {
  repos: GitHubRepo[];
}

export function RepoList({ repos }: RepoListProps) {
  const topRepos = repos
    .filter((repo) => !repo.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6);

  if (topRepos.length === 0) {
    return (
      <div className="glass-card p-6 text-center text-muted-foreground">
        <Code2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No public repositories found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
      {topRepos.map((repo) => (
        <a
          key={repo.id}
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-card p-5 group hover:border-primary/30 transition-all duration-300 block"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {repo.name}
            </h3>
            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>

          {repo.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {repo.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            {repo.language && (
              <span className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getLanguageColor(repo.language) }}
                />
                {repo.language}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5" />
              {formatNumber(repo.stargazers_count)}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="h-3.5 w-3.5" />
              {formatNumber(repo.forks_count)}
            </span>
            <span className="ml-auto">{getTimeAgo(repo.pushed_at)}</span>
          </div>

          {repo.topics && repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {repo.topics.slice(0, 4).map((topic) => (
                <span
                  key={topic}
                  className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </a>
      ))}
    </div>
  );
}
