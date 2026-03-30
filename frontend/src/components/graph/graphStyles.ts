// Cytoscape stylesheet types use any[] due to @types/cytoscape export constraints

// Entity type → visual encoding
export const NODE_TYPE_CONFIG = {
  // High-weight — solid Silver Sage
  Person:     { color: '#c8d5c8', darkColor: '#c8d5c8', shape: 'ellipse'        as const },
  // Medium-weight — 65 % Silver Sage
  Task:       { color: '#9ab89a', darkColor: '#9ab89a', shape: 'roundrectangle' as const },
  // Accent — Soft Gold for high-priority entities
  Decision:   { color: '#c9a96e', darkColor: '#d4b87a', shape: 'diamond'        as const },
  // Low-weight — muted sage
  Topic:      { color: '#7a9e8a', darkColor: '#7a9e8a', shape: 'hexagon'        as const },
  // Ghost — faint silver
  Question:   { color: '#a0b8a0', darkColor: '#a0b8a0', shape: 'ellipse'        as const },
  // Cool muted silver
  ActionItem: { color: '#8aab9e', darkColor: '#8aab9e', shape: 'roundrectangle' as const },
  // Fallback
  default:    { color: '#6b8a78', darkColor: '#7a9a86', shape: 'ellipse'        as const },
} as const;

// Edge relationship → visual encoding
export const EDGE_TYPE_CONFIG = {
  ASSIGNED_TO:    { width: 2,   style: 'solid',  colorKey: 'Task'     },
  DISCUSSED:      { width: 1,   style: 'dashed', colorKey: 'Topic'    },
  DECIDED:        { width: 1.5, style: 'solid',  colorKey: 'Decision' },
  PARTICIPATED_IN:{ width: 1,   style: 'dotted', colorKey: 'Person'   },
  CONFLICTS_WITH: { width: 2.5, style: 'solid',  colorKey: 'Question' },
  default:        { width: 1,   style: 'solid',  colorKey: 'default'  },
} as const;

export function buildStylesheet(darkMode: boolean): any[] {
  const fg        = darkMode ? '#e0dfd8' : '#1a1a18';
  const fgMuted   = darkMode ? '#888780' : '#888780';
  const edgeLine  = darkMode ? 'oklch(0.88 0.05 150 / 0.12)' : 'oklch(0.25 0.03 155 / 0.15)';
  const bgPrimary = darkMode ? '#1a1a18' : '#ffffff';

  const typeStyles: any[] = Object.entries(NODE_TYPE_CONFIG).map(([type, cfg]) => ({
    selector: `node[nodeType="${type}"]`,
    style: {
      'background-color': darkMode ? cfg.darkColor : cfg.color,
      'border-color':     darkMode ? cfg.darkColor : cfg.color,
      'shape': cfg.shape,
    } as any,
  }));

  return [
    {
      selector: 'node',
      style: {
        'width': 52,
        'height': 52,
        'label': 'data(displayName)',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'font-size': 11,
        'color': fg,
        'text-margin-y': 6,
        'text-max-width': 90,
        'text-wrap': 'ellipsis',
        'border-width': 1.5,
        'border-opacity': 0.6,
        'background-opacity': 0.9,
        'text-background-color': bgPrimary,
        'text-background-opacity': 0.7,
        'text-background-padding': '2px',
      } as any,
    },
    ...typeStyles,
    // Selected state
    {
      selector: 'node:selected',
      style: {
        'border-width': 3,
        'border-opacity': 1,
        'overlay-opacity': 0,
      } as any,
    },
    // Dimmed (during neighborhood highlight)
    {
      selector: 'node.dimmed',
      style: { 'opacity': 0.12 } as any,
    },
    // Highlighted (during neighborhood highlight)
    {
      selector: 'node.highlighted',
      style: {
        'opacity': 1,
        'border-width': 2.5,
        'border-opacity': 1,
      } as any,
    },
    // Search match
    {
      selector: 'node.search-match',
      style: {
        'border-color': '#c9a96e',
        'border-width': 3,
        'border-opacity': 1,
        'opacity': 1,
      } as any,
    },
    // Edges base
    {
      selector: 'edge',
      style: {
        'width': 1,
        'line-color': edgeLine,
        'target-arrow-color': edgeLine,
        'target-arrow-shape': 'triangle',
        'arrow-scale': 0.7,
        'curve-style': 'bezier',
        'opacity': 0.55,
      } as any,
    },
    // Edge dimmed
    {
      selector: 'edge.dimmed',
      style: { 'opacity': 0.05 } as any,
    },
    // Edge highlighted
    {
      selector: 'edge.highlighted',
      style: {
        'opacity': 1,
        'width': 2,
        'line-color': fg,
        'target-arrow-color': fg,
      } as any,
    },
    // Specific edge types — use EDGE_TYPE_CONFIG to generate these
    {
      selector: 'edge[edgeType="ASSIGNED_TO"]',
      style: {
        'line-color': NODE_TYPE_CONFIG.Task.color,
        'target-arrow-color': NODE_TYPE_CONFIG.Task.color,
        'width': 2,
      } as any,
    },
    {
      selector: 'edge[edgeType="DISCUSSED"]',
      style: {
        'line-style': 'dashed',
        'line-dash-pattern': [4, 3],
        'line-color': NODE_TYPE_CONFIG.Topic.color,
        'target-arrow-color': NODE_TYPE_CONFIG.Topic.color,
      } as any,
    },
    {
      selector: 'edge[edgeType="CONFLICTS_WITH"]',
      style: {
        'line-color': NODE_TYPE_CONFIG.Question.color,
        'target-arrow-color': NODE_TYPE_CONFIG.Question.color,
        'width': 2.5,
      } as any,
    },
    {
      selector: 'edge[edgeType="DECIDED"]',
      style: {
        'line-color': NODE_TYPE_CONFIG.Decision.color,
        'target-arrow-color': NODE_TYPE_CONFIG.Decision.color,
        'width': 1.5,
      } as any,
    },
  ];
}
