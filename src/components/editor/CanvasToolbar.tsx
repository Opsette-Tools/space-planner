import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Grid3x3, Magnet, Maximize2, Minus, Plus, Ruler, RotateCcw } from "lucide-react";

interface Props {
  showGrid: boolean;
  snap: boolean;
  gridSize: number;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onCycleGridSize: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFit: () => void;
}

export function CanvasToolbar(p: Props) {
  const sizeLabel = p.gridSize <= 8 ? "S" : p.gridSize <= 16 ? "M" : "L";
  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-card/95 backdrop-blur border border-border rounded-full shadow-md px-1.5 py-1 z-10">
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={p.onZoomOut} aria-label="Zoom out">
        <Minus className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={p.onZoomIn} aria-label="Zoom in">
        <Plus className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={p.onReset} aria-label="Reset view">
        <RotateCcw className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={p.onFit} aria-label="Fit to content">
        <Maximize2 className="w-4 h-4" />
      </Button>
      <div className="w-px h-5 bg-border mx-0.5" />
      <Toggle pressed={p.showGrid} onPressedChange={p.onToggleGrid} className="h-9 w-9 rounded-full data-[state=on]:bg-accent data-[state=on]:text-accent-foreground" aria-label="Toggle grid">
        <Grid3x3 className="w-4 h-4" />
      </Toggle>
      <Toggle pressed={p.snap} onPressedChange={p.onToggleSnap} className="h-9 w-9 rounded-full data-[state=on]:bg-accent data-[state=on]:text-accent-foreground" aria-label="Toggle snap">
        <Magnet className="w-4 h-4" />
      </Toggle>
      <Button
        variant="ghost"
        size="sm"
        className="h-9 rounded-full px-2 gap-1 text-xs font-medium"
        onClick={p.onCycleGridSize}
        aria-label={`Grid size: ${sizeLabel}`}
        title="Cycle grid size (S/M/L)"
      >
        <Ruler className="w-3.5 h-3.5" />
        {sizeLabel}
      </Button>
    </div>
  );
}