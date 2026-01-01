import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface UsernameSearchProps {
  onSearch: (username: string) => void;
  isLoading?: boolean;
}

export function UsernameSearch({ onSearch, isLoading }: UsernameSearchProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSearch(username.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 w-full max-w-md mx-auto">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Enter GitHub username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="pl-10"
          disabled={isLoading}
        />
      </div>
      <Button type="submit" variant="gradient" disabled={isLoading || !username.trim()}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Loading
          </span>
        ) : (
          'Search'
        )}
      </Button>
    </form>
  );
}
