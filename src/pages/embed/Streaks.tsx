import { useParams } from 'react-router-dom';
import { useGithubStreaks } from '@/hooks/useGithubQueries';

export default function Streaks() {
  const { username } = useParams<{ username: string }>();
  const { data: streak, isLoading, error } = useGithubStreaks(username);

  const downloadSVG = () => {
    if (!streak || !username) return;

    const color = "#fb8c00"; 

    const svgContent = `
      <svg width="720" height="320" viewBox="0 0 720 320" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>
          .header { font: bold 12px Arial, sans-serif; fill: #8b949e; letter-spacing: 1px; }
          .username { font: bold 18px Arial, sans-serif; fill: #c9d1d9; }
          .stat-label { font: bold 11px Arial, sans-serif; fill: #8b949e; }
          .stat-value { font: bold 28px Arial, sans-serif; fill: #f0f6fc; }
          .stat-sub { font: 10px Arial, sans-serif; fill: #8b949e; }
        </style>

        <rect width="720" height="320" rx="16" fill="#0d1117" stroke="#30363d" stroke-width="2"/>
        
        <g transform="translate(30, 45)">
          <circle cx="0" cy="0" r="4" fill="${color}" />
          <text x="15" y="4" class="header">STREAK ANALYTICS</text>
          <text x="0" y="35" class="username">@${username}</text>
        </g>

        <line x1="260" y1="85" x2="260" y2="285" stroke="#30363d" stroke-dasharray="4 4" />

        <g transform="translate(30, 140)">
          <text x="0" y="0" class="stat-label" style="text-transform: uppercase;">Current Streak</text>
          <text x="0" y="45" class="stat-value" style="fill: ${color}; font-size: 50px;">${streak.currentStreak.days} Days</text>
          <text x="0" y="70" class="stat-sub">${streak.currentStreak.from || ''} to ${streak.currentStreak.to || ''}</text>
        </g>

        <g transform="translate(300, 110)">
          <g transform="translate(0, 0)">
            <text class="stat-label">TOTAL CONTRIBUTIONS</text>
            <text y="30" class="stat-value">${streak.totalContributions}</text>
            <rect y="45" width="380" height="4" fill="#30363d" rx="2" />
            <rect y="45" width="380" height="4" fill="${color}" rx="2" opacity="0.6" />
          </g>

          <g transform="translate(0, 90)">
            <text class="stat-label">LONGEST STREAK</text>
            <text y="30" class="stat-value">${streak.longestStreak.days} Days</text>
            <text y="50" class="stat-sub">Period: ${streak.longestStreak.from || 'N/A'} - ${streak.longestStreak.to || 'N/A'}</text>
            <rect y="65" width="380" height="4" fill="#30363d" rx="2" />
          </g>
        </g>
      </svg>
    `;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${username}-streaks.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <div className="flex justify-center p-12 text-gray-400 font-mono">Loading streaks...</div>;
  if (error || !streak) return <div className="flex justify-center p-12 text-red-500 font-mono">Data error.</div>;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Streak Card</h1>
        <p className="text-gray-400">Activity for <span className="text-orange-400 font-mono">@{username}</span></p>
      </div>

      {/* Web Preview with Dotted Separation */}
      <div className="w-[720px] h-[320px] bg-[#0d1117] border-2 border-[#30363d] rounded-2xl p-8 flex relative overflow-hidden shadow-2xl">
        
        {/* Left Side: Main Highlight */}
        <div className="w-[235px] flex flex-col justify-between h-full border-r-2 border-dashed border-[#30363d] pr-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Streaks</span>
             </div>
             <div className="text-lg font-bold text-white truncate">@{username}</div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase mb-1">Current Streak</span>
            <div className="text-6xl font-black text-orange-500 leading-none">
                {streak.currentStreak.days}
                <span className="text-xl ml-2 text-orange-800">Days</span>
            </div>
            <span className="text-[10px] text-gray-500 mt-2 font-mono">{streak.currentStreak.from} — {streak.currentStreak.to}</span>
          </div>

          <div className="pt-4 border-t border-[#161b22]">
             <span className="text-[10px] text-gray-600 font-mono">GITHUB VERIFIED DATA</span>
          </div>
        </div>

        {/* Right Side: Detailed Stats */}
        <div className="flex-1 pl-8 flex flex-col justify-center space-y-10">
            {/* Total Contributions */}
            <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Total Contributions</span>
                    <span className="text-2xl font-bold text-white font-mono">{streak.totalContributions}</span>
                </div>
                <div className="h-1.5 w-full bg-[#30363d] rounded-full">
                    <div className="h-full bg-orange-500/50 rounded-full" style={{ width: '100%' }} />
                </div>
            </div>

            {/* Longest Streak */}
            <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Longest Streak</span>
                    <span className="text-2xl font-bold text-gray-300 font-mono">{streak.longestStreak.days} <span className="text-sm">Days</span></span>
                </div>
                <div className="h-1.5 w-full bg-[#30363d] rounded-full overflow-hidden">
                    <div className="h-full bg-gray-500 rounded-full" style={{ width: '80%' }} />
                </div>
                <p className="text-[9px] text-gray-600 font-mono uppercase">Peak performance: {streak.longestStreak.from} to {streak.longestStreak.to}</p>
            </div>
        </div>
      </div>

      <button 
        onClick={downloadSVG}
        className="group relative px-8 py-3 bg-white text-black rounded-full font-bold overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-lg"
      >
        Export Streak SVG
      </button>
    </div>
  );
}