import { Github, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BottomPillProps {
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
  username?: string;
}

export function BottomPill({ isAuthenticated, onLogin, onLogout, username }: BottomPillProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="glass-pill px-2 py-2 flex items-center gap-2 shadow-lg shadow-background/50">
        <div className="flex items-center gap-2 px-3">
          <Github className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm hidden sm:inline">GitProfile</span>
        </div>
        
        <div className="w-px h-6 bg-border/50" />
        
        {isAuthenticated ? (
          <>
            <div className="flex items-center gap-2 px-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{username}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground">
              Logout
            </Button>
          </>
        ) : (
          <Button variant="glass" size="sm" onClick={onLogin} className="gap-2">
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Login with GitHub</span>
            <span className="sm:hidden">Login</span>
          </Button>
        )}
      </div>
    </div>
  );
}
