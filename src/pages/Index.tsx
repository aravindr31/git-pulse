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
import { fetchGitHubUser, fetchGitHubRepos, fetchGitHubEvents, calculateLanguageStats } from '@/lib/github';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [searchedUsername, setSearchedUsername] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['github-user', searchedUsername],
    queryFn: () => fetchGitHubUser(searchedUsername!),
    enabled: !!searchedUsername,
    retry: false,
  });

  const { data: repos } = useQuery({
    queryKey: ['github-repos', searchedUsername],
    queryFn: () => fetchGitHubRepos(searchedUsername!),
    enabled: !!searchedUsername && !!user,
  });

  const { data: events } = useQuery({
    queryKey: ['github-events', searchedUsername],
    queryFn: () => fetchGitHubEvents(searchedUsername!),
    enabled: !!searchedUsername && !!user,
  });

  const languageStats = repos ? calculateLanguageStats(repos) : {};

  const handleSearch = (username: string) => {
    setSearchedUsername(username);
  };

  const handleLogin = () => {
    toast({
      title: "GitHub OAuth",
      description: "To enable GitHub OAuth login, connect Lovable Cloud for backend authentication support.",
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <main className="relative z-10 px-4 py-12 pb-24">
        <div className="max-w-5xl mx-auto">
          {/* Hero section - only show when no user searched */}
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
                Discover and analyze GitHub profiles with beautiful visualizations
              </p>
            </div>
          )}

          {/* Search bar */}
          <div className="mb-8">
            <UsernameSearch onSearch={handleSearch} isLoading={userLoading} />
          </div>

          {/* Error state */}
          {userError && (
            <div className="glass-card p-6 text-center animate-fade-in">
              <Github className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-destructive font-medium">User not found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Please check the username and try again
              </p>
            </div>
          )}

          {/* Loading state */}
          {userLoading && (
            <div className="glass-card p-12 text-center animate-fade-in">
              <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          )}

          {/* Dashboard */}
          {user && !userLoading && (
            <div className="space-y-6">
              {/* Profile card */}
              <ProfileCard user={user} />

              {/* Stats grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    Top Repositories
                  </h3>
                  <RepoList repos={repos || []} />
                </div>

                <div className="space-y-6">
                  <RepoStats repos={repos || []} />
                  <LanguageChart stats={languageStats} />
                  <ActivityFeed events={events || []} />
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!searchedUsername && !userLoading && (
            <div className="glass-card p-12 text-center animate-fade-in mt-8">
              <Github className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">
                Enter a GitHub username above to explore their profile
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {['torvalds', 'gaearon', 'sindresorhus', 'tj'].map((name) => (
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

      {/* Bottom pill navigation */}
      <BottomPill
        isAuthenticated={isAuthenticated}
        onLogin={handleLogin}
        onLogout={handleLogout}
        username={user?.login}
      />
    </div>
  );
};

export default Index;
