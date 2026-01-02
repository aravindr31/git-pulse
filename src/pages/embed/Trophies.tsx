import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchGitHubUser, fetchGitHubRepos, fetchGitHubEvents } from '@/lib/github';
import { calculateTrophies, getTierColor } from '@/lib/trophies';

export default function EmbedTrophies() {
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

  const { data: events } = useQuery({
    queryKey: ['github-events', username],
    queryFn: () => fetchGitHubEvents(username!),
    enabled: !!username && !!user,
  });

  const trophies = user && repos ? calculateTrophies(user, repos, events || []) : [];

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '16px' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>
        Trophies for @{username}
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {trophies.map((trophy) => (
          <div
            key={trophy.id}
            style={{
              padding: '12px',
              border: `2px solid ${getTierColor(trophy.tier)}`,
              borderRadius: '8px',
              minWidth: '120px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{trophy.icon}</div>
            <div style={{ fontWeight: 'bold', fontSize: '12px', color: getTierColor(trophy.tier) }}>
              {trophy.tier}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 500 }}>{trophy.name}</div>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
              {trophy.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
