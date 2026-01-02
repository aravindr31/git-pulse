import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchGitHubUser, fetchGitHubRepos, fetchGitHubEvents } from '@/lib/github';
import { calculateTrophies, getTierColor, Trophy } from '@/lib/trophies';

export default function EmbedTrophies() {
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

  const { data: events } = useQuery({
    queryKey: ['github-events', username],
    queryFn: () => fetchGitHubEvents(username!),
    enabled: !!username && !!user,
  });

  const trophies = user && repos ? calculateTrophies(user, repos, events || []) : [];

  if (userLoading || reposLoading || !user) {
    return (
      <svg width="800" height="200" xmlns="http://www.w3.org/2000/svg">
        <text x="400" y="100" textAnchor="middle" fill="#666" fontSize="14">Loading...</text>
      </svg>
    );
  }

  const trophyWidth = 120;
  const trophyHeight = 140;
  const padding = 10;
  const cols = Math.min(trophies.length, 6);
  const rows = Math.ceil(trophies.length / 6);
  const width = cols * (trophyWidth + padding) + padding;
  const height = rows * (trophyHeight + padding) + padding + 40;

  const renderTrophy = (trophy: Trophy, index: number) => {
    const col = index % 6;
    const row = Math.floor(index / 6);
    const x = padding + col * (trophyWidth + padding);
    const y = 40 + row * (trophyHeight + padding);
    const color = getTierColor(trophy.tier);

    return (
      <g key={trophy.id} className="trophy" style={{ animationDelay: `${index * 100}ms` }}>
        {/* Trophy container */}
        <rect
          x={x}
          y={y}
          width={trophyWidth}
          height={trophyHeight}
          rx="8"
          fill="transparent"
          stroke={color}
          strokeWidth="2"
          className="trophy-border"
        />
        
        {/* Trophy icon background glow */}
        <circle
          cx={x + trophyWidth / 2}
          cy={y + 45}
          r="25"
          fill={color}
          opacity="0.1"
        />
        
        {/* Trophy icon */}
        <text
          x={x + trophyWidth / 2}
          y={y + 55}
          textAnchor="middle"
          fontSize="30"
        >
          {trophy.icon}
        </text>
        
        {/* Tier badge */}
        <text
          x={x + trophyWidth / 2}
          y={y + 85}
          textAnchor="middle"
          fill={color}
          fontSize="16"
          fontWeight="bold"
          fontFamily="system-ui, sans-serif"
        >
          {trophy.tier}
        </text>
        
        {/* Trophy name */}
        <text
          x={x + trophyWidth / 2}
          y={y + 105}
          textAnchor="middle"
          fill="#c9d1d9"
          fontSize="11"
          fontWeight="500"
          fontFamily="system-ui, sans-serif"
        >
          {trophy.name}
        </text>
        
        {/* Trophy description */}
        <text
          x={x + trophyWidth / 2}
          y={y + 125}
          textAnchor="middle"
          fill="#8b949e"
          fontSize="9"
          fontFamily="system-ui, sans-serif"
        >
          {trophy.description.length > 20 
            ? trophy.description.substring(0, 18) + '...' 
            : trophy.description}
        </text>
      </g>
    );
  };

  return (
    <svg 
      width={width} 
      height={height} 
      xmlns="http://www.w3.org/2000/svg"
      style={{ background: 'transparent' }}
    >
      <style>{`
        @keyframes trophyPop {
          0% { opacity: 0; transform: scale(0.5); }
          50% { transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: 0; }
        }
        .trophy {
          animation: trophyPop 0.5s ease-out forwards;
          opacity: 0;
        }
        .trophy-border {
          stroke-dasharray: 200;
          animation: shimmer 1s ease-out forwards;
        }
        .title { font: bold 14px system-ui, sans-serif; fill: #c9d1d9; }
        .subtitle { font: 12px system-ui, sans-serif; fill: #8b949e; }
      `}</style>

      {/* Title */}
      <text x={padding} y="25" className="title">
        @{username}'s Trophies
      </text>
      <text x={width - padding} y="25" textAnchor="end" className="subtitle">
        {trophies.length} trophies earned
      </text>

      {trophies.map((trophy, index) => renderTrophy(trophy, index))}
    </svg>
  );
}
