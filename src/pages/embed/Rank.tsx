import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchGitHubUser, fetchGitHubRepos } from '@/lib/github';
import { calculateUserRank, getRankColor } from '@/lib/ranking';

export default function EmbedRank() {
  const { username } = useParams<{ username: string }>();

  const { data: user } = useQuery({
    queryKey: ['github-user', username],
    queryFn: () => fetchGitHubUser(username!),
    enabled: !!username,
  });

  const { data: repos } = useQuery({
    queryKey: ['github-repos', username],
    queryFn: () => fetchGitHubRepos(username!),
    enabled: !!username && !!user,
  });

  const rank = user && repos ? calculateUserRank(user, repos) : null;

  if (!user || !rank) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '16px', textAlign: 'center' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>
        Rank for @{username}
      </h2>
      
      <div style={{ 
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100px',
        height: '100px',
        border: `4px solid ${getRankColor(rank.grade)}`,
        borderRadius: '16px',
        fontSize: '40px',
        fontWeight: 'bold',
        color: getRankColor(rank.grade),
        marginBottom: '16px'
      }}>
        {rank.grade}
      </div>
      
      <div style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
        Score: {rank.score}/100
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {Object.entries(rank.breakdown).map(([key, value]) => (
          <div key={key} style={{ 
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '12px'
          }}>
            <div style={{ textTransform: 'capitalize', color: '#666' }}>
              {key.replace(/([A-Z])/g, ' $1')}
            </div>
            <div style={{ fontWeight: 'bold' }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
