'use client';

import { useMemo, useEffect, useCallback } from 'react';
import { useGraphInteraction } from './useGraphInteraction';
import { CytoscapeGraph } from './CytoscapeGraph';
import { GraphDetailPanel } from './GraphDetailPanel';
import { GraphCommandBar } from './GraphCommandBar';
import { buildStylesheet, NODE_TYPE_CONFIG } from './graphStyles';
import { LAYOUT_PRESETS } from './graphLayouts';
import type { GraphNode, GraphEdge } from '@/types';
import type { SelectedNodeInfo } from './useGraphInteraction';

interface KnowledgeGraphViewerProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function KnowledgeGraphViewer({ nodes, edges }: KnowledgeGraphViewerProps) {
  const interaction = useGraphInteraction();
  const darkMode = typeof window !== 'undefined'
    ? matchMedia('(prefers-color-scheme: dark)').matches
    : false;

  const stylesheet = useMemo(() => buildStylesheet(darkMode), [darkMode]);

  // Apply type filters
  const visibleNodes = useMemo(() => {
    if (interaction.activeTypeFilters.size === 0) return nodes;
    return nodes.filter(n => {
      const type = n.labels?.[0] ?? '';
      return interaction.activeTypeFilters.has(type);
    });
  }, [nodes, interaction.activeTypeFilters]);

  const visibleNodeIds = useMemo(
    () => new Set(visibleNodes.map(n => String(n.id))),
    [visibleNodes]
  );

  const visibleEdges = useMemo(() => {
    if (interaction.activeTypeFilters.size === 0) return edges;
    return edges.filter(e =>
      visibleNodeIds.has(String(e.start)) && visibleNodeIds.has(String(e.end))
    );
  }, [edges, interaction.activeTypeFilters, visibleNodeIds]);

  // Search effect
  useEffect(() => {
    interaction.applySearchHighlight(interaction.searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interaction.searchQuery]);

  // Layout effect
  useEffect(() => {
    const cy = interaction.cyRef.current;
    if (!cy) return;
    cy.layout(LAYOUT_PRESETS[interaction.activeLayout] as any).run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interaction.activeLayout]);

  const handleBackgroundTap = useCallback(() => {
    interaction.selectNode(null);
    interaction.resetHighlight();
  }, [interaction]);

  const handleNodeSelect = useCallback((info: SelectedNodeInfo | null) => {
    interaction.selectNode(info);
    if (info) interaction.highlightNeighborhood(info.cytoscapeId);
  }, [interaction]);

  const handleFitGraph = useCallback(() => {
    const cy = interaction.cyRef.current;
    if (cy) cy.animate({ fit: { eles: cy.elements(), padding: 48 }, duration: 400 } as any);
  }, [interaction]);

  // Derive available node types for filter UI
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    nodes.forEach(n => { if (n.labels?.[0]) types.add(n.labels[0]); });
    return Array.from(types);
  }, [nodes]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>
      <GraphCommandBar
        searchQuery={interaction.searchQuery}
        onSearchChange={interaction.setSearchQuery}
        activeLayout={interaction.activeLayout}
        onLayoutChange={interaction.setActiveLayout}
        activeTypeFilters={interaction.activeTypeFilters}
        onToggleTypeFilter={interaction.toggleTypeFilter}
        onClearFilters={interaction.clearTypeFilters}
        onFitGraph={handleFitGraph}
        nodeCount={visibleNodes.length}
        edgeCount={visibleEdges.length}
      />
      <div style={{ position: 'relative', flex: 1, minHeight: 400 }}>
        <CytoscapeGraph
          nodes={visibleNodes}
          edges={visibleEdges}
          layoutPreset={interaction.activeLayout}
          styleSheet={stylesheet}
          cyRef={interaction.cyRef}
          onNodeSelect={handleNodeSelect}
          onBackgroundTap={handleBackgroundTap}
          height="100%"
        />
        <GraphDetailPanel
          node={interaction.selectedNode}
          onClose={() => {
            interaction.selectNode(null);
            interaction.resetHighlight();
          }}
        />
      </div>
      {/* Legend row */}
      <div style={{
        display: 'flex', gap: 12, padding: '8px 12px', flexWrap: 'wrap',
        borderTop: '1px solid hsl(var(--border))',
        fontSize: 11, color: 'hsl(var(--muted-foreground))',
        background: 'hsl(var(--card))',
        borderRadius: '0 0 12px 12px',
      }}>
        {availableTypes.map(type => {
          const cfg = NODE_TYPE_CONFIG[type as keyof typeof NODE_TYPE_CONFIG] ?? NODE_TYPE_CONFIG.default;
          return (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: darkMode ? cfg.darkColor : cfg.color,
                flexShrink: 0,
              }} />
              {type}
            </div>
          );
        })}
        <span style={{ marginLeft: 'auto' }}>
          {visibleNodes.length} nodes · {visibleEdges.length} edges
        </span>
      </div>
    </div>
  );
}
