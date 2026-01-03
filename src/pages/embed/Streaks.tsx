import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchGitHubData } from "@/lib/github";
import { calculateStreaks } from "@/lib/streak";

export default function Streak() {
  const { username } = useParams<{ username: string }>();

  const { data: githubData, isLoading, error } = useQuery({
    queryKey: ["github-full-data", username],
    queryFn: () => fetchGitHubData(username!),
    enabled: !!username,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  });

  const streak = githubData ? calculateStreaks(githubData) : null;
  
  const downloadSVG = () => {
    if (!streak || !username) return;

    const svg = `
<svg width="720" height="220" viewBox="0 0 720 220" xmlns="http://www.w3.org/2000/svg">
<style>
  .label { fill:#8b949e; font:700 11px Arial; letter-spacing:1px }
  .value-white { fill:#c9d1d9; font:900 40px Arial }
  .value-orange { fill:#ffa500; font:900 40px Arial }
  .value-blue { fill:#58a6ff; font:900 40px Arial }
  .sub { fill:#8b949e; font:12px monospace }
  .sub-small { fill:#8b949e; font:11px monospace }
</style>

<rect width="720" height="220" rx="16" fill="#0d1117" stroke="#30363d" stroke-width="2"/>

<!-- Dividers -->
<line x1="240" y1="24" x2="240" y2="196" stroke="#30363d" stroke-dasharray="4 4"/>
<line x1="480" y1="24" x2="480" y2="196" stroke="#30363d" stroke-dasharray="4 4"/>

<!-- Column 1 - Total Contributions -->
<g transform="translate(120,50)">
  <text text-anchor="middle" class="label">TOTAL CONTRIBUTIONS</text>
  <text y="54" text-anchor="middle" class="value-white">${streak.totalContributions.toLocaleString()}</text>
  <text y="90" text-anchor="middle" class="sub-small">Since account creation</text>
</g>

<!-- Column 2 - Current Streak -->
<g transform="translate(360,50)">
  <text text-anchor="middle" class="label">CURRENT STREAK</text>
  <text y="54" text-anchor="middle" class="value-orange">${streak.currentStreak.days}</text>
  <text y="78" text-anchor="middle" class="sub">days</text>
  <text y="108" text-anchor="middle" class="sub">
    ${streak.currentStreak.from ?? "-"} → ${streak.currentStreak.to ?? "-"}
  </text>
</g>

<!-- Column 3 - Longest Streak -->
<g transform="translate(600,50)">
  <text text-anchor="middle" class="label">LONGEST STREAK</text>
  <text y="54" text-anchor="middle" class="value-blue">${streak.longestStreak.days}</text>
  <text y="78" text-anchor="middle" class="sub">days</text>
  <text y="108" text-anchor="middle" class="sub">
    ${streak.longestStreak.from ?? "-"} → ${streak.longestStreak.to ?? "-"}
  </text>
</g>
</svg>
`;

    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${username}-github-streak.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
        <p className="text-gray-400 font-mono text-sm">
          Fetching all contributions since account creation...
        </p>
        <p className="text-gray-600 font-mono text-xs">
          This may take a few seconds for older accounts
        </p>
      </div>
    );
  }

  if (error || !streak) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="text-red-500 font-mono text-xl">❌ Error</div>
        <p className="text-gray-400 font-mono text-sm">
          {error instanceof Error ? error.message : "User not found or API error"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-3xl font-bold text-white">GitHub Streak Card</h1>

      {/* Web Preview */}
      <div className="w-[720px] h-[220px] bg-[#0d1117] border-2 border-[#30363d] rounded-2xl p-6 flex">
        {/* Col 1 */}
        <div className="w-1/3 border-r border-dashed border-[#30363d]  px-6 flex flex-col items-center">
          <div className="text-[11px] font-bold text-gray-500 tracking-widest">
            TOTAL CONTRIBUTIONS
          </div>
          <div className="text-5xl font-extrabold text-white mt-6">
            {streak.totalContributions.toLocaleString()}
          </div>
          <div className="text-xs font-mono text-gray-500 mt-3 text-center">
            Since account creation
          </div>
        </div>

        {/* Col 2 */}
        <div className="w-1/3 border-r border-dashed border-[#30363d] px-6 flex flex-col items-center">
          <div className="text-[11px] font-bold text-gray-500 tracking-widest">
            CURRENT STREAK
          </div>
          <div className="text-5xl font-black text-[#ffa500] mt-4">
            {streak.currentStreak.days}
          </div>
          <div className="text-xs text-gray-400">days</div>
          <div className="text-xs font-mono text-gray-500 mt-3 text-center">
            {streak.currentStreak.from ?? "-"} →{" "}
            {streak.currentStreak.to ?? "-"}
          </div>
        </div>

        {/* Col 3 */}
        <div className="w-1/3 pl-6 flex flex-col items-center">
          <div className="text-[11px] font-bold text-gray-500 tracking-widest">
            LONGEST STREAK
          </div>
          <div className="text-5xl font-black text-blue-400 mt-4">
            {streak.longestStreak.days}
          </div>
          <div className="text-xs text-gray-400">days</div>
          <div className="text-xs font-mono text-gray-500 mt-3 text-center">
            {streak.longestStreak.from ?? "-"} →{" "}
            {streak.longestStreak.to ?? "-"}
          </div>
        </div>
      </div>

      <button
        onClick={downloadSVG}
        className="px-8 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition"
      >
        Export SVG
      </button>

      <p className="text-[10px] text-gray-600 font-mono">
        README & PROFILE COMPATIBLE • ALL-TIME STATS
      </p>
    </div>
  );
}