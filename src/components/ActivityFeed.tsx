import { GitHubEvent } from '@/types/github';
import { getTimeAgo } from '@/lib/github';
import { GitCommit, GitPullRequest, Star, GitFork, MessageSquare, Tag } from 'lucide-react';

interface ActivityFeedProps {
  events: GitHubEvent[];
}

function getEventIcon(type: string) {
  switch (type) {
    case 'PushEvent':
      return <GitCommit className="h-4 w-4" />;
    case 'PullRequestEvent':
      return <GitPullRequest className="h-4 w-4" />;
    case 'WatchEvent':
      return <Star className="h-4 w-4" />;
    case 'ForkEvent':
      return <GitFork className="h-4 w-4" />;
    case 'IssueCommentEvent':
    case 'CommitCommentEvent':
      return <MessageSquare className="h-4 w-4" />;
    case 'CreateEvent':
    case 'ReleaseEvent':
      return <Tag className="h-4 w-4" />;
    default:
      return <GitCommit className="h-4 w-4" />;
  }
}

function getEventDescription(event: GitHubEvent): string {
  const payload = event.payload as Record<string, unknown>;
  
  switch (event.type) {
    case 'PushEvent':
      const commits = (payload.commits as Array<{ message: string }>) || [];
      return `Pushed ${commits.length} commit${commits.length > 1 ? 's' : ''}`;
    case 'PullRequestEvent':
      return `${String(payload.action || 'opened').charAt(0).toUpperCase() + String(payload.action || 'opened').slice(1)} a pull request`;
    case 'WatchEvent':
      return 'Starred the repository';
    case 'ForkEvent':
      return 'Forked the repository';
    case 'IssueCommentEvent':
      return 'Commented on an issue';
    case 'CreateEvent':
      return `Created ${payload.ref_type || 'a reference'}`;
    case 'ReleaseEvent':
      return 'Published a release';
    default:
      return event.type.replace('Event', '');
  }
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  const recentEvents = events.slice(0, 10);

  if (recentEvents.length === 0) {
    return (
      <div className="glass-card p-5 text-center text-muted-foreground">
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '0.3s' }}>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-accent" />
        Recent Activity
      </h3>

      <div className="space-y-3">
        {recentEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-3 text-sm py-2 border-b border-border/30 last:border-0"
          >
            <div className="p-1.5 rounded-lg bg-secondary text-muted-foreground flex-shrink-0">
              {getEventIcon(event.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground">
                {getEventDescription(event)}
              </p>
              <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">
                {event.repo.name}
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {getTimeAgo(event.created_at)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
