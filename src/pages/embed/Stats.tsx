import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchGitHubUser, fetchGitHubRepos } from '@/lib/github';
import { calculateUserRank, getRankColor } from '@/lib/ranking';

export default function EmbedStats() {
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
  const totalStars = repos?.reduce((sum, repo) => sum + repo.stargazers_count, 0) || 0;
  const totalForks = repos?.reduce((sum, repo) => sum + repo.forks_count, 0) || 0;

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '16px' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>
        Stats for @{username}
      </h2>
      
      {rank && (
        <div style={{ 
          display: 'inline-block', 
          padding: '8px 16px', 
          border: `2px solid ${getRankColor(rank.grade)}`,
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '24px', color: getRankColor(rank.grade) }}>
            {rank.grade}
          </span>
          <span style={{ marginLeft: '8px', color: '#666' }}>
            Score: {rank.score}/100
          </span>
        </div>
      )}
      
      <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: '400px' }}>
        <tbody>
          <tr>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Followers</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>{user.followers}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Following</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>{user.following}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Public Repos</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>{user.public_repos}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Public Gists</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>{user.public_gists}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Total Stars</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>{totalStars}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Total Forks</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>{totalForks}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px' }}>Member Since</td>
            <td style={{ padding: '8px', fontWeight: 'bold' }}>{new Date(user.created_at).toLocaleDateString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
