import dagre from 'dagre';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';
import { Node, Edge } from 'reactflow';

export type LayoutDirection = 'LR' | 'TB' | 'RL' | 'BT';

export interface LayoutOptions {
    direction?: LayoutDirection;
    nodeWidth?: number;
    nodeHeight?: number;
    rankSep?: number;
    nodeSep?: number;
}

/**
 * Calculate tree layout using dagre algorithm
 * @param nodes - ReactFlow nodes
 * @param edges - ReactFlow edges
 * @param options - Layout configuration options
 * @returns Nodes with updated positions
 */
export function getTreeLayout(
    nodes: Node[],
    edges: Edge[],
    options: LayoutOptions = {}
): Node[] {
    const {
        direction = 'LR',
        nodeWidth = 180,
        nodeHeight = 80,
        rankSep = 150,
        nodeSep = 100,
    } = options;

    // Create a new directed graph
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // Configure the graph
    dagreGraph.setGraph({
        rankdir: direction,
        ranksep: rankSep,
        nodesep: nodeSep,
    });

    // Add nodes to the graph
    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    // Add edges to the graph
    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    // Calculate the layout
    dagre.layout(dagreGraph);

    // Update node positions
    return nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });
}

/**
 * Calculate circular layout
 * @param nodes - ReactFlow nodes
 * @param radius - Optional radius for the circle
 * @returns Nodes with updated positions
 */
export function getCircularLayout(nodes: Node[], radius?: number): Node[] {
    const calculatedRadius = radius || Math.max(200, nodes.length * 30);
    const centerX = 400;
    const centerY = 300;

    return nodes.map((node, index) => {
        const angle = (2 * Math.PI * index) / nodes.length;
        return {
            ...node,
            position: {
                x: centerX + calculatedRadius * Math.cos(angle),
                y: centerY + calculatedRadius * Math.sin(angle),
            },
        };
    });
}

/**
 * Calculate grid layout
 * @param nodes - ReactFlow nodes
 * @param columns - Number of columns (default: 5)
 * @returns Nodes with updated positions
 */
export function getGridLayout(nodes: Node[], columns: number = 5): Node[] {
    return nodes.map((node, index) => ({
        ...node,
        position: {
            x: (index % columns) * 250,
            y: Math.floor(index / columns) * 150,
        },
    }));
}

/**
 * Calculate force-directed layout using d3-force
 * @param nodes - ReactFlow nodes
 * @param edges - ReactFlow edges
 * @param iterations - Number of simulation iterations (default: 300)
 * @returns Nodes with updated positions
 */
export function getForceLayout(nodes: Node[], edges: Edge[], iterations: number = 300): Node[] {
    // Create a copy of nodes with x, y properties for d3-force
    const simulationNodes = nodes.map((node) => ({
        id: node.id,
        x: node.position.x,
        y: node.position.y,
    }));

    // Create links from edges
    const simulationLinks = edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
    }));

    // Create and run the simulation
    const simulation = forceSimulation(simulationNodes)
        .force('link', forceLink(simulationLinks).id((d: any) => d.id).distance(150))
        .force('charge', forceManyBody().strength(-1000))
        .force('center', forceCenter(400, 300))
        .force('collide', forceCollide(80))
        .stop();

    // Run simulation synchronously
    for (let i = 0; i < iterations; i++) {
        simulation.tick();
    }

    // Update node positions
    return nodes.map((node) => {
        const simNode = simulationNodes.find((n) => n.id === node.id);
        return {
            ...node,
            position: {
                x: simNode?.x || node.position.x,
                y: simNode?.y || node.position.y,
            },
        };
    });
}

/**
 * Calculate radial layout (nodes arranged in concentric circles)
 * @param nodes - ReactFlow nodes
 * @param edges - ReactFlow edges
 * @returns Nodes with updated positions
 */
export function getRadialLayout(nodes: Node[], edges: Edge[]): Node[] {
    // Find root nodes (nodes with no incoming edges)
    const targetIds = new Set(edges.map((e) => e.target));
    const rootNodes = nodes.filter((node) => !targetIds.has(node.id));

    // If no root found, use first node
    if (rootNodes.length === 0) {
        rootNodes.push(nodes[0]);
    }

    // Build adjacency list
    const adjacency = new Map<string, string[]>();
    edges.forEach((edge) => {
        if (!adjacency.has(edge.source)) {
            adjacency.set(edge.source, []);
        }
        adjacency.get(edge.source)!.push(edge.target);
    });

    // BFS to assign levels
    const levels = new Map<string, number>();
    const queue: { id: string; level: number }[] = rootNodes.map((node) => ({ id: node.id, level: 0 }));
    const visited = new Set<string>();

    while (queue.length > 0) {
        const { id, level } = queue.shift()!;
        if (visited.has(id)) continue;
        visited.add(id);
        levels.set(id, level);

        const children = adjacency.get(id) || [];
        children.forEach((childId) => {
            if (!visited.has(childId)) {
                queue.push({ id: childId, level: level + 1 });
            }
        });
    }

    // Assign unvisited nodes to level 0
    nodes.forEach((node) => {
        if (!levels.has(node.id)) {
            levels.set(node.id, 0);
        }
    });

    // Group nodes by level
    const nodesByLevel = new Map<number, Node[]>();
    nodes.forEach((node) => {
        const level = levels.get(node.id) || 0;
        if (!nodesByLevel.has(level)) {
            nodesByLevel.set(level, []);
        }
        nodesByLevel.get(level)!.push(node);
    });

    // Position nodes in concentric circles
    const centerX = 400;
    const centerY = 300;
    const radiusStep = 150;

    return nodes.map((node) => {
        const level = levels.get(node.id) || 0;
        const nodesInLevel = nodesByLevel.get(level) || [];
        const indexInLevel = nodesInLevel.indexOf(node);
        const totalInLevel = nodesInLevel.length;

        if (level === 0 && totalInLevel === 1) {
            // Center node
            return {
                ...node,
                position: { x: centerX, y: centerY },
            };
        }

        const radius = (level + 1) * radiusStep;
        const angle = (2 * Math.PI * indexInLevel) / totalInLevel;

        return {
            ...node,
            position: {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
            },
        };
    });
}

