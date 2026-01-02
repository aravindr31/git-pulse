import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchGitHubUser, fetchGitHubRepos } from '@/lib/github';
import { calculateUserRank, getRankColor } from '@/lib/ranking';

export default function EmbedRank() {
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

  if (userLoading || reposLoading || !user || !rank) {
    return (
      <svg width="300" height="150" xmlns="http://www.w3.org/2000/svg">
        <text x="150" y="75" textAnchor="middle" fill="#666" fontSize="14">Loading...</text>
      </svg>
    );
  }

  const width = 350;
  const height = 180;
  const rankColor = getRankColor(rank.grade);

  const breakdownItems = Object.entries(rank.breakdown);

  return (
    <svg 
      width={width} 
      height={height} 
      xmlns="http://www.w3.org/2000/svg"
      style={{ background: 'transparent' }}
    >
      <style>{`
        @keyframes rankReveal {
          0% { opacity: 0; transform: scale(0) rotate(-180deg); }
          60% { transform: scale(1.2) rotate(10deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes scoreCount {
          from { stroke-dashoffset: 251; }
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .rank-letter {
          animation: rankReveal 0.8s ease-out forwards;
          opacity: 0;
          transform-origin: center;
        }
        .score-ring {
          animation: scoreCount 1.5s ease-out forwards;
          transform-origin: center;
          transform: rotate(-90deg);
        }
        .breakdown-item {
          animation: fadeSlide 0.4s ease-out forwards;
          opacity: 0;
        }
        .title { font: bold 14px system-ui, sans-serif; fill: #c9d1d9; }
        .rank-text { font: bold 40px system-ui, sans-serif; }
        .score-text { font: bold 12px system-ui, sans-serif; fill: #8b949e; }
        .breakdown-label { font: 11px system-ui, sans-serif; fill: #8b949e; }
        .breakdown-value { font: bold 12px system-ui, sans-serif; fill: #c9d1d9; }
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
      <text x="20" y="25" className="title">
        @{username}'s Rank
      </text>

      {/* Rank circle */}
      <g transform="translate(80, 100)">
        {/* Background circle */}
        <circle
          cx="0"
          cy="0"
          r="40"
          fill="transparent"
          stroke="#30363d"
          strokeWidth="6"
        />
        {/* Score ring */}
        <circle
          cx="0"
          cy="0"
          r="40"
          fill="transparent"
          stroke={rankColor}
          strokeWidth="6"
          strokeDasharray="251"
          strokeDashoffset={251 - (251 * rank.score / 100)}
          strokeLinecap="round"
          className="score-ring"
        />
        {/* Rank letter */}
        <text
          x="0"
          y="12"
          textAnchor="middle"
          fill={rankColor}
          className="rank-text rank-letter"
        >
          {rank.grade}
        </text>
      </g>

      {/* Score text */}
      <text x="80" y="160" textAnchor="middle" className="score-text">
        {rank.score}/100
      </text>

      {/* Breakdown */}
      <g transform="translate(160, 50)">
        {breakdownItems.map(([key, value], index) => (
          <g 
            key={key}
            className="breakdown-item"
            style={{ animationDelay: `${0.5 + index * 0.1}s` }}
            transform={`translate(0, ${index * 22})`}
          >
            <text x="0" y="0" className="breakdown-label">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </text>
            <text x="150" y="0" textAnchor="end" className="breakdown-value">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
