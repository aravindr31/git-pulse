import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchGitHubData } from '@/lib/github'; 
import { calculateUserRank, getRankColor } from '@/lib/ranking';

export default function Rank() {
  const { username } = useParams<{ username: string }>();

  const { data: githubData, isLoading, error } = useQuery({
    queryKey: ['github-data', username],
    queryFn: () => fetchGitHubData(username!),
    enabled: !!username,
  });

  const rank = githubData ? calculateUserRank(githubData) : null;

const downloadSVG = () => {
    if (!rank || !username) return;

    const rankColor = getRankColor(rank.grade);
    const medians: Record<string, number> = {
      followers: 100, stars: 200, repos: 50, forks: 50, accountAge: 10,
    };

    const rankFontSize = rank.grade.length > 2 ? '42px' : '60px';

    // Right Column Stats (Now much wider)
    const breakdownSVG = Object.entries(rank.breakdown)
      .map(([key, value], index) => {
        const maxValue = medians[key] || 100;
        const percentage = Math.min(100, ((value as number) / maxValue) * 100);
        const label = key.replace(/([A-Z])/g, ' $1').toUpperCase();
        
        const y = 80 + (index * 40); 
        const delay = 0.4 + index * 0.1;

        return `
          <g transform="translate(285, ${y})">
            <text fill="#8b949e" font-family="Arial, sans-serif" font-size="11" font-weight="bold">${label}</text>
            <text x="400" fill="#c9d1d9" text-anchor="end" font-family="monospace" font-size="12" font-weight="bold">${value}</text>
            <rect y="12" width="400" height="6" fill="#30363d" rx="3" />
            <rect y="12" width="0" height="6" fill="${rankColor}" rx="3">
              <animate attributeName="width" from="0" to="${percentage * 4}" dur="1s" begin="${delay}s" fill="freeze" calcMode="spline" keySplines="0.42 0 0.58 1" />
            </rect>
          </g>`;
      })
      .join('');

    const svgContent = `
      <svg width="720" height="320" viewBox="0 0 720 320" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>
          .header { font: bold 12px Arial, sans-serif; fill: #8b949e; letter-spacing: 1px; }
          .username { font: bold 18px Arial, sans-serif; fill: #c9d1d9; }
          .rank-text { 
            font: bold ${rankFontSize} Arial, sans-serif; 
            fill: ${rankColor}; 
            opacity: 0; 
            animation: fadeIn 0.8s ease-out forwards; 
          }
          @keyframes fadeIn { 
            from { opacity: 0; transform: translateY(10px); } 
            to { opacity: 1; transform: translateY(0); } 
          }
        </style>

        <rect width="720" height="320" rx="16" fill="#0d1117" stroke="#30363d" stroke-width="2"/>
        
        <g transform="translate(30, 45)">
          <circle cx="0" cy="0" r="4" fill="${rankColor}" />
          <text x="15" y="4" class="header">GITHUB ANALYTICS</text>
          <text x="0" y="35" class="username">@${username}</text>
        </g>

        <line x1="260" y1="85" x2="260" y2="285" stroke="#30363d" stroke-dasharray="4 4" />

        <g transform="translate(30, 120)">
          <text x="100" y="45" text-anchor="middle" dominant-baseline="middle" class="rank-text">${rank.grade}</text>
          
          <g transform="translate(0, 115)">
            <text fill="#8b949e" font-family="Arial" font-size="11" font-weight="bold">OVERALL SCORE</text>
            <text x="200" text-anchor="end" fill="#c9d1d9" font-family="monospace" font-size="13" font-weight="bold">${rank.score}</text>
            <rect y="15" width="200" height="8" fill="#30363d" rx="4" />
            <rect y="15" width="0" height="8" fill="${rankColor}" rx="4">
              <animate attributeName="width" from="0" to="${rank.score * 2}" dur="1.2s" fill="freeze" calcMode="spline" keySplines="0.42 0 0.58 1" />
            </rect>
          </g>
        </g>

        ${breakdownSVG}
      </svg>
    `;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${username}-github-rank.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <div className="flex justify-center p-12 text-gray-400 font-mono">Loading user rank...</div>;
  if (error || !rank) return <div className="flex justify-center p-12 text-red-500 font-mono">User not found or API error.</div>;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">GitHub Rank Card</h1>
        <p className="text-gray-400">Generated for <span className="text-blue-400 font-mono">@{username}</span></p>
      </div>

      {/* The Web Preview (matching the SVG style) */}
      <div className="w-[720px] h-[320px] bg-[#0d1117] border-2 border-[#30363d] rounded-2xl p-8 flex relative overflow-hidden shadow-2xl">
        {/* Left Side */}
        <div className="w-[235px] flex flex-col justify-between h-full border-r-2 border-dashed border-[#30363d] pr-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getRankColor(rank.grade) }} />
                <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Analytics</span>
             </div>
             <div className="text-lg font-bold text-white truncate">@{username}</div>
          </div>

          <div className="flex-1 flex items-center justify-center text-6xl font-black" style={{ color: getRankColor(rank.grade) }}>
            {rank.grade}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                <span>Score</span>
                <span className="text-white">{rank.score}</span>
            </div>
            <div className="h-2 w-full bg-[#30363d] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${rank.score}%`, backgroundColor: getRankColor(rank.grade) }} />
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex-1 pl-8 flex flex-col justify-center space-y-4">
            {Object.entries(rank.breakdown).map(([key, value]) => {
                const medians: Record<string, number> = { followers: 100, stars: 200, repos: 50, forks: 50, accountAge: 10 };
                const maxValue = medians[key] || 100;
                const percentage = Math.min(100, ((value as number) / maxValue) * 100);
                return (
                    <div key={key} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-tighter">
                            <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="text-gray-300">{value as number}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#30363d] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${percentage}%`, backgroundColor: getRankColor(rank.grade) }} />
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      <button 
        onClick={downloadSVG}
        className="group relative px-8 py-3 bg-white text-black rounded-full font-bold overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-lg"
      >
        <span className="relative z-10">Export Animated SVG</span>
        <div className="absolute inset-0 bg-blue-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      </button>

      <p className="text-[10px] text-gray-600 font-mono">COMPATIBLE WITH GITHUB PROFILES</p>
    </div>
  );
}