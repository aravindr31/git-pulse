import { Trophy, getTierColor } from '@/lib/badges';

interface BadgeDisplayProps {
  trophies: Trophy[];
  username: string;
}

export function BadgeDisplay({ trophies, username }: BadgeDisplayProps) {
  if (trophies.length === 0) return null;

  const getStarCount = (tier: string) => {
    const tiers: Record<string, number> = { S: 5, AAA: 4, AA: 3, A: 2, B: 1, C: 1, SECRET: 5 };
    return tiers[tier] || 0;
  };

  return (
<div className="glass-card p-6">
      
<div className="flex flex-wrap gap-10 justify-center items-start w-full px-4">
  {trophies.map((trophy) => {
    const color = getTierColor(trophy.tier);
    const stars = getStarCount(trophy.tier);
    return(
    <div 
      key={trophy.id} 
      className="flex flex-col items-center group w-[180px] sm:w-[200px]"
    >
      <div className="relative">
        {/* Optional: Glow effect that appears on hover */}
        <div 
          className="absolute inset-0 blur-2xl opacity-0 group-hover:opacity-15 transition-opacity duration-500"
          style={{ backgroundColor: getTierColor(trophy.tier) }}
        />
        
        <svg
          width="100%"
          height="auto"
          viewBox="0 0 220 280"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 transition-transform duration-300 group-hover:scale-105"
        >
                {/* Narrowed Badge Body */}
                <g transform="translate(33, 0) scale(0.7, 1)">
                  <path
                    d="M38 30 q-8 0 -8 8 v90 q0 8 8 10 l64 36 q8 4 16 0 l64 -36 q8 -2 8 -10 V38 q0 -8 -8 -8 Z"
                    fill="#000"
                    stroke="#1a1a1a"
                    strokeWidth="2"
                  />
                  <path
                    d="M38 29.8 h144 q8 0 8 8 v27 H30 V38 q0 -8 8 -8.2 Z"
                    fill={color}
                  />
                </g>

                {/* Star Rating */}
                <path
                  d={[...Array(stars)].map((_, i) => {
                    const spacing = 16.1;
                    const startX = 110 - ((stars - 1) * spacing) / 2;
                    const starX = startX + 8.5 + i * spacing;
                    return `M${starX} 47.07c.07-.35-.21-.77-.56-.77l-3.99-.56-1.82-3.64 a.55.55 0 0 0-.28-.28c-.35-.21-.77-.07-.98.28 l-1.75 3.64-3.99.56q-.315 0-.42.21 c-.28.28-.28.7 0 .98l2.87 2.8-.7 3.99 c0 .14 0 .28.07.42.21.35.63.49.98.28 l3.57-1.89 3.57 1.89c.07.07.21.07.35.07 .35-.07.63-.42.56-.84l-.7-3.99 2.87-2.8 c.28-.07.35-.21.35-.35`;
                  }).join(" ")}
                  fill="#fff"
                />

                {/* Badge Text */}
                <text x="110" y="105" fontSize="12" fontWeight="900" textAnchor="middle" fill="#fff" fontFamily="monospace">
                  {trophy.name.split(" ")[0].toUpperCase()}
                </text>
                <text x="110" y="125" fontSize="12" fontWeight="900" textAnchor="middle" fill="#fff" fontFamily="monospace">
                  {trophy.name.split(" ").slice(1).join(" ").toUpperCase()}
                </text>
                <text x="110" y="220" fontSize="10" textAnchor="middle" fill="#888" fontFamily="monospace">
                  @{username}
                </text>
              </svg>
</div>
<div className="mt-4 text-center">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
          {trophy.description}
        </p>
      </div>
    </div>
  )}
)}
</div>
    </div>
  );
}