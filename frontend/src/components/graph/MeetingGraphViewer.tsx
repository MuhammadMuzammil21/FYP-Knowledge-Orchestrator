import { useMemo } from 'react';
import { KnowledgeGraphViewer } from './KnowledgeGraphViewer';
import type { MeetingGraphResponse, GraphNode, GraphEdge } from '@/types';

interface MeetingGraphViewerProps {
    data: MeetingGraphResponse;
}

/**
 * Adapter component that converts meeting API response format
 * (participants, tasks, decisions, topics) into graph nodes and edges
 * for visualization with KnowledgeGraphViewer
 */
export function MeetingGraphViewer({ data }: MeetingGraphViewerProps) {
    const { nodes, edges } = useMemo(() => {
        const graphNodes: GraphNode[] = [];
        const graphEdges: GraphEdge[] = [];
        let nodeIdCounter = 0;

        // Create a map to track node IDs by name/identifier
        const nodeIdMap = new Map<string, number>();

        // Helper to get or create node ID
        const getNodeId = (key: string): number => {
            if (!nodeIdMap.has(key)) {
                nodeIdMap.set(key, nodeIdCounter++);
            }
            return nodeIdMap.get(key)!;
        };

        // Add participants as Person nodes
        data.participants?.forEach((participant) => {
            const nodeId = getNodeId(`person:${participant.name}`);
            graphNodes.push({
                id: nodeId,
                labels: ['Person'],
                properties: {
                    name: participant.name,
                    created_at: participant.created_at || new Date().toISOString(),
                },
            });
        });

        // Add tasks as Task nodes
        data.tasks?.forEach((task) => {
            const taskNodeId = getNodeId(`task:${task.id}`);
            graphNodes.push({
                id: taskNodeId,
                labels: ['Task'],
                properties: {
                    task: task.description,
                    description: task.description,
                    due_date: task.due_date,
                    created_at: task.created_at,
                },
            });

            // Create edge from assignee to task
            if (task.assignee) {
                const assigneeNodeId = getNodeId(`person:${task.assignee}`);

                // Add assignee as person node if not exists
                if (!graphNodes.find(n => n.id === assigneeNodeId)) {
                    graphNodes.push({
                        id: assigneeNodeId,
                        labels: ['Person'],
                        properties: {
                            name: task.assignee,
                        },
                    });
                }

                graphEdges.push({
                    type: 'ASSIGNED_TO',
                    start: assigneeNodeId,
                    end: taskNodeId,
                    properties: {},
                });
            }
        });

        // Add decisions as Decision nodes
        data.decisions?.forEach((decision) => {
            const decisionNodeId = getNodeId(`decision:${decision.id}`);
            graphNodes.push({
                id: decisionNodeId,
                labels: ['Decision'],
                properties: {
                    statement: decision.description,
                    description: decision.description,
                    created_at: decision.created_at,
                },
            });
        });

        // Add topics as Topic nodes
        data.topics?.forEach((topic, index) => {
            // Handle both string and object formats
            const topicName = typeof topic === 'string' ? topic : (topic as any).name;
            const topicUpdatedAt = typeof topic === 'string' ? new Date().toISOString() : (topic as any).updated_at;

            const topicNodeId = getNodeId(`topic:${topicName || index}`);
            graphNodes.push({
                id: topicNodeId,
                labels: ['Topic'],
                properties: {
                    name: topicName,
                    updated_at: topicUpdatedAt || new Date().toISOString(),
                },
            });

            // Connect topics to participants (discussed by)
            data.participants?.forEach((participant) => {
                const participantNodeId = getNodeId(`person:${participant.name}`);
                graphEdges.push({
                    type: 'DISCUSSED',
                    start: participantNodeId,
                    end: topicNodeId,
                    properties: {},
                });
            });
        });

        return { nodes: graphNodes, edges: graphEdges };
    }, [data]);

    // If no nodes were created, return null to show "no data" message
    if (nodes.length === 0) {
        return null;
    }

    return <KnowledgeGraphViewer nodes={nodes} edges={edges} />;
}
