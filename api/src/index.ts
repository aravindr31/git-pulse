import { fetchBadgeData, fetchRankingData, fetchStreakData, fetchUnifiedDashboardData } from '../../src/lib/github';
import { calculateTrophies, getTierColor } from '../../src/lib/badges';
import { calculateUserRank, getRankColor } from '../../src/lib/ranking';
import { calculateStreaks } from '../../src/lib/streak';
export interface Env {
  GITHUB_TOKEN: string;
  CLIENT_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const username = url.searchParams.get('username');
    const path = url.pathname;
    const cache = caches.default;
	  const corsHeaders = {
		  "Access-Control-Allow-Origin": "*", 
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, Accept",
      "Access-Control-Max-Age": "86400",
    };

    const github_pat_token = env.GITHUB_TOKEN || null
    const client_validation_key = env.CLIENT_API_KEY || null

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

	if (!github_pat_token) {
      return new Response("Error: GITHUB_TOKEN is missing from environment", { status: 500 });
    }
	if (!client_validation_key){
		return new Response("Error: CLIENT_API_KEY is missing from environment", { status: 500 });
	}

    if (!username) {
      return new Response('Error: Username parameter is required', { 
        status: 400,
        headers: corsHeaders
      });
    }

    const cacheKey = new Request(url.toString(), request);
    let response = await cache.match(cacheKey);

    if (response) {
      const newHeaders = new Headers(response.headers);
      newHeaders.set("X-Worker-Cache", "HIT");
      return new Response(response.body, { headers: newHeaders });
    }

    try {

      if (path.startsWith('/api/')) {
        const incomingKey = request.headers.get('x-api-key');
        if (incomingKey !== client_validation_key) {
          return new Response('Unauthorized: Missing or invalid x-api-key', { status: 401 });
        }
      }

      let content: string;
      let contentType: string;

      if (path === '/api/data') {
        content = JSON.stringify(await fetchUnifiedDashboardData(username, github_pat_token));
        contentType = "application/json";
      } else if (path === '/api/badges' || path === '/badges') {
        const data = await fetchBadgeData(username, github_pat_token);
        const trophies = calculateTrophies(data);
        content = path.includes('/api/') ? JSON.stringify(trophies) : generateBadgesSVG(username, trophies);
        contentType = path.includes('/api/') ? "application/json" : "image/svg+xml";
      } else if (path === '/api/rank' || path === '/rank') {
        const data = await fetchRankingData(username, github_pat_token);
        const rank = calculateUserRank(data);
        content = path.includes('/api/') ? JSON.stringify(rank) : generateRankSVG(username, rank);
        contentType = path.includes('/api/') ? "application/json" : "image/svg+xml";
      } else if (path === '/api/streaks' || path === '/streaks') {
        const data = await fetchStreakData(username, github_pat_token);
        const streaks = calculateStreaks(data.allTimeContributions.contributionDays, data.allTimeContributions.stats);
        content = path.includes('/api/') ? JSON.stringify(streaks) : generateStreaksSVG(username, streaks);
        contentType = path.includes('/api/') ? "application/json" : "image/svg+xml";
      } 
      else {
        return new Response('Welcome! Endpoints: /badges, /rank, /streaks, /api/data', { status: 200 });
      }

      response = new Response(content, {
        headers: {
          ...corsHeaders,
          "Content-Type": contentType,
          "X-Worker-Cache": "MISS",
          'Cache-Control': 'public, s-maxage=14400, max-age=3600, stale-while-revalidate=7200', 
        },
      });
      ctx.waitUntil(cache.put(cacheKey, response.clone()));

      return response;

    } catch (err: any) {
      return new Response(`Worker Error: ${err.message}`, { 
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
  },
};

function generateRankSVG(username: string, rank: any) {
  const rankColor = getRankColor(rank.grade);
  const medians: Record<string, number> = {
    followers: 100, stars: 200, repos: 50, forks: 50, accountAge: 10,
  };
  const rankFontSize = rank.grade.length > 2 ? '42px' : '60px';

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
    }).join('');

  return `
    <svg width="720" height="320" viewBox="0 0 720 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
        .header { font: bold 12px Arial, sans-serif; fill: #8b949e; letter-spacing: 1px; }
        .username { font: bold 18px Arial, sans-serif; fill: #c9d1d9; }
        .rank-text { font: bold ${rankFontSize} Arial, sans-serif; fill: ${rankColor}; opacity: 0; animation: fadeIn 0.8s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
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
    </svg>`;
}

const getStarCount = (tier: string) => {
  const tiers: Record<string, number> = { S: 5, AAA: 4, AA: 3, A: 2, B: 1, C: 1, SECRET: 5 };
  return tiers[tier] || 0;
};

function generateBadgesSVG(username: string, trophies: any[]) {
  const itemsPerRow = 5;
  const badgeWidth = 220;
  const badgeHeight = 280;
  const padding = 40;
  const rows = Math.ceil(trophies.length / itemsPerRow);

  const svgWidth = badgeWidth * itemsPerRow + padding * 2;
  const svgHeight = rows * (badgeHeight + 20) + padding * 2 + 40;

  const trophiesContent = trophies.map((trophy, index) => {
    const col = index % itemsPerRow;
    const row = Math.floor(index / itemsPerRow);
    const x = padding + col * badgeWidth;
    const y = padding + 40 + row * (badgeHeight + 20);
    const color = getTierColor(trophy.tier); // Use your existing color utility
    const stars = getStarCount(trophy.tier);

    // Generate star paths
    const starPaths = [...Array(stars)].map((_, i) => {
      const spacing = 16.1;
      const startX = 110 - ((stars - 1) * spacing) / 2;
      const starX = x + startX + 8.5 + i * spacing;
      const starY = y + 47.07;
      return `M${starX} ${starY}c.07-.35-.21-.77-.56-.77l-3.99-.56-1.82-3.64a.55.55 0 0 0-.28-.28c-.35-.21-.77-.07-.98.28l-1.75 3.64-3.99.56q-.315 0-.42.21c-.28.28-.28.7 0 .98l2.87 2.8-.7 3.99c0 .14 0 .28.07.42.21.35.63.49.98.28l3.57-1.89 3.57 1.89c.07.07.21.07.35.07.35-.07.63-.42.56-.84l-.7-3.99 2.87-2.8c.28-.07.35-.21.35-.35`;
    }).join("");

    return `
      <g>
        <g transform="translate(${x + 33}, ${y}) scale(0.7, 1)">
          <path d="M38 30 q-8 0 -8 8 v90 q0 8 8 10 l64 36 q8 4 16 0 l64 -36 q8 -2 8 -10 V38 q0 -8 -8 -8 Z" fill="#000" stroke="#000"/>
          <path d="M38 29.8 h144 q8 0 8 8 v27 H30 V38 q0 -8 8 -8.2 Z" fill="${color}"/>
        </g>
        <path d="${starPaths}" fill="#fff"/>
        <text x="${x + 110}" y="${y + 105}" font-size="12" font-weight="900" text-anchor="middle" fill="#fff" font-family="monospace">${trophy.name.split(" ")[0].toUpperCase()}</text>
        <text x="${x + 110}" y="${y + 125}" font-size="12" font-weight="900" text-anchor="middle" fill="#fff" font-family="monospace">${trophy.name.split(" ").slice(1).join(" ").toUpperCase()}</text>
        <text x="${x + 110}" y="${y + 220}" font-size="10" text-anchor="middle" fill="#888" font-family="monospace">@${username}</text>
        <text x="${x + 110}" y="${y + 235}" font-size="9" text-anchor="middle" fill="#666" font-family="Arial, sans-serif">${trophy.description}</text>
      </g>`;
  }).join("");

  return `
    <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="transparent"/>
      ${trophiesContent}
    </svg>`;
}


function generateStreaksSVG(username: string, streakData: any) {
  const primaryColor = "#fb8c00"; // Streak Orange
  
  const svg = `
<svg width="720" height="320" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .stat-label { font: bold 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #8b949e; text-transform: uppercase; letter-spacing: 0.1em; }
      .stat-value { font: bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #ffffff; }
      .username { font: bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #ffffff; }
      .small-text { font: 10px 'SF Mono', Monaco, monospace; fill: #6e7681; }
      .current-streak { font: 900 60px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: ${primaryColor}; }
      .days-text { font: bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #fb8c0050; }
      .secondary-value { font: bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #c9d1d9; }
      .days-small { font: bold 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #c9d1d9; }
      .tiny-text { font: 9px 'SF Mono', Monaco, monospace; fill: #6e7681; text-transform: uppercase; }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="720" height="320" rx="16" fill="#0d1117"/>
  <rect width="720" height="320" rx="16" fill="none" stroke="#30363d" stroke-width="2"/>
  
  <!-- Left Section -->
  <g>
    <!-- Vertical Dashed Line -->
    <line x1="251" y1="32" x2="251" y2="288" stroke="#30363d" stroke-width="2" stroke-dasharray="5,5"/>
    
    <!-- Header (Top) -->
    <circle cx="40" cy="25" r="2" fill="${primaryColor}"/>
    <text x="48" y="28" class="stat-label">Streaks</text>
    <text x="32" y="50" class="username">@${username}</text>
    
    <!-- Current Streak (Centered) -->
    <text x="32" y="100" class="stat-label">Current Streak</text>
    <text x="32" y="170" class="current-streak">${streakData.currentStreak.days}</text>
    <text x="${32 + (streakData.currentStreak.days.toString().length * 45)}" y="165" class="days-text">Days</text>
    <text x="32" y="210" class="small-text">${streakData.currentStreak.from} — ${streakData.currentStreak.to}</text>
    
    <!-- Footer (Bottom) -->
    <line x1="32" y1="260" x2="219" y2="260" stroke="#161b22" stroke-width="1"/>
    <text x="32" y="260" class="small-text">GITHUB VERIFIED DATA</text>
  </g>
  
  <!-- Right Section -->
  <g>
    <!-- Total Contributions -->
    <text x="283" y="110" class="stat-label">Total Contributions</text>
    <text x="${688 - (streakData.totalContributions.toString().length * 14)}" y="110" class="stat-value">${streakData.totalContributions}</text>
    
    <!-- Progress Bar -->
    <rect x="283" y="120" width="405" height="6" rx="3" fill="#30363d"/>
    <rect x="283" y="120" width="405" height="6" rx="3" fill="${primaryColor}80"/>
    
    <!-- Longest Streak -->
    <text x="283" y="190" class="stat-label">Longest Streak</text>
    <text x="${630 - (streakData.longestStreak.days.toString().length * 14)}" y="190" class="secondary-value">${streakData.longestStreak.days}</text>
    <text x="${630 - (streakData.longestStreak.days.toString().length * 14) + (streakData.longestStreak.days.toString().length * 17)}" y="190" class="days-small">Days</text>
    
    <!-- Progress Bar -->
    <rect x="283" y="200" width="405" height="6" rx="3" fill="#30363d"/>
    <rect x="283" y="200" width="324" height="6" rx="3" fill="#8b949e"/>
    
    <text x="283" y="220" class="tiny-text">Peak performance: ${streakData.longestStreak.from} to ${streakData.longestStreak.to}</text>
  </g>
</svg>`.trim();

  return svg;
}