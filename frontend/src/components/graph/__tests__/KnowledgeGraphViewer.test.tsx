/**
 * Knowledge Graph Viewer Tests
 * Tests for the node display name extraction logic
 */

import type { GraphNode } from '@/types';

// Helper function to test (extracted from component for testing)
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

describe('KnowledgeGraphViewer - Node Display Names', () => {
    describe('Property-based Display Names', () => {
        it('should extract name property for Person nodes', () => {
            const node: GraphNode = {
                id: 1,
                labels: ['Person'],
                properties: {
                    name: 'John Doe',
                    email: 'john@example.com',
                },
            };
            expect(getNodeDisplayName(node)).toBe('John Doe');
        });

        it('should extract task property for Task nodes', () => {
            const node: GraphNode = {
                id: 2,
                labels: ['Task'],
                properties: {
                    task: 'Complete the report',
                    assignee: 'John Doe',
                },
            };
            expect(getNodeDisplayName(node)).toBe('Complete the report');
        });

        it('should extract name property for Topic nodes', () => {
            const node: GraphNode = {
                id: 3,
                labels: ['Topic'],
                properties: {
                    name: 'Budget Discussion',
                },
            };
            expect(getNodeDisplayName(node)).toBe('Budget Discussion');
        });

        it('should extract statement property for Decision nodes', () => {
            const node: GraphNode = {
                id: 4,
                labels: ['Decision'],
                properties: {
                    statement: 'Approved Q2 budget',
                    decidedBy: 'Team Lead',
                },
            };
            expect(getNodeDisplayName(node)).toBe('Approved Q2 budget');
        });

        it('should extract question property for Question nodes', () => {
            const node: GraphNode = {
                id: 5,
                labels: ['Question'],
                properties: {
                    question: 'What is the deadline?',
                },
            };
            expect(getNodeDisplayName(node)).toBe('What is the deadline?');
        });
    });

    describe('Property Priority', () => {
        it('should prioritize "name" over other properties', () => {
            const node: GraphNode = {
                id: 6,
                labels: ['Person'],
                properties: {
                    name: 'Priority Name',
                    title: 'Should Not Show',
                    description: 'Should Not Show',
                },
            };
            expect(getNodeDisplayName(node)).toBe('Priority Name');
        });

        it('should use "title" when "name" is not available', () => {
            const node: GraphNode = {
                id: 7,
                labels: ['Document'],
                properties: {
                    title: 'Document Title',
                    description: 'Should Not Show',
                },
            };
            expect(getNodeDisplayName(node)).toBe('Document Title');
        });

        it('should use "description" when higher priority props are not available', () => {
            const node: GraphNode = {
                id: 8,
                labels: ['Item'],
                properties: {
                    description: 'Item Description',
                },
            };
            expect(getNodeDisplayName(node)).toBe('Item Description');
        });
    });

    describe('Fallback Behavior', () => {
        it('should use node type label when no properties available', () => {
            const node: GraphNode = {
                id: 9,
                labels: ['Person'],
                properties: {},
            };
            expect(getNodeDisplayName(node)).toBe('Person');
        });

        it('should use first string property as fallback', () => {
            const node: GraphNode = {
                id: 10,
                labels: ['CustomType'],
                properties: {
                    someField: 'Some Value',
                    numericField: 123,
                },
            };
            expect(getNodeDisplayName(node)).toBe('Some Value');
        });

        it('should use node ID when no labels or properties', () => {
            const node: GraphNode = {
                id: 11,
                labels: [],
                properties: {},
            };
            expect(getNodeDisplayName(node)).toBe('Node 11');
        });

        it('should handle undefined properties', () => {
            const node: GraphNode = {
                id: 12,
                labels: ['Person'],
                properties: undefined as any,
            };
            expect(getNodeDisplayName(node)).toBe('Person');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty string properties', () => {
            const node: GraphNode = {
                id: 13,
                labels: ['Person'],
                properties: {
                    name: '',
                    title: 'Valid Title',
                },
            };
            expect(getNodeDisplayName(node)).toBe('Valid Title');
        });

        it('should handle whitespace-only properties', () => {
            const node: GraphNode = {
                id: 14,
                labels: ['Person'],
                properties: {
                    name: '   ',
                    title: 'Valid Title',
                },
            };
            expect(getNodeDisplayName(node)).toBe('Valid Title');
        });

        it('should trim property values', () => {
            const node: GraphNode = {
                id: 15,
                labels: ['Person'],
                properties: {
                    name: '  Trimmed Name  ',
                },
            };
            expect(getNodeDisplayName(node)).toBe('Trimmed Name');
        });

        it('should handle non-string properties', () => {
            const node: GraphNode = {
                id: 16,
                labels: ['Data'],
                properties: {
                    name: 123 as any,
                    title: 'Valid Title',
                },
            };
            expect(getNodeDisplayName(node)).toBe('Valid Title');
        });

        it('should handle null properties', () => {
            const node: GraphNode = {
                id: 17,
                labels: ['Item'],
                properties: {
                    name: null as any,
                    title: 'Valid Title',
                },
            };
            expect(getNodeDisplayName(node)).toBe('Valid Title');
        });

        it('should handle undefined property values', () => {
            const node: GraphNode = {
                id: 18,
                labels: ['Item'],
                properties: {
                    name: undefined as any,
                    title: 'Valid Title',
                },
            };
            expect(getNodeDisplayName(node)).toBe('Valid Title');
        });
    });

    describe('Multiple Labels', () => {
        it('should use first label when multiple labels exist', () => {
            const node: GraphNode = {
                id: 19,
                labels: ['Person', 'Employee', 'Manager'],
                properties: {},
            };
            expect(getNodeDisplayName(node)).toBe('Person');
        });
    });

    describe('Special Characters', () => {
        it('should handle names with special characters', () => {
            const node: GraphNode = {
                id: 20,
                labels: ['Person'],
                properties: {
                    name: "O'Brien & Associates",
                },
            };
            expect(getNodeDisplayName(node)).toBe("O'Brien & Associates");
        });

        it('should handle unicode characters', () => {
            const node: GraphNode = {
                id: 21,
                labels: ['Person'],
                properties: {
                    name: 'José García',
                },
            };
            expect(getNodeDisplayName(node)).toBe('José García');
        });
    });
});
