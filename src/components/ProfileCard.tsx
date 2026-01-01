import { GitHubUser } from '@/types/github';
import { formatDate, formatNumber } from '@/lib/github';
import { MapPin, Link as LinkIcon, Building2, Calendar, Users, BookOpen } from 'lucide-react';

interface ProfileCardProps {
  user: GitHubUser;
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <div className="glass-card p-6 animate-slide-up">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="relative">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-28 h-28 rounded-full border-2 border-primary/30 shadow-lg"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse-slow" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold gradient-text">{user.name || user.login}</h2>
            <a
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-muted-foreground hover:text-primary transition-colors"
            >
              @{user.login}
            </a>
          </div>

          {user.bio && (
            <p className="text-muted-foreground mb-4 max-w-xl">{user.bio}</p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {user.company && (
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {user.company}
              </span>
            )}
            {user.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {user.location}
              </span>
            )}
            {user.blog && (
              <a
                href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <LinkIcon className="h-4 w-4" />
                {user.blog.replace(/^https?:\/\//, '')}
              </a>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Joined {formatDate(user.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/50">
        <div className="stat-card text-center">
          <div className="text-2xl font-bold gradient-text font-mono">{formatNumber(user.followers)}</div>
          <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <Users className="h-3.5 w-3.5" />
            Followers
          </div>
        </div>
        <div className="stat-card text-center">
          <div className="text-2xl font-bold gradient-text font-mono">{formatNumber(user.following)}</div>
          <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <Users className="h-3.5 w-3.5" />
            Following
          </div>
        </div>
        <div className="stat-card text-center">
          <div className="text-2xl font-bold gradient-text font-mono">{formatNumber(user.public_repos)}</div>
          <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            Repos
          </div>
        </div>
        <div className="stat-card text-center">
          <div className="text-2xl font-bold gradient-text font-mono">{formatNumber(user.public_gists)}</div>
          <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            Gists
          </div>
        </div>
      </div>
    </div>
  );
}
