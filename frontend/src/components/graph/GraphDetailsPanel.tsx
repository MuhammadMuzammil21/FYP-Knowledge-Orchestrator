import { X, ExternalLink } from 'lucide-react';
import { FaUser, FaTasks, FaLightbulb, FaQuestion, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useGraph } from './GraphContext';
import { Badge } from '@/components/ui/badge';
import type { GraphNode } from '@/types';

const NODE_TYPE_ICONS: Record<string, React.ReactNode> = {
    person: <FaUser className="h-4 w-4" />,
    task: <FaTasks className="h-4 w-4" />,
    decision: <FaExclamationTriangle className="h-4 w-4" />,
    topic: <FaLightbulb className="h-4 w-4" />,
    action_item: <FaCheckCircle className="h-4 w-4" />,
    question: <FaQuestion className="h-4 w-4" />,
};

const NODE_COLORS: Record<string, string> = {
    person: '#3b82f6',
    task: '#10b981',
    decision: '#f59e0b',
    topic: '#8b5cf6',
    action_item: '#ef4444',
    question: '#ec4899',
    default: '#6b7280',
};

export function GraphDetailsPanel() {
    const { selectedNode, setSelectedNode } = useGraph();

    if (!selectedNode) {
        return (
            <div className="flex h-full w-80 flex-col border-l border-border bg-card">
                <div className="flex items-center justify-center p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Click on a node to view its details
                    </p>
                </div>
            </div>
        );
    }

    const nodeType = selectedNode.labels?.[0]?.toLowerCase() || 'default';
    const nodeColor = NODE_COLORS[nodeType] || NODE_COLORS.default;
    const nodeIcon = NODE_TYPE_ICONS[nodeType];

    // Get display name from properties
    const getDisplayName = (node: GraphNode): string => {
        const props = node.properties || {};
        const propertyKeys = ['name', 'title', 'task', 'description', 'statement', 'question', 'content'];

        for (const key of propertyKeys) {
            if (props[key] && typeof props[key] === 'string' && props[key].trim()) {
                return props[key].trim();
            }
        }

        return node.labels?.[0] || `Node ${node.id}`;
    };

    const displayName = getDisplayName(selectedNode);
    const properties = selectedNode.properties || {};

    return (
        <div className="flex h-full w-80 flex-col border-l border-border bg-card">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="text-sm font-semibold text-foreground">Node Details</h3>
                <button
                    onClick={() => setSelectedNode(null)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Node Info */}
            <div className="flex-1 overflow-y-auto">
                {/* Node Header */}
                <div className="border-b border-border p-4">
                    <div className="mb-3 flex items-start gap-3">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-lg"
                            style={{ backgroundColor: nodeColor + '20', color: nodeColor }}
                        >
                            {nodeIcon}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{displayName}</h4>
                            <Badge
                                variant="outline"
                                className="mt-1 text-xs"
                                style={{ borderColor: nodeColor, color: nodeColor }}
                            >
                                {nodeType.replace(/_/g, ' ')}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Properties */}
                <div className="border-b border-border p-4">
                    <h5 className="mb-3 text-xs font-semibold text-foreground">Properties</h5>
                    {Object.keys(properties).length > 0 ? (
                        <div className="space-y-3">
                            {Object.entries(properties).map(([key, value]) => (
                                <div key={key}>
                                    <div className="mb-1 text-xs font-medium text-muted-foreground">
                                        {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                    </div>
                                    <div className="text-sm text-foreground">
                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No properties available</p>
                    )}
                </div>

                {/* Node ID */}
                <div className="p-4">
                    <h5 className="mb-2 text-xs font-semibold text-foreground">Node ID</h5>
                    <code className="rounded bg-muted px-2 py-1 text-xs text-foreground">
                        {selectedNode.id}
                    </code>
                </div>
            </div>
        </div>
    );
}
