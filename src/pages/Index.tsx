import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Github, Sparkles, Award } from 'lucide-react';
import { UsernameSearch } from '@/components/UsernameSearch';
import { ProfileCard } from '@/components/ProfileCard';
import { RepoList } from '@/components/RepoList';
import { LanguageChart } from '@/components/LanguageChart';
import { ActivityFeed } from '@/components/ActivityFeed';
import { RepoStats } from '@/components/RepoStats';
import { BottomPill } from '@/components/BottomPill';
import { TrophyDisplay } from '@/components/TrophyDisplay'; // This is your Badges component
import { UserRank } from '@/components/UserRank';
import { BadgeDisplay } from '@/components/BadgeDisplay';

// Unified logic imports
import { fetchGitHubData, calculateLanguageStats, fetchGitHubEvents } from '@/lib/github';
import { calculateTrophies } from '@/lib/badges';
import { calculateUserRank } from '@/lib/ranking';

const Index = () => {
  const [searchedUsername, setSearchedUsername] = useState<string | null>(null);

    const { data: githubData, isLoading, error } = useQuery({
    queryKey: ['github-proxy-data', searchedUsername],
    queryFn: async () => {
      const baseUrl = import.meta.env.DEV 
        ? 'http://localhost:8787' 
        : 'https://your-worker.subdomain.workers.dev';

      const response = await fetch(`${baseUrl}/api/data?username=${searchedUsername}`);
      
      if (!response.ok) throw new Error('Worker failed to fetch data');
      return response.json();
    },
    enabled: !!searchedUsername,
    retry: false,
  });

  // 2. Separate Query for Events (REST)
  const { data: events } = useQuery({
    queryKey: ['github-events', searchedUsername],
    queryFn: () => fetchGitHubEvents(searchedUsername!),
    enabled: !!searchedUsername && !!githubData,
  });

  // 3. Derived Data logic
  const repos = githubData?.repositories?.nodes || [];
  const languageStats = githubData ? calculateLanguageStats(repos) : {};
  const badges = githubData ? calculateTrophies(githubData) : [];
  const rank = githubData ? calculateUserRank(githubData) : null;

  const handleSearch = (username: string) => {
    setSearchedUsername(username);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 px-4 py-12 pb-24">
        <div className="max-w-5xl mx-auto">
          
          {/* Hero section */}
          {!searchedUsername && (
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm mb-6">
                <Sparkles className="h-4 w-4" />
                GitHub Badge Showcase
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="gradient-text">GitProfile</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
                Analyze your performance and earn unique contribution badges.
              </p>
              <UsernameSearch onSearch={handleSearch} isLoading={isLoading} />
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="glass-card p-12 text-center">
              <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Calculating Badges & Rank...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="glass-card p-6 text-center border-destructive/20 bg-destructive/5">
              <Github className="h-12 w-12 mx-auto mb-3 text-destructive opacity-50" />
              <p className="text-destructive font-medium">Username not found</p>
              <button onClick={() => setSearchedUsername(null)} className="text-sm text-muted-foreground underline mt-2">Try another search</button>
            </div>
          )}

          {/* Dashboard View */}
          {githubData && !isLoading && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* Profile & Rank Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ProfileCard user={githubData} />
                </div>
                {rank && <UserRank rank={rank} />}
              </div>

              {/* Earned Badges Section */}
              <div className="space-y-4">
  <div className="flex items-center gap-2 px-1">
    <Award className="w-5 h-5 text-primary" />
    <h3 className="font-bold text-lg">Earned Badges</h3>
  </div>
  {/* Pass both badges and the username for the badge labels */}
  <BadgeDisplay trophies={badges} username={githubData.login} />
</div>
              {/* <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Award className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg">Earned Badges</h3>
                </div>
                <TrophyDisplay trophies={badges} />
              </div> */}

              {/* Repository & Activity Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    Top Repositories
                  </h3>
                  <RepoList repos={repos} />
                </div>

                <div className="space-y-6">
                  <RepoStats repos={repos} />
                  <LanguageChart stats={languageStats} />
                  <ActivityFeed events={events || []} />
                </div>
              </div>
            </div>
          )}

          {/* Suggested Profiles */}
          {!searchedUsername && !isLoading && (
            <div className="flex flex-wrap justify-center gap-2 mt-8 opacity-70">
              {['torvalds', 'gaearon', 'sindresorhus', 'tj'].map((name) => (
                <button
                  key={name}
                  onClick={() => handleSearch(name)}
                  className="px-3 py-1 text-xs bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-full transition-colors"
                >
                  @{name}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomPill
        username={githubData?.login}
        onSearch={handleSearch}
        hasResults={!!githubData}
      />
    </div>
  );
};

export default Index;