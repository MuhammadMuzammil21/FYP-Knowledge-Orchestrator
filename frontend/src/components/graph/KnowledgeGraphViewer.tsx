'use client';

import { useCallback, useMemo, useEffect, useState } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    BackgroundVariant,
    useNodesState,
    useEdgesState,
    useReactFlow,
    NodeMouseHandler,
    ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { GraphNode, GraphEdge } from '@/types';
import { Badge } from '@/components/ui/badge';
import { FaUser, FaTasks, FaLightbulb, FaQuestion, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { Menu, X } from 'lucide-react';
import { GraphProvider, useGraph } from './GraphContext';
import { GraphSearchPanel } from './GraphSearchPanel';
import { GraphDetailsPanel } from './GraphDetailsPanel';
import { GraphToolbar } from './GraphToolbar';
import {
    getTreeLayout,
    getCircularLayout,
    getGridLayout,
    getForceLayout,
    getRadialLayout,
} from '@/lib/utils/graphLayout';

interface KnowledgeGraphViewerProps {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

// Node type colors and icons
const NODE_COLORS: Record<string, string> = {
    person: '#3b82f6',
    task: '#10b981',
    decision: '#f59e0b',
    topic: '#8b5cf6',
    action_item: '#ef4444',
    question: '#ec4899',
    default: '#6b7280',
};

const NODE_TYPE_ICONS: Record<string, React.ReactNode> = {
    person: <FaUser className="h-3 w-3" />,
    task: <FaTasks className="h-3 w-3" />,
    decision: <FaExclamationTriangle className="h-3 w-3" />,
    topic: <FaLightbulb className="h-3 w-3" />,
    action_item: <FaCheckCircle className="h-3 w-3" />,
    question: <FaQuestion className="h-3 w-3" />,
};

/**
 * Extract display name from node properties
 */
function getNodeDisplayName(node: GraphNode): string {
    const props = node.properties || {};
    const propertyKeys = ['name', 'title', 'task', 'description', 'statement', 'question', 'content'];

    for (const key of propertyKeys) {
        if (props[key] && typeof props[key] === 'string' && props[key].trim()) {
            return props[key].trim();
        }
    }

    return node.labels?.[0] || `Node ${node.id}`;
}

function KnowledgeGraphViewerContent({ nodes: graphNodes, edges: graphEdges }: KnowledgeGraphViewerProps) {
    const {
        selectedNode,
        setSelectedNode,
        searchQuery,
        activeFilters,
        layoutType,
        showLabels,
        showEdgeLabels,
        highlightedNodes,
        setHighlightedNodes,
    } = useGraph();

    const { zoomIn, zoomOut, fitView } = useReactFlow();

    // Mobile responsive state
    const [showSearchPanel, setShowSearchPanel] = useState(false);
    const [showDetailsPanel, setShowDetailsPanel] = useState(false);

    // Auto-show details panel when node is selected on desktop
    useEffect(() => {
        if (selectedNode && window.innerWidth >= 1024) {
            setShowDetailsPanel(true);
        }
    }, [selectedNode]);

    // Transform graph nodes to React Flow nodes
    const initialNodes: Node[] = useMemo(
        () =>
            (graphNodes || []).map((node, index) => {
                const displayName = getNodeDisplayName(node);
                const nodeType = node.labels && node.labels.length > 0 ? node.labels[0].toLowerCase() : 'default';
                const nodeColor = NODE_COLORS[nodeType] || NODE_COLORS.default;
                const nodeIcon = NODE_TYPE_ICONS[nodeType];

                return {
                    id: String(node.id),
                    type: 'default',
                    position: {
                        x: (index % 5) * 250,
                        y: Math.floor(index / 5) * 150,
                    },
                    data: {
                        label: showLabels ? (
                            <div className="flex flex-col items-center gap-1 p-2">
                                <div className="flex items-center gap-1.5">
                                    <div
                                        className="flex h-5 w-5 items-center justify-center rounded"
                                        style={{ backgroundColor: nodeColor + '20', color: nodeColor }}
                                    >
                                        {nodeIcon}
                                    </div>
                                    <div
                                        className="max-w-[120px] truncate text-sm font-semibold text-foreground"
                                        title={displayName}
                                    >
                                        {displayName}
                                    </div>
                                </div>
                                <Badge
                                    variant="outline"
                                    className="text-xs"
                                    style={{ borderColor: nodeColor, color: nodeColor }}
                                >
                                    {nodeType.replace(/_/g, ' ')}
                                </Badge>
                            </div>
                        ) : (
                            <div
                                className="flex h-8 w-8 items-center justify-center rounded-full"
                                style={{ backgroundColor: nodeColor, color: 'white' }}
                            >
                                {nodeIcon}
                            </div>
                        ),
                        graphNode: node,
                    },
                    style: {
                        background: 'hsl(var(--card))',
                        border: `2px solid ${nodeColor}`,
                        borderRadius: '8px',
                        padding: showLabels ? '4px' : '0',
                        minWidth: showLabels ? '150px' : '32px',
                        color: 'hsl(var(--foreground))',
                        opacity:
                            highlightedNodes.size > 0 && !highlightedNodes.has(String(node.id)) ? 0.3 : 1,
                        transition: 'opacity 0.2s',
                    },
                };
            }),
        [graphNodes, showLabels, highlightedNodes]
    );

    // Transform graph edges to React Flow edges
    const initialEdges: Edge[] = useMemo(
        () =>
            (graphEdges || []).map((edge, index) => ({
                id: `edge-${index}`,
                source: String(edge.start),
                target: String(edge.end),
                label: showEdgeLabels ? edge.type : undefined,
                type: 'smoothstep',
                animated: highlightedNodes.size > 0 && highlightedNodes.has(String(edge.start)) && highlightedNodes.has(String(edge.end)),
                style: {
                    stroke: '#94a3b8',
                    strokeWidth: 2,
                    opacity:
                        highlightedNodes.size > 0 &&
                            (!highlightedNodes.has(String(edge.start)) || !highlightedNodes.has(String(edge.end)))
                            ? 0.2
                            : 1,
                    transition: 'opacity 0.2s',
                },
                labelStyle: { fill: '#64748b', fontSize: 12 },
                labelBgStyle: { fill: 'hsl(var(--card))', fillOpacity: 0.9 },
            })),
        [graphEdges, showEdgeLabels, highlightedNodes]
    );

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Apply layout when layout type changes
    useEffect(() => {
        if (nodes.length === 0) return;

        let layoutedNodes: Node[];

        switch (layoutType) {
            case 'force':
                layoutedNodes = getForceLayout(nodes, edges);
                break;
            case 'tree-lr':
                layoutedNodes = getTreeLayout(nodes, edges, { direction: 'LR' });
                break;
            case 'tree-tb':
                layoutedNodes = getTreeLayout(nodes, edges, { direction: 'TB' });
                break;
            case 'radial':
                layoutedNodes = getRadialLayout(nodes, edges);
                break;
            case 'circular':
                layoutedNodes = getCircularLayout(nodes);
                break;
            case 'grid':
                layoutedNodes = getGridLayout(nodes);
                break;
            default:
                layoutedNodes = nodes;
        }

        setNodes(layoutedNodes);
        setTimeout(() => fitView({ duration: 500 }), 100);
    }, [layoutType]);

    // Filter nodes based on search and filters
    useEffect(() => {
        const filteredNodes = initialNodes.filter((node) => {
            const graphNode = node.data.graphNode as GraphNode;
            const nodeType = graphNode.labels?.[0]?.toLowerCase();

            // Apply type filters
            if (activeFilters.size > 0 && !activeFilters.has(nodeType as any)) {
                return false;
            }

            // Apply search
            if (searchQuery) {
                const displayName = getNodeDisplayName(graphNode).toLowerCase();
                const properties = Object.values(graphNode.properties || {})
                    .map((v) => String(v).toLowerCase())
                    .join(' ');
                const searchLower = searchQuery.toLowerCase();

                return displayName.includes(searchLower) || properties.includes(searchLower);
            }

            return true;
        });

        setNodes(filteredNodes);
    }, [searchQuery, activeFilters, initialNodes]);

    // Handle node click
    const onNodeClick: NodeMouseHandler = useCallback(
        (event, node) => {
            const graphNode = node.data.graphNode as GraphNode;
            setSelectedNode(graphNode);
        },
        [setSelectedNode]
    );

    // Handle node hover
    const onNodeMouseEnter: NodeMouseHandler = useCallback(
        (event, node) => {
            // Find connected nodes
            const connectedNodeIds = new Set<string>([node.id]);
            edges.forEach((edge) => {
                if (edge.source === node.id) {
                    connectedNodeIds.add(edge.target);
                }
                if (edge.target === node.id) {
                    connectedNodeIds.add(edge.source);
                }
            });
            setHighlightedNodes(connectedNodeIds);
        },
        [edges, setHighlightedNodes]
    );

    const onNodeMouseLeave: NodeMouseHandler = useCallback(() => {
        setHighlightedNodes(new Set());
    }, [setHighlightedNodes]);

    if (!graphNodes || graphNodes.length === 0) {
        return (
            <div className="flex h-full items-center justify-center rounded-lg border bg-muted">
                <p className="text-muted-foreground">No graph data available</p>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            {/* Mobile Menu Buttons */}
            <div className="flex items-center gap-2 border-b border-border bg-card p-2 lg:hidden">
                <button
                    onClick={() => setShowSearchPanel(!showSearchPanel)}
                    className="rounded-md border border-border bg-background p-2 text-foreground hover:bg-muted"
                    aria-label="Toggle search panel"
                >
                    {showSearchPanel ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </button>
                {selectedNode && (
                    <button
                        onClick={() => setShowDetailsPanel(!showDetailsPanel)}
                        className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted"
                    >
                        {showDetailsPanel ? 'Hide' : 'Show'} Details
                    </button>
                )}
            </div>

            <GraphToolbar
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onFitView={() => fitView({ duration: 500 })}
            />
            <div className="relative flex flex-1 overflow-hidden">
                {/* Search Panel - Hidden on mobile by default, slides in */}
                <div
                    className={`absolute inset-y-0 left-0 z-20 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${showSearchPanel ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    <GraphSearchPanel />
                </div>

                {/* Overlay for mobile when panel is open */}
                {showSearchPanel && (
                    <div
                        className="absolute inset-0 z-10 bg-black/50 lg:hidden"
                        onClick={() => setShowSearchPanel(false)}
                    />
                )}

                {/* Graph Area */}
                <div className="flex-1">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodeClick={onNodeClick}
                        onNodeMouseEnter={onNodeMouseEnter}
                        onNodeMouseLeave={onNodeMouseLeave}
                        fitView
                        attributionPosition="bottom-left"
                    >
                        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                        <Controls />
                    </ReactFlow>
                </div>

                {/* Details Panel - Hidden on mobile by default, slides in */}
                <div
                    className={`absolute inset-y-0 right-0 z-20 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${showDetailsPanel ? 'translate-x-0' : 'translate-x-full'
                        }`}
                >
                    <GraphDetailsPanel />
                </div>

                {/* Overlay for mobile when details panel is open */}
                {showDetailsPanel && (
                    <div
                        className="absolute inset-0 z-10 bg-black/50 lg:hidden"
                        onClick={() => setShowDetailsPanel(false)}
                    />
                )}
            </div>
        </div>
    );
}

export function KnowledgeGraphViewer(props: KnowledgeGraphViewerProps) {
    return (
        <GraphProvider>
            <ReactFlowProvider>
                <KnowledgeGraphViewerContent {...props} />
            </ReactFlowProvider>
        </GraphProvider>
    );
}
