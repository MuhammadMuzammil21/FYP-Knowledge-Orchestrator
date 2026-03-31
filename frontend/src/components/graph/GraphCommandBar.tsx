'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Maximize2 } from 'lucide-react';
import type { LayoutPreset } from './graphLayouts';
import { LAYOUT_LABELS } from './graphLayouts';
import { NODE_TYPE_CONFIG } from './graphStyles';

interface GraphCommandBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeLayout: LayoutPreset;
  onLayoutChange: (preset: LayoutPreset) => void;
  activeTypeFilters: Set<string>;
  onToggleTypeFilter: (type: string) => void;
  onClearFilters: () => void;
  onFitGraph: () => void;
  nodeCount: number;
  edgeCount: number;
}

const ALL_LAYOUTS: LayoutPreset[] = ['overview', 'hierarchy', 'concentric', 'circle', 'grid'];

export function GraphCommandBar({
  searchQuery,
  onSearchChange,
  activeLayout,
  onLayoutChange,
  activeTypeFilters,
  onToggleTypeFilter,
  onClearFilters,
  onFitGraph,
  nodeCount,
  edgeCount,
}: GraphCommandBarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchInput = useCallback((value: string) => {
    setLocalSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange(value);
    }, 200);
  }, [onSearchChange]);

  // Sync external changes
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const darkMode = typeof window !== 'undefined'
    ? matchMedia('(prefers-color-scheme: dark)').matches
    : false;

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
      padding: '8px 12px',
      borderBottom: '1px solid hsl(var(--border))',
      background: 'hsl(var(--card))',
      borderRadius: '12px 12px 0 0',
    }}>
      {/* Search */}
      <div style={{ position: 'relative', minWidth: 180, maxWidth: 240, flex: '1 1 180px' }}>
        <Search
          size={14}
          style={{
            position: 'absolute',
            left: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'hsl(var(--muted-foreground))',
            pointerEvents: 'none',
          }}
        />
        <Input
          value={localSearch}
          onChange={(e) => handleSearchInput(e.target.value)}
          placeholder="Search nodes…"
          style={{ paddingLeft: 28, height: 32, fontSize: 13 }}
        />
      </div>

      {/* Layout presets - Desktop */}
      <div className="hidden sm:flex" style={{ gap: 3 }}>
        {ALL_LAYOUTS.map((preset) => (
          <Button
            key={preset}
            variant={activeLayout === preset ? 'default' : 'outline'}
            size="sm"
            onClick={() => onLayoutChange(preset)}
            style={{ fontSize: 11, height: 28, padding: '0 8px' }}
          >
            {LAYOUT_LABELS[preset]}
          </Button>
        ))}
      </div>

      {/* Layout presets - Mobile */}
      <div className="flex sm:hidden w-full order-3 mt-2">
        <Select value={activeLayout} onValueChange={(val: any) => onLayoutChange(val)}>
          <SelectTrigger className="h-[28px] text-[11px] w-full bg-background">
            <SelectValue placeholder="Layout presets" />
          </SelectTrigger>
          <SelectContent>
            {ALL_LAYOUTS.map(preset => (
              <SelectItem key={preset} value={preset} className="text-[11px]">{LAYOUT_LABELS[preset]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fit button */}
      <Button
        variant="outline"
        size="icon-sm"
        onClick={onFitGraph}
        title="Fit graph to view"
        style={{ width: 28, height: 28 }}
      >
        <Maximize2 size={14} />
      </Button>

      {/* Counts */}
      <span style={{
        marginLeft: 'auto',
        fontSize: 11,
        color: 'hsl(var(--muted-foreground))',
        whiteSpace: 'nowrap',
      }}>
        {nodeCount} nodes · {edgeCount} edges
      </span>
    </div>
  );
}
