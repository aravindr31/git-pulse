import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchGitHubUser, fetchGitHubRepos } from '@/lib/github';
import { calculateUserRank, getRankColor } from '@/lib/ranking';

export default function EmbedStats() {
  const { username } = useParams<{ username: string }>();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['github-user', username],
    queryFn: () => fetchGitHubUser(username!),
    enabled: !!username,
  });

  const { data: repos, isLoading: reposLoading } = useQuery({
    queryKey: ['github-repos', username],
    queryFn: () => fetchGitHubRepos(username!),
    enabled: !!username && !!user,
  });

  const rank = user && repos ? calculateUserRank(user, repos) : null;
  const totalStars = repos?.reduce((sum, repo) => sum + repo.stargazers_count, 0) || 0;
  const totalForks = repos?.reduce((sum, repo) => sum + repo.forks_count, 0) || 0;

  if (userLoading || reposLoading || !user) {
    return (
      <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
        <text x="200" y="100" textAnchor="middle" fill="#666" fontSize="14">Loading...</text>
      </svg>
    );
  }

  const width = 450;
  const height = 200;
  const rankColor = rank ? getRankColor(rank.grade) : '#8b949e';

  const stats = [
    { label: 'Followers', value: user.followers, icon: '👥' },
    { label: 'Following', value: user.following, icon: '➡️' },
    { label: 'Repos', value: user.public_repos, icon: '📁' },
    { label: 'Stars', value: totalStars, icon: '⭐' },
    { label: 'Forks', value: totalForks, icon: '🍴' },
    { label: 'Gists', value: user.public_gists, icon: '📝' },
  ];

  return (
    <svg 
      width={width} 
      height={height} 
      xmlns="http://www.w3.org/2000/svg"
      style={{ background: 'transparent' }}
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes countUp {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes rankPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .stat-row {
          animation: fadeInUp 0.4s ease-out forwards;
          opacity: 0;
        }
        .stat-value {
          animation: countUp 0.6s ease-out forwards;
        }
        .rank-badge {
          animation: rankPulse 2s ease-in-out infinite;
        }
        .title { font: bold 14px system-ui, sans-serif; fill: #c9d1d9; }
        .stat-label { font: 12px system-ui, sans-serif; fill: #8b949e; }
        .stat-value-text { font: bold 14px system-ui, sans-serif; fill: #c9d1d9; }
        .rank-text { font: bold 24px system-ui, sans-serif; }
        .score-text { font: 11px system-ui, sans-serif; fill: #8b949e; }
      `}</style>

      {/* Card border */}
      <rect
        x="1"
        y="1"
        width={width - 2}
        height={height - 2}
        rx="8"
        fill="transparent"
        stroke="#30363d"
        strokeWidth="1"
      />

      {/* Title */}
      <text x="20" y="30" className="title">
        @{username}'s GitHub Stats
      </text>

      {/* Rank badge */}
      {rank && (
        <g className="rank-badge" transform={`translate(${width - 70}, 20)`}>
          <rect
            x="0"
            y="0"
            width="50"
            height="50"
            rx="10"
            fill="transparent"
            stroke={rankColor}
            strokeWidth="2"
          />
          <text
            x="25"
            y="32"
            textAnchor="middle"
            fill={rankColor}
            className="rank-text"
          >
            {rank.grade}
          </text>
          <text
            x="25"
            y="65"
            textAnchor="middle"
            className="score-text"
          >
            {rank.score}/100
          </text>
        </g>
      )}

      {/* Stats grid */}
      {stats.map((stat, index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);
        const x = 20 + col * 130;
        const y = 60 + row * 55;

        return (
          <g 
            key={stat.label} 
            className="stat-row" 
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <text x={x} y={y + 15} fontSize="16">{stat.icon}</text>
            <text x={x + 25} y={y + 12} className="stat-label">{stat.label}</text>
            <text x={x + 25} y={y + 32} className="stat-value-text stat-value">
              {stat.value.toLocaleString()}
            </text>
          </g>
        );
      })}

      {/* Member since */}
      <text x="20" y={height - 15} className="stat-label">
        Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
      </text>
    </svg>
  );
}
