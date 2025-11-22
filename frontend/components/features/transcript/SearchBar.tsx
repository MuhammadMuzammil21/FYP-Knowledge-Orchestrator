'use client';

import { useState, useCallback } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SearchBarProps {
  onSearch: (query: string) => void;
  resultCount: number;
  currentIndex?: number;
  onNavigate?: (direction: 'prev' | 'next') => void;
}

export function SearchBar({
  onSearch,
  resultCount,
  currentIndex = 0,
  onNavigate,
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      onSearch(value);
    },
    [onSearch]
  );

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  const handlePrevious = () => {
    onNavigate?.('prev');
  };

  const handleNext = () => {
    onNavigate?.('next');
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search transcript..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Results & Navigation */}
        {query && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="whitespace-nowrap">
              {resultCount > 0
                ? `${currentIndex + 1} / ${resultCount}`
                : 'No results'}
            </Badge>

            {resultCount > 0 && (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevious}
                  disabled={resultCount === 0}
                  className="h-8 w-8"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  disabled={resultCount === 0}
                  className="h-8 w-8"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}