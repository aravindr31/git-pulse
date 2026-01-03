export interface GitHubUser {
  login: string;
  id: number;
  avatarUrl: string;
  htmlUrl: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  twitterUsername: string | null;
  repositories: {
    totalCount: number;
  };
  publicGists: {
    totalCount: number;
  };
  followers: {
    totalCount: number;
  };
  following: {
    totalCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  url: string;
  description: string | null;
  fork: boolean;
  stargazerCount: number;
  watchers: {
    totalCount: number
  };
  forkCount: number;
  primaryLanguage: {
    name: string;
  } | null;
  repositoryTopics?: {
    nodes: {
      topic: {
        name: string;
      };
    }[];
  };
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  size: number;
  defaultBranch: string;
  openIssues: {
    totalCount: number;
  };
  visibility: string;
}

export interface GitHubEvent {
  id: string;
  type: string;
  actor: {
    login: string;
    avatar_url: string;
  };
  repo: {
    name: string;
  };
  payload: Record<string, unknown>;
  created_at: string;
}

export interface LanguageStats {
  [key: string]: number;
}

export type RankGrade = 
  | 'S' 
  | 'A+++' | 'A++' | 'A+' | 'A' 
  | 'B+++' | 'B++' | 'B+' | 'B' 
  | 'C+++' | 'C++' | 'C+' | 'C' | 'D';

export interface RankResult {
  grade: RankGrade;
  percentile: number;
  score: number;
  breakdown: {
    stars: number;
    commits: number;
    prs: number;
    issues: number;
  };
}