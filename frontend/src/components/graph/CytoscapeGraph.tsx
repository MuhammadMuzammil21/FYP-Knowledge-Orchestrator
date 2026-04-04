'use client';

import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
// Stylesheet type accessed via cytoscape namespace below
import type { GraphNode, GraphEdge } from '@/types';
import type { LayoutPreset } from './graphLayouts';
import { LAYOUT_PRESETS } from './graphLayouts';
import type { SelectedNodeInfo } from './useGraphInteraction';

interface CytoscapeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  layoutPreset: LayoutPreset;
  styleSheet: any[];
  cyRef: React.MutableRefObject<cytoscape.Core | null>;
  onNodeSelect: (info: SelectedNodeInfo | null) => void;
  onBackgroundTap: () => void;
  height?: number | string;
}

function getNodeDisplayName(node: GraphNode): string {
  const props = node.properties || {};
  const keys = ['name', 'title', 'task', 'description', 'statement', 'question', 'content'];
  for (const key of keys) {
    if (props[key] && typeof props[key] === 'string' && props[key].trim()) {
      return props[key].trim();
    }
  }
  return node.labels?.[0] || `Node ${node.id}`;
}

function normalizeNodeType(labels: string[]): string {
  const raw = labels?.[0]?.toLowerCase() ?? 'default';
  const map: Record<string, string> = {
    person: 'Person',
    task: 'Task',
    decision: 'Decision',
    topic: 'Topic',
    action_item: 'ActionItem',
    question: 'Question',
    actionitem: 'ActionItem',
  };
  return map[raw] ?? 'default';
}

function buildElements(nodes: GraphNode[], edges: GraphEdge[]) {
  const cyNodes = nodes.map((node) => ({
    data: {
      id: String(node.id),
      displayName: getNodeDisplayName(node),
      nodeType: normalizeNodeType(node.labels),
      originalNode: node,
    },
  }));

  const cyEdges = edges.map((edge, index) => ({
    data: {
      id: `edge-${index}`,
      source: String(edge.start),
      target: String(edge.end),
      edgeType: edge.type,
    },
  }));

  return { nodes: cyNodes, edges: cyEdges };
}

export function CytoscapeGraph({
  nodes,
  edges,
  layoutPreset,
  styleSheet,
  cyRef,
  onNodeSelect,
  onBackgroundTap,
  height = 560,
}: CytoscapeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const prevElementsRef = useRef<string>('');

  // Initialize Cytoscape once
  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    const elements = buildElements(nodes, edges);

    const cy = cytoscape({
      container: containerRef.current,
      elements: [...elements.nodes, ...elements.edges],
      style: styleSheet,
      layout: LAYOUT_PRESETS[layoutPreset] as any,
      minZoom: 0.2,
      maxZoom: 4,
      wheelSensitivity: 0.3,
    });

    cyRef.current = cy;
    initializedRef.current = true;
    prevElementsRef.current = JSON.stringify({
      n: nodes.map((n) => n.id),
      e: edges.map((e, i) => `${e.start}-${e.end}`),
    });

    // Event wiring
    cy.on('tap', 'node', (e) => {
      const node = e.target;
      const data = node.data();
      const connections = node.connectedEdges().map((edge: any) => {
        const isSource = edge.source().id() === node.id();
        const other = isSource ? edge.target() : edge.source();
        return {
          edgeType: edge.data('edgeType'),
          direction: isSource ? ('out' as const) : ('in' as const),
          targetId: other.id(),
          targetName: other.data('displayName'),
        };
      });
      onNodeSelect({
        cytoscapeId: node.id(),
        originalNode: data.originalNode,
        displayName: data.displayName,
        nodeType: data.nodeType,
        connections,
      });
    });

    cy.on('tap', (e) => {
      if (e.target === cy) onBackgroundTap();
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
      initializedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update elements when data changes (after initial mount)
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !initializedRef.current) return;

    const newKey = JSON.stringify({
      n: nodes.map((n) => n.id),
      e: edges.map((e, i) => `${e.start}-${e.end}`),
    });
    if (newKey === prevElementsRef.current) return;
    prevElementsRef.current = newKey;

    const elements = buildElements(nodes, edges);
    cy.json({ elements: [...elements.nodes, ...elements.edges] } as any);
    cy.layout(LAYOUT_PRESETS[layoutPreset] as any).run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  // Re-run layout when layoutPreset changes
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !initializedRef.current) return;
    cy.layout(LAYOUT_PRESETS[layoutPreset] as any).run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutPreset]);

  // Update stylesheet when it changes
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !initializedRef.current) return;
    (cy as any).style(styleSheet);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleSheet]);

  if (nodes.length === 0) {
    return (
      <div
        style={{
          height,
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          border: '0.5px solid var(--color-border-tertiary, hsl(var(--border)))',
        }}
      >
        <p
          style={{
            color: 'var(--color-text-secondary, hsl(var(--muted-foreground)))',
            fontSize: 14,
          }}
        >
          No graph data available
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        height,
        minHeight: 400,
        width: '100%',
        borderRadius: '12px',
        border: '0.5px solid var(--color-border-tertiary, hsl(var(--border)))',
        overflow: 'hidden',
      }}
    />
  );
}
