import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { GraphNode } from '@/types';

export type LayoutType = 'force' | 'tree-lr' | 'tree-tb' | 'radial' | 'circular' | 'grid';

export type NodeTypeFilter = 'person' | 'task' | 'decision' | 'topic' | 'action_item' | 'question';

interface GraphContextType {
    // Selected node
    selectedNode: GraphNode | null;
    setSelectedNode: (node: GraphNode | null) => void;

    // Search
    searchQuery: string;
    setSearchQuery: (query: string) => void;

    // Filters
    activeFilters: Set<NodeTypeFilter>;
    toggleFilter: (filter: NodeTypeFilter) => void;
    clearFilters: () => void;

    // Layout
    layoutType: LayoutType;
    setLayoutType: (layout: LayoutType) => void;

    // View options
    showLabels: boolean;
    setShowLabels: (show: boolean) => void;
    showMinimap: boolean;
    setShowMinimap: (show: boolean) => void;
    showEdgeLabels: boolean;
    setShowEdgeLabels: (show: boolean) => void;

    // Highlighted nodes (for hover effects)
    highlightedNodes: Set<string>;
    setHighlightedNodes: (nodes: Set<string>) => void;
}

const GraphContext = createContext<GraphContextType | undefined>(undefined);

export function GraphProvider({ children }: { children: ReactNode }) {
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<Set<NodeTypeFilter>>(new Set());
    const [layoutType, setLayoutType] = useState<LayoutType>('force');
    const [showLabels, setShowLabels] = useState(true);
    const [showMinimap, setShowMinimap] = useState(true);
    const [showEdgeLabels, setShowEdgeLabels] = useState(false);
    const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());

    const toggleFilter = (filter: NodeTypeFilter) => {
        setActiveFilters((prev) => {
            const newFilters = new Set(prev);
            if (newFilters.has(filter)) {
                newFilters.delete(filter);
            } else {
                newFilters.add(filter);
            }
            return newFilters;
        });
    };

    const clearFilters = () => {
        setActiveFilters(new Set());
    };

    return (
        <GraphContext.Provider
            value={{
                selectedNode,
                setSelectedNode,
                searchQuery,
                setSearchQuery,
                activeFilters,
                toggleFilter,
                clearFilters,
                layoutType,
                setLayoutType,
                showLabels,
                setShowLabels,
                showMinimap,
                setShowMinimap,
                showEdgeLabels,
                setShowEdgeLabels,
                highlightedNodes,
                setHighlightedNodes,
            }}
        >
            {children}
        </GraphContext.Provider>
    );
}

export function useGraph() {
    const context = useContext(GraphContext);
    if (context === undefined) {
        throw new Error('useGraph must be used within a GraphProvider');
    }
    return context;
}
