import { ZoomIn, ZoomOut, Maximize2, Download } from 'lucide-react';
import { useGraph, LayoutType } from './GraphContext';

const LAYOUT_OPTIONS: { value: LayoutType; label: string }[] = [
    { value: 'force', label: 'Force-Directed' },
    { value: 'tree-lr', label: 'Tree (Horizontal)' },
    { value: 'tree-tb', label: 'Tree (Vertical)' },
    { value: 'radial', label: 'Radial' },
    { value: 'circular', label: 'Circular' },
    { value: 'grid', label: 'Grid' },
];

interface GraphToolbarProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onFitView: () => void;
    onExport?: () => void;
}

export function GraphToolbar({ onZoomIn, onZoomOut, onFitView, onExport }: GraphToolbarProps) {
    const { layoutType, setLayoutType, showLabels, setShowLabels, showEdgeLabels, setShowEdgeLabels } = useGraph();

    return (
        <div className="flex flex-col gap-2 border-b border-border bg-card px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
            {/* Left: Layout Selector */}
            <div className="flex items-center gap-2 sm:gap-3">
                <label className="text-xs font-medium text-foreground sm:text-sm">Layout:</label>
                <select
                    value={layoutType}
                    onChange={(e) => setLayoutType(e.target.value as LayoutType)}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:px-3 sm:py-1.5 sm:text-sm"
                >
                    {LAYOUT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Center: View Options - Hidden on mobile */}
            <div className="hidden items-center gap-4 md:flex">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                    <input
                        type="checkbox"
                        checked={showLabels}
                        onChange={(e) => setShowLabels(e.target.checked)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                    />
                    Show Labels
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                    <input
                        type="checkbox"
                        checked={showEdgeLabels}
                        onChange={(e) => setShowEdgeLabels(e.target.checked)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                    />
                    Show Edge Labels
                </label>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
                <button
                    onClick={onZoomIn}
                    className="rounded-md border border-border bg-background p-1.5 text-foreground hover:bg-muted sm:p-2"
                    title="Zoom In"
                >
                    <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
                <button
                    onClick={onZoomOut}
                    className="rounded-md border border-border bg-background p-1.5 text-foreground hover:bg-muted sm:p-2"
                    title="Zoom Out"
                >
                    <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
                <button
                    onClick={onFitView}
                    className="rounded-md border border-border bg-background p-1.5 text-foreground hover:bg-muted sm:p-2"
                    title="Fit to Screen"
                >
                    <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
                {onExport && (
                    <button
                        onClick={onExport}
                        className="hidden rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground hover:bg-muted sm:block sm:px-3 sm:py-2 sm:text-sm"
                        title="Export"
                    >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
