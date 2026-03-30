// Cytoscape stylesheet types use any[] due to @types/cytoscape export constraints

// Entity type → visual encoding
export const NODE_TYPE_CONFIG = {
  Person:     { color: '#5b8ef7', darkColor: '#7aaaf9', shape: 'ellipse'          as const },
  Task:       { color: '#2ea87a', darkColor: '#3dc98e', shape: 'roundrectangle'   as const },
  Decision:   { color: '#e09c2a', darkColor: '#f0b040', shape: 'diamond'          as const },
  Topic:      { color: '#9b72e8', darkColor: '#b08ef0', shape: 'hexagon'          as const },
  Question:   { color: '#e05c5c', darkColor: '#f07070', shape: 'ellipse'          as const },
  ActionItem: { color: '#3aaccc', darkColor: '#50c4e4', shape: 'roundrectangle'   as const },
  default:    { color: '#888780', darkColor: '#aaa89e', shape: 'ellipse'          as const },
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
  const edgeLine  = darkMode ? '#4a4a46' : '#c8c7c0';
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
        'border-color': '#e09c2a',
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
        'opacity': 0.7,
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
