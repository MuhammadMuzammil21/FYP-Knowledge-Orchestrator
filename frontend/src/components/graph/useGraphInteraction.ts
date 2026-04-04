'use client';

import { useState, useCallback, useRef } from 'react';
import type cytoscape from 'cytoscape';
import type { LayoutPreset } from './graphLayouts';
import type { GraphNode } from '@/types';

export interface SelectedNodeInfo {
  cytoscapeId: string; // the string ID used by Cytoscape
  originalNode: GraphNode; // the original API GraphNode
  displayName: string;
  nodeType: string;
  connections: Array<{
    edgeType: string;
    direction: 'in' | 'out';
    targetId: string;
    targetName: string;
  }>;
}

export interface UseGraphInteractionReturn {
  selectedNode: SelectedNodeInfo | null;
  searchQuery: string;
  activeLayout: LayoutPreset;
  activeTypeFilters: Set<string>;
  cyRef: React.MutableRefObject<cytoscape.Core | null>;

  selectNode: (info: SelectedNodeInfo | null) => void;
  setSearchQuery: (q: string) => void;
  setActiveLayout: (preset: LayoutPreset) => void;
  toggleTypeFilter: (type: string) => void;
  clearTypeFilters: () => void;

  // Imperative actions (called by CytoscapeGraph via callbacks)
  highlightNeighborhood: (nodeId: string) => void;
  resetHighlight: () => void;
  applySearchHighlight: (query: string) => void;
}

export function useGraphInteraction(): UseGraphInteractionReturn {
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [selectedNode, setSelectedNode] = useState<SelectedNodeInfo | null>(null);
  const [searchQuery, setSearchQueryState] = useState('');
  const [activeLayout, setActiveLayoutState] = useState<LayoutPreset>('overview');
  const [activeTypeFilters, setActiveTypeFilters] = useState<Set<string>>(new Set());

  const selectNode = useCallback((info: SelectedNodeInfo | null) => {
    setSelectedNode(info);
  }, []);

  const setSearchQuery = useCallback((q: string) => {
    setSearchQueryState(q);
  }, []);

  const setActiveLayout = useCallback((preset: LayoutPreset) => {
    setActiveLayoutState(preset);
  }, []);

  const toggleTypeFilter = useCallback((type: string) => {
    setActiveTypeFilters((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  }, []);

  const clearTypeFilters = useCallback(() => {
    setActiveTypeFilters(new Set());
  }, []);

  const highlightNeighborhood = useCallback((nodeId: string) => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.elements().addClass('dimmed').removeClass('highlighted');
    const node = cy.getElementById(nodeId);
    const neighborhood = node.closedNeighborhood();
    neighborhood.removeClass('dimmed').addClass('highlighted');
  }, []);

  const resetHighlight = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.elements().removeClass('dimmed highlighted search-match');
  }, []);

  const applySearchHighlight = useCallback((query: string) => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.elements().removeClass('dimmed search-match');
    if (!query.trim()) return;
    const q = query.toLowerCase();
    cy.nodes().forEach((node) => {
      const name = (node.data('displayName') || '').toLowerCase();
      const type = (node.data('nodeType') || '').toLowerCase();
      const matches = name.includes(q) || type.includes(q);
      if (matches) {
        node.addClass('search-match');
      } else {
        node.addClass('dimmed');
      }
    });
    const matched = cy.nodes('.search-match');
    if (matched.length > 0) {
      cy.animate({ fit: { eles: matched, padding: 80 }, duration: 400 } as any);
    }
  }, []);

  return {
    selectedNode,
    searchQuery,
    activeLayout,
    activeTypeFilters,
    cyRef,
    selectNode,
    setSearchQuery,
    setActiveLayout,
    toggleTypeFilter,
    clearTypeFilters,
    highlightNeighborhood,
    resetHighlight,
    applySearchHighlight,
  };
}
