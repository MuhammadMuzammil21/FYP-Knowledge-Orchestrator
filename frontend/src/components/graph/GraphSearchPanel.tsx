import { Search, X } from 'lucide-react';
import { FaUser, FaTasks, FaLightbulb, FaQuestion, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useGraph, NodeTypeFilter } from './GraphContext';

const NODE_TYPE_CONFIG: Record<NodeTypeFilter, { label: string; icon: React.ReactNode; color: string }> = {
    person: { label: 'Person', icon: <FaUser className="h-3 w-3" />, color: '#3b82f6' },
    task: { label: 'Task', icon: <FaTasks className="h-3 w-3" />, color: '#10b981' },
    decision: { label: 'Decision', icon: <FaExclamationTriangle className="h-3 w-3" />, color: '#f59e0b' },
    topic: { label: 'Topic', icon: <FaLightbulb className="h-3 w-3" />, color: '#8b5cf6' },
    action_item: { label: 'Action Item', icon: <FaCheckCircle className="h-3 w-3" />, color: '#ef4444' },
    question: { label: 'Question', icon: <FaQuestion className="h-3 w-3" />, color: '#ec4899' },
};

export function GraphSearchPanel() {
    const { searchQuery, setSearchQuery, activeFilters, toggleFilter, clearFilters } = useGraph();

    return (
        <div className="flex h-full w-64 flex-col border-r border-border bg-card">
            {/* Header */}
            <div className="border-b border-border p-4">
                <h3 className="text-sm font-semibold text-foreground">Search & Filter</h3>
            </div>

            {/* Search Bar */}
            <div className="border-b border-border p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search nodes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-foreground">Node Types</h4>
                    {activeFilters.size > 0 && (
                        <button
                            onClick={clearFilters}
                            className="text-xs text-primary hover:underline"
                        >
                            Clear all
                        </button>
                    )}
                </div>

                <div className="space-y-2">
                    {(Object.keys(NODE_TYPE_CONFIG) as NodeTypeFilter[]).map((type) => {
                        const config = NODE_TYPE_CONFIG[type];
                        const isActive = activeFilters.has(type);

                        return (
                            <label
                                key={type}
                                className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-muted"
                            >
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={() => toggleFilter(type)}
                                    className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                                />
                                <div
                                    className="flex h-5 w-5 items-center justify-center rounded"
                                    style={{ backgroundColor: config.color + '20', color: config.color }}
                                >
                                    {config.icon}
                                </div>
                                <span className="text-sm text-foreground">{config.label}</span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="border-t border-border p-4">
                <h4 className="mb-2 text-xs font-semibold text-foreground">Legend</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span>Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground opacity-30" />
                        <span>Dimmed</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
