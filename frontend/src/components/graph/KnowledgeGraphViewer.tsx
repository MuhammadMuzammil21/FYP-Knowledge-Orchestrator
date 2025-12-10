'use client';

import { useCallback, useMemo } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    BackgroundVariant,
    useNodesState,
    useEdgesState,
    MiniMap,
    Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { GraphNode, GraphEdge } from '@/types';
import { Badge } from '@/components/ui/badge';

interface KnowledgeGraphViewerProps {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

// Node type colors
const NODE_COLORS = {
    person: '#3b82f6', // blue
    task: '#10b981', // green
    decision: '#f59e0b', // amber
    topic: '#8b5cf6', // purple
    action_item: '#ef4444', // red
    question: '#ec4899', // pink
    default: '#6b7280', // gray
};

/**
 * Extract display name from node properties based on node type
 * Tries common property keys and falls back to node type label
 */
function getNodeDisplayName(node: GraphNode): string {
    const props = node.properties || {};

    // Priority order for property keys
    const propertyKeys = [
        'name',           // Person, Topic
        'title',          // General
        'task',           // Task, Action Item
        'description',    // General fallback
        'statement',      // Decision
        'question',       // Question
        'content',        // General content
    ];

    // Try each property key
    for (const key of propertyKeys) {
        if (props[key] && typeof props[key] === 'string' && props[key].trim()) {
            return props[key].trim();
        }
    }

    // Fallback: use first non-empty string property
    const firstStringProp = Object.values(props).find(
        val => typeof val === 'string' && val.trim()
    );
    if (firstStringProp) {
        return String(firstStringProp).trim();
    }

    // Last resort: use the node type label
    return node.labels?.[0] || `Node ${node.id}`;
}

export function KnowledgeGraphViewer({ nodes: graphNodes, edges: graphEdges }: KnowledgeGraphViewerProps) {
    // Transform graph nodes to React Flow nodes
    const initialNodes: Node[] = useMemo(
        () =>
            (graphNodes || []).map((node, index) => {
                // Get display name from properties
                const displayName = getNodeDisplayName(node);

                // Get node type for styling
                const nodeType = node.labels && node.labels.length > 0
                    ? node.labels[0].toLowerCase()
                    : 'default';

                return {
                    id: String(node.id),
                    type: 'default',
                    position: {
                        x: (index % 5) * 250,
                        y: Math.floor(index / 5) * 150,
                    },
                    data: {
                        label: (
                            <div className="flex flex-col items-center gap-1 p-2">
                                {/* Main display name */}
                                <div
                                    className="font-semibold text-sm text-foreground text-center max-w-[140px] truncate"
                                    title={displayName}
                                >
                                    {displayName}
                                </div>
                                {/* Node type badge */}
                                <Badge
                                    variant="outline"
                                    className="text-xs"
                                    style={{
                                        borderColor: NODE_COLORS[nodeType as keyof typeof NODE_COLORS] || NODE_COLORS.default,
                                        color: NODE_COLORS[nodeType as keyof typeof NODE_COLORS] || NODE_COLORS.default,
                                    }}
                                >
                                    {nodeType.replace(/_/g, ' ')}
                                </Badge>
                            </div>
                        ),
                    },
                    style: {
                        background: 'hsl(var(--card))',
                        border: `2px solid ${NODE_COLORS[nodeType as keyof typeof NODE_COLORS] || NODE_COLORS.default}`,
                        borderRadius: '8px',
                        padding: '4px',
                        minWidth: '150px',
                        color: 'hsl(var(--foreground))',
                    },
                };
            }),
        [graphNodes]
    );

    // Transform graph edges to React Flow edges
    const initialEdges: Edge[] = useMemo(
        () =>
            (graphEdges || []).map((edge, index) => ({
                id: `edge-${index}`,
                source: String(edge.start),
                target: String(edge.end),
                label: edge.type,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#94a3b8' },
                labelStyle: { fill: '#64748b', fontSize: 12 },
                labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
            })),
        [graphEdges]
    );

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Auto-layout using simple force-directed approach
    const onLayout = useCallback(() => {
        const layoutedNodes = nodes.map((node, index) => {
            // Simple circular layout
            const angle = (2 * Math.PI * index) / nodes.length;
            const radius = Math.max(200, nodes.length * 30);
            return {
                ...node,
                position: {
                    x: 400 + radius * Math.cos(angle),
                    y: 300 + radius * Math.sin(angle),
                },
            };
        });
        setNodes(layoutedNodes);
    }, [nodes, setNodes]);

    if (!graphNodes || graphNodes.length === 0) {
        return (
            <div className="flex h-full items-center justify-center rounded-lg border bg-muted">
                <p className="text-muted-foreground">No graph data available</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full rounded-lg border">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                attributionPosition="bottom-left"
            >
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                <Controls />
                <MiniMap
                    nodeColor={(node) => {
                        const graphNode = (graphNodes || []).find((n) => String(n.id) === node.id);
                        const nodeType = graphNode?.labels && graphNode.labels.length > 0 ? graphNode.labels[0].toLowerCase() : 'default';
                        return NODE_COLORS[nodeType as keyof typeof NODE_COLORS] || NODE_COLORS.default;
                    }}
                    maskColor="rgba(0, 0, 0, 0.1)"
                />
                <Panel position="top-right">
                    <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
                        <div className="mb-2 text-sm font-semibold text-foreground">Legend</div>
                        <div className="space-y-1 text-xs text-foreground">
                            {Object.entries(NODE_COLORS)
                                .filter(([key]) => key !== 'default')
                                .map(([type, color]) => (
                                    <div key={type} className="flex items-center gap-2">
                                        <div
                                            className="h-3 w-3 rounded-full"
                                            style={{ backgroundColor: color }}
                                        />
                                        <span>{type.replace(/_/g, ' ')}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </Panel>
                <Panel position="top-left">
                    <button
                        onClick={onLayout}
                        className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm hover:bg-muted"
                    >
                        Auto Layout
                    </button>
                </Panel>
            </ReactFlow>
        </div>
    );
}
