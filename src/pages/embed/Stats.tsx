import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchGitHubData } from '@/lib/github';
import { calculateUserRank, getRankColor } from '@/lib/ranking';

export default function Stats() {
  const { username } = useParams<{ username: string }>();

  const { data: githubData, isLoading, error } = useQuery({
    queryKey: ['github-data', username],
    queryFn: () => fetchGitHubData(username!),
    enabled: !!username,
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse text-muted-foreground">Fetching Your Stats...</div>;
  if (error || !githubData) return <div style={{ padding: '16px', color: 'red' }}>User not found</div>;

 
  const rank = calculateUserRank(githubData);

  const totalStars = githubData.repositories.nodes.reduce((sum: number, r: any) => sum + r.stargazerCount, 0);
  const totalForks = githubData.repositories.nodes.reduce((sum: number, r: any) => sum + r.forkCount, 0);

  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif', 
      padding: '20px',
      backgroundColor: '#0d1117',
      color: '#e6edf3',
      borderRadius: '12px',
      border: '1px solid #30363d',
      maxWidth: '450px'
    }}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img src={githubData.avatarUrl} style={{ width: '24px', height: '24px', borderRadius: '50%' }} alt="" />
        Stats for @{githubData.login}
      </h2>
      
      {rank && (
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px', 
          backgroundColor: `${getRankColor(rank.grade)}10`,
          border: `1px solid ${getRankColor(rank.grade)}40`,
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: getRankColor(rank.grade),
            textShadow: `0 0 10px ${getRankColor(rank.grade)}40`
          }}>
            {rank.grade}
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Overall Rank
            </div>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>
              Top {rank.percentile.toFixed(1)}% of Users
            </div>
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <StatRow label="Followers" value={githubData.followers.totalCount} />
        <StatRow label="All-time Commits" value={githubData.contributionsCollection.totalCommitContributions} />
        <StatRow label="Merged PRs" value={githubData.mergedPRs.totalCount} />
        <StatRow label="Total Stars" value={totalStars} />
        <StatRow label="Total Forks" value={totalForks} />
        <StatRow label="Public Repos" value={githubData.repositories.totalCount} />
        <StatRow label="Account Age" value={`${Math.floor((Date.now() - new Date(githubData.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365))} Years`} />
      </div>
    </div>
  );
}

// Helper Component for cleaner rows
function StatRow({ label, value }: { label: string, value: string | number }) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      paddingBottom: '8px', 
      borderBottom: '1px solid #30363d' 
    }}>
      <span style={{ color: '#8b949e', fontSize: '14px' }}>{label}</span>
      <span style={{ fontWeight: '600', fontSize: '14px', fontFamily: 'monospace' }}>{value}</span>
    </div>
  );
}