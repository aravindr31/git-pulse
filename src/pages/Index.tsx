import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Github, Sparkles } from 'lucide-react';
import { UsernameSearch } from '@/components/UsernameSearch';
import { ProfileCard } from '@/components/ProfileCard';
import { RepoList } from '@/components/RepoList';
import { LanguageChart } from '@/components/LanguageChart';
import { ActivityFeed } from '@/components/ActivityFeed';
import { RepoStats } from '@/components/RepoStats';
import { BottomPill } from '@/components/BottomPill';
import { TrophyDisplay } from '@/components/TrophyDisplay';
import { UserRank } from '@/components/UserRank';
<<<<<<< HEAD
import { 
  fetchGitHubData, 
  fetchGitHubEvents, 
  calculateLanguageStats 
} from '@/lib/github';
import { calculateTrophies } from '@/lib/badges';
=======
import ContributionChart from '@/components/ContributionChart';
import { fetchGitHubUser, fetchGitHubRepos, fetchGitHubEvents, calculateLanguageStats } from '@/lib/github';
import { calculateTrophies } from '@/lib/trophies';
>>>>>>> main
import { calculateUserRank } from '@/lib/ranking';
import { calculateContributions } from '@/lib/contributions';

const Index = () => {
  const [searchedUsername, setSearchedUsername] = useState<string | null>(null);

  // Main GraphQL Query
  const { data: githubData, isLoading: dataLoading, error: dataError } = useQuery({
    queryKey: ['github-data', searchedUsername],
    queryFn: () => fetchGitHubData(searchedUsername!),
    enabled: !!searchedUsername,
    retry: false,
  });

  // Keep REST Events for the Activity Feed (easier than GraphQL for timelines)
  const { data: events } = useQuery({
    queryKey: ['github-events', searchedUsername],
    queryFn: () => fetchGitHubEvents(searchedUsername!),
    enabled: !!searchedUsername && !!githubData,
  });

<<<<<<< HEAD
  // Process data for components
  // Note: GraphQL returns nodes, so we map them to look like the old REST array
  const repos = githubData?.repositories?.nodes || [];
  const languageStats = githubData ? calculateLanguageStats(repos) : {};
  
  // New Trophies & Rank logic using the GraphQL object
  const trophies = githubData ? calculateTrophies(githubData) : [];
  const rank = githubData ? calculateUserRank(githubData) : null;
=======
  const languageStats = repos ? calculateLanguageStats(repos) : {};
  const trophies = user && repos ? calculateTrophies(user, repos, events || []) : [];
  const rank = user && repos ? calculateUserRank(user, repos) : null;
  const contributions = events ? calculateContributions(events) : null;
>>>>>>> main

  const handleSearch = (username: string) => {
    setSearchedUsername(username);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
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
                Explore GitHub Profiles
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="gradient-text">GitProfile</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
                Analyze GitHub profiles with GraphQL-powered insights
              </p>
            </div>
          )}

          {!searchedUsername && (
            <div className="mb-8">
              <UsernameSearch onSearch={handleSearch} isLoading={dataLoading} />
            </div>
          )}

          {/* Error state */}
          {dataError && (
            <div className="glass-card p-6 text-center animate-fade-in">
              <Github className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-destructive font-medium">User not found</p>
              <p className="text-sm text-muted-foreground mt-1">
                GitHub GraphQL API couldn't find this user.
              </p>
            </div>
          )}

          {/* Loading state */}
          {dataLoading && (
            <div className="glass-card p-12 text-center animate-fade-in">
              <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Fetching deep stats...</p>
            </div>
          )}

          {/* Dashboard */}
          {githubData && !dataLoading && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ProfileCard user={githubData} />
                </div>
                {rank && <UserRank rank={rank} />}
              </div>

              <TrophyDisplay trophies={trophies} />

<<<<<<< HEAD
=======
              {/* Contribution Chart */}
              {contributions && <ContributionChart data={contributions} />}

              {/* Stats grid */}
>>>>>>> main
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    Top Repositories
                  </h3>
                  {/* Passing the mapped nodes to RepoList */}
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

          {/* Examples section */}
          {!searchedUsername && !dataLoading && (
            <div className="glass-card p-12 text-center animate-fade-in mt-8">
              <Github className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">
                Try these popular developers
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {['torvalds', 'gaearon', 'sindresorhus', 'tj', 'shadcn'].map((name) => (
                  <button
                    key={name}
                    onClick={() => handleSearch(name)}
                    className="px-3 py-1 text-sm bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-full transition-colors font-mono"
                  >
                    @{name}
                  </button>
                ))}
              </div>
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