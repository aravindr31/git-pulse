import { Github, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useRef, useEffect } from 'react';

interface BottomPillProps {
  username?: string;
  onSearch: (username: string) => void;
  hasResults: boolean;
}

export function BottomPill({ username, onSearch, hasResults }: BottomPillProps) {
  const [searchValue, setSearchValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearch(searchValue.trim());
      setSearchValue('');
      setIsExpanded(false);
    }
  };

  const handleClear = () => {
    setSearchValue('');
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="glass-pill px-3 py-2 flex items-center gap-2 shadow-lg shadow-background/50">
        <div className="flex items-center gap-2 px-2">
          <Github className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm hidden sm:inline">GitProfile</span>
        </div>
        
        {hasResults && (
          <>
            <div className="w-px h-5 bg-border/50" />
            
            {username && !isExpanded && (
              <span className="text-sm text-muted-foreground font-mono px-2">@{username}</span>
            )}
            
            {isExpanded ? (
              <form onSubmit={handleSubmit} className="flex items-center">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search user..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="h-7 w-32 text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
                />
                <button 
                  type="button" 
                  onClick={handleClear}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsExpanded(true)}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary/50"
              >
                <Search className="h-4 w-4" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
