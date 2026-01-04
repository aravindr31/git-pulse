import { useParams } from "react-router-dom";
import { getTierColor } from "@/lib/badges";
import { useGithubBadges } from "@/hooks/useGithubQueries";

export default function Badges() {
  const { username } = useParams<{ username: string }>();

  const {
    data: githubData,
    isLoading,
    error,
  } = useGithubBadges(username);

  const trophies = githubData 

  // Star count based on tier
  const getStarCount = (tier: string) => {
    if (tier === "S") return 5;
    if (tier === "AAA") return 4;
    if (tier === "AA") return 3;
    if (tier === "A") return 2;
    if (tier === "B") return 1;
    if (tier === "C") return 1;
    if (tier === "SECRET") return 5;
    return 0;
  };

  const downloadTrophiesSVG = () => {
    if (trophies.length === 0) return;

    const itemsPerRow = 5;
    const badgeWidth = 220;
    const badgeHeight = 280;
    const padding = 40;
    const rows = Math.ceil(trophies.length / itemsPerRow);

    const svgWidth = badgeWidth * itemsPerRow + padding * 2;
    const svgHeight = rows * (badgeHeight + 20) + padding * 2 + 40;

    const trophiesSVG = trophies
      .map((trophy, index) => {
        const col = index % itemsPerRow;
        const row = Math.floor(index / itemsPerRow);
        const x = padding + col * badgeWidth;
        const y = padding + 40 + row * (badgeHeight + 20);
        const color = getTierColor(trophy.tier);
        const stars = getStarCount(trophy.tier);

        // Generate star paths
        const starPaths = [...Array(stars)]
          .map((_, i) => {
            const spacing = 16.1;
            const startX = 110 - ((stars - 1) * spacing) / 2;
            const starX = x + startX + 8.5 + i * spacing;
            const starY = y + 47.07;

            return `
          M${starX} ${starY}c.07-.35-.21-.77-.56-.77l-3.99-.56-1.82-3.64
          a.55.55 0 0 0-.28-.28c-.35-.21-.77-.07-.98.28
          l-1.75 3.64-3.99.56q-.315 0-.42.21
          c-.28.28-.28.7 0 .98l2.87 2.8-.7 3.99
          c0 .14 0 .28.07.42.21.35.63.49.98.28
          l3.57-1.89 3.57 1.89c.07.07.21.07.35.07
          .35-.07.63-.42.56-.84l-.7-3.99 2.87-2.8
          c.28-.07.35-.21.35-.35
        `;
          })
          .join("");

        return `
        <g>
          <!-- Badge Body (Narrowed) -->
          <g transform="translate(${x + 33}, ${y}) scale(0.7, 1)">
            <!-- Outer badge -->
            <path
              d="M38 30
                 q-8 0 -8 8
                 v90
                 q0 8 8 10
                 l64 36
                 q8 4 16 0
                 l64 -36
                 q8 -2 8 -10
                 V38
                 q0 -8 -8 -8
                 Z"
              fill="#000"
              stroke="#000"
            />
            <!-- Top header strip -->
            <path
              d="M38 29.8
                 h144
                 q8 0 8 8
                 v27
                 H30
                 V38
                 q0 -8 8 -8.2
                 Z"
              fill="${color}"
            />
          </g>
          
          <!-- Stars -->
          <path d="${starPaths}" fill="#fff"/>
          
          <!-- Badge Title -->
          <text x="${x + 110}" y="${
          y + 105
        }" font-size="12" font-weight="900" text-anchor="middle" fill="#fff" font-family="monospace">
            ${trophy.name.split(" ")[0].toUpperCase()}
          </text>
          <text x="${x + 110}" y="${
          y + 125
        }" font-size="12" font-weight="900" text-anchor="middle" fill="#fff" font-family="monospace">
            ${trophy.name.split(" ").slice(1).join(" ").toUpperCase()}
          </text>
          <text x="${x + 110}" y="${y + 220}" font-size="10" text-anchor="middle" fill="#888" font-family="monospace">
            @${username}
          </text>
          
          <text x="${x + 110}" y="${y + 235}" font-size="9" text-anchor="middle" fill="#666" font-family="Arial, sans-serif">
            ${trophy.description}
          </text>
        </g>
      `;
      })
      .join("");

    const svgContent = `
      <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="none"/>
        ${trophiesSVG}
      </svg>
    `;

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${username}-github-certifications.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-gray-500 font-mono animate-pulse">
        Loading Your Badges...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center text-red-500">
        Failed to load achievements.
      </div>
    );
  }

  if (trophies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black text-white">No Badges Yet</h2>
          <p className="text-gray-500">
            Keep contributing to unlock achievements!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mx-auto py-10 space-y-10 bg-gradient-to-br from-black via-gray-900 to-black min-h-screen">
      <div className="text-center">
        <h2 className="text-lg font-bold text-muted-foreground tracking-tight mb-2">
          Badges for @{username}
        </h2>
      </div>

      {/* Badge Grid */}
      <div
        className="grid gap-6 max-w-7xl px-4 mx-auto justify-center [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]
    md:[grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]
    lg:[grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]"
      >
        {trophies.map((trophy) => {
          const color = getTierColor(trophy.tier);
          const stars = getStarCount(trophy.tier);

          return (
            <div
              key={trophy.id}
              className="flex flex-col items-center group"
            >
              <svg
                width="220"
                height="280"
                viewBox="0 0 220 280"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform duration-300 group-hover:scale-105"
              >
                <defs>
                  <filter id={`shadow-${trophy.id}`}>
                    <feDropShadow
                      dx="0"
                      dy="4"
                      stdDeviation="8"
                      floodOpacity="0.5"
                    />
                  </filter>
                </defs>

                {/* Badge Body (Narrowed) */}
                <g transform="translate(33, 0) scale(0.7, 1)">
                  {/* Outer badge */}
                  <path
                    d="M38 30
                       q-8 0 -8 8
                       v90
                       q0 8 8 10
                       l64 36
                       q8 4 16 0
                       l64 -36
                       q8 -2 8 -10
                       V38
                       q0 -8 -8 -8
                       Z"
                    fill="#000"
                    stroke="#000"
                    filter={`url(#shadow-${trophy.id})`}
                  />
                  {/* Top header strip (rounded top corners only) */}
                  <path
                    d="M38 29.8
                       h144
                       q8 0 8 8
                       v27
                       H30
                       V38
                       q0 -8 8 -8.2
                       Z"
                    fill={color}
                  />
                </g>

                {/* Stars */}
                <path
                  d={[...Array(stars)]
                    .map((_, i) => {
                      const spacing = 16.1;
                      const startX = 110 - ((stars - 1) * spacing) / 2;
                      const starX = startX + 8.5 + i * spacing;

                      return `
                      M${starX} 47.07c.07-.35-.21-.77-.56-.77l-3.99-.56-1.82-3.64
                      a.55.55 0 0 0-.28-.28c-.35-.21-.77-.07-.98.28
                      l-1.75 3.64-3.99.56q-.315 0-.42.21
                      c-.28.28-.28.7 0 .98l2.87 2.8-.7 3.99
                      c0 .14 0 .28.07.42.21.35.63.49.98.28
                      l3.57-1.89 3.57 1.89c.07.07.21.07.35.07
                      .35-.07.63-.42.56-.84l-.7-3.99 2.87-2.8
                      c.28-.07.35-.21.35-.35
                    `;
                    })
                    .join("")}
                  fill="#fff"
                />

                {/* Badge Title */}
                <text
                  x="110"
                  y="105"
                  fontSize="12"
                  fontWeight="900"
                  textAnchor="middle"
                  fill="#fff"
                  fontFamily="monospace"
                >
                  {trophy.name.split(" ")[0].toUpperCase()}
                </text>
                <text
                  x="110"
                  y="125"
                  fontSize="12"
                  fontWeight="900"
                  textAnchor="middle"
                  fill="#fff"
                  fontFamily="monospace"
                >
                  {trophy.name.split(" ").slice(1).join(" ").toUpperCase()}
                </text>

                {/* Username */}
                <text
                  x="110"
                  y="220"
                  fontSize="10"
                  textAnchor="middle"
                  fill="#888"
                  fontFamily="monospace"
                >
                  @{username}
                </text>

                {/* Year */}
                <text
                  x="110"
                  y="235"
                  fontSize="9"
                  textAnchor="middle"
                  fill="#666"
                  fontFamily="Arial, sans-serif"
                >
                  {new Date().getFullYear()}
                </text>
              </svg>

              {/* Description */}
              <div className="mt-2 text-center">
                <div className="text-gray-400 text-xs font-mono">
                  {trophy.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={downloadTrophiesSVG}
        className="mt-12 px-10 py-4 bg-white text-black rounded-full font-black hover:bg-gray-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-95"
      >
        Export Your Badges (.svg)
      </button>
    </div>
  );
}
