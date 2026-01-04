import { useMemo } from 'react';
import { Github, Sparkles, Award } from 'lucide-react';
import { UsernameSearch } from '@/components/UsernameSearch';
import { ProfileCard } from '@/components/ProfileCard';
import { RepoList } from '@/components/RepoList';
import { LanguageChart } from '@/components/LanguageChart';
// import { ActivityFeed } from '@/components/ActivityFeed';
import { RepoStats } from '@/components/RepoStats';
import { BottomPill } from '@/components/BottomPill';
import { UserRank } from '@/components/UserRank';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import { calculateLanguageStats } from '@/lib/github';
import { calculateTrophies } from '@/lib/badges';
import { calculateUserRank } from '@/lib/ranking';
import { useNavigate, useParams } from 'react-router-dom';
import { useGithubData } from '@/hooks/useGithubQueries';

const Index = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  const { data: githubData, isLoading, error } = useGithubData(username)

  const { repos, languageStats, badges, rank } = useMemo(() => {
    if (!githubData) return { repos: [], languageStats: {}, badges: [], rank: null };

    try {
      const repoNodes = githubData.repositories?.nodes || [];
      const stats = calculateLanguageStats(repoNodes);
      
      const trophyList = calculateTrophies(githubData);
      const ranking = calculateUserRank(githubData);

      return { 
        repos: repoNodes, 
        languageStats: stats, 
        badges: trophyList, 
        rank: ranking 
      };
    } catch (err) {
      console.error("Error calculating derived GitHub stats:", err);
      return { repos: [], languageStats: {}, badges: [], rank: null };
    }
  }, [githubData]);

  const handleSearch = (username: string) => {
    navigate(`/${username}`);
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
          
          {!username && (
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm mb-6">
                <Sparkles className="h-4 w-4" />
                GitHub Profile Showcase
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

          {isLoading && (
            <div className="glass-card p-12 text-center">
              <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Fetching GitHub Intelligence...</p>
            </div>
          )}

          {error && (
            <div className="glass-card p-6 text-center border-destructive/20 bg-destructive/5">
              <Github className="h-12 w-12 mx-auto mb-3 text-destructive opacity-50" />
              <p className="text-destructive font-medium">User profile fetch failed</p>
              <p className="text-xs text-muted-foreground mb-4">{(error as Error).message}</p>
              <button onClick={() => navigate('/')} className="text-sm text-primary underline">Try another search</button>
            </div>
          )}

          {githubData && !isLoading && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ProfileCard user={githubData} />
                </div>
                {rank && <UserRank rank={rank} />}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Award className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg">Earned Badges</h3>
                </div>
                <BadgeDisplay trophies={badges} username={githubData.login} />
              </div>

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
                  {/* <ActivityFeed events={events || []} /> */}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <BottomPill
        username={githubData?.login || username}
        onSearch={handleSearch}
        hasResults={!!githubData}
      />
    </div>
  );
};

export default Index;