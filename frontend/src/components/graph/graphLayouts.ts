import type { LayoutOptions } from 'cytoscape';

export type LayoutPreset =
  | 'overview' // cose — best for seeing all nodes, default
  | 'hierarchy' // breadthfirst — directed, top-down
  | 'concentric' // concentric — high-degree nodes at center
  | 'circle' // circle — equal spacing
  | 'grid'; // grid — structured rows

export const LAYOUT_PRESETS: Record<LayoutPreset, LayoutOptions> = {
  overview: {
    name: 'cose',
    animate: true,
    animationDuration: 500,
    nodeRepulsion: () => 8000,
    idealEdgeLength: () => 100,
    edgeElasticity: () => 0.45,
    gravity: 0.25,
    numIter: 1000,
    randomize: false,
    padding: 48,
  } as any,
  hierarchy: {
    name: 'breadthfirst',
    animate: true,
    animationDuration: 500,
    directed: true,
    spacingFactor: 1.6,
    padding: 48,
  } as any,
  concentric: {
    name: 'concentric',
    animate: true,
    animationDuration: 500,
    minNodeSpacing: 50,
    padding: 48,
    concentric: (node: any) => node.degree(),
    levelWidth: () => 2,
  } as any,
  circle: {
    name: 'circle',
    animate: true,
    animationDuration: 500,
    spacingFactor: 1.3,
    padding: 48,
  } as any,
  grid: {
    name: 'grid',
    animate: true,
    animationDuration: 500,
    rows: undefined,
    padding: 48,
    spacingFactor: 1.2,
  } as any,
};

export const LAYOUT_LABELS: Record<LayoutPreset, string> = {
  overview: 'Auto layout',
  hierarchy: 'Hierarchy',
  concentric: 'Concentric',
  circle: 'Circle',
  grid: 'Grid',
};
