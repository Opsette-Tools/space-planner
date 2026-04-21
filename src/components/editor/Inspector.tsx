import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ArrowDown, ArrowUp, Copy, Lock, Trash2, Unlock } from "lucide-react";
import type { BorderStyle, LayoutItem } from "@/lib/types";

const SWATCHES = [
  "#e8e3d6", "#c8d3e0", "#d8cce8", "#cee0c8", "#bcd9e8",
  "#ffd766", "#fff8d8", "#f5b8b8", "#d8d0c0", "#ffffff",
  "#1a1a1a", "#888888",
];

interface Props {
  item: LayoutItem;
  onChange: (patch: Partial<LayoutItem>) => void;
  onStyleChange: (patch: Partial<LayoutItem["style"]>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onForward: () => void;
  onBackward: () => void;
}

export function Inspector({ item, onChange, onStyleChange, onDuplicate, onDelete, onForward, onBackward }: Props) {
  return (
    <div className="flex flex-col gap-4 p-4 text-sm">
      <div className="space-y-1.5">
        <Label htmlFor="ins-label">Label</Label>
        <Input id="ins-label" value={item.label} onChange={(e) => onChange({ label: e.target.value })} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Width</Label>
          <Input type="number" value={Math.round(item.width)} onChange={(e) => onChange({ width: Math.max(4, Number(e.target.value) || 0) })} />
        </div>
        <div className="space-y-1.5">
          <Label>Height</Label>
          <Input type="number" value={Math.round(item.height)} onChange={(e) => onChange({ height: Math.max(4, Number(e.target.value) || 0) })} />
        </div>
        <div className="space-y-1.5">
          <Label>X</Label>
          <Input type="number" value={Math.round(item.x)} onChange={(e) => onChange({ x: Number(e.target.value) || 0 })} />
        </div>
        <div className="space-y-1.5">
          <Label>Y</Label>
          <Input type="number" value={Math.round(item.y)} onChange={(e) => onChange({ y: Number(e.target.value) || 0 })} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Rotation</Label>
          <Input type="number" value={Math.round(item.rotation)} onChange={(e) => onChange({ rotation: Number(e.target.value) || 0 })} className="w-20 h-8" />
        </div>
        <Slider value={[item.rotation]} min={-180} max={180} step={1} onValueChange={(v) => onChange({ rotation: v[0] })} />
      </div>

      <div className="space-y-2">
        <Label>Fill</Label>
        <div className="flex flex-wrap gap-1.5">
          {SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => onStyleChange({ fill: c })}
              className="w-7 h-7 rounded-md border border-border ring-offset-background"
              style={{ background: c, outline: item.style.fill === c ? "2px solid hsl(var(--ring))" : "none", outlineOffset: 1 }}
              aria-label={`Fill ${c}`}
            />
          ))}
          <input
            type="color"
            value={item.style.fill}
            onChange={(e) => onStyleChange({ fill: e.target.value })}
            className="w-7 h-7 rounded-md border border-border cursor-pointer"
            aria-label="Custom fill"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Border</Label>
          <Select value={item.style.strokeStyle} onValueChange={(v: BorderStyle) => onStyleChange({ strokeStyle: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid</SelectItem>
              <SelectItem value="dashed">Dashed</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Stroke</Label>
          <input
            type="color"
            value={item.style.stroke}
            onChange={(e) => onStyleChange({ stroke: e.target.value })}
            className="w-full h-9 rounded-md border border-border cursor-pointer"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Opacity</Label>
          <span className="text-xs text-muted-foreground">{Math.round(item.style.opacity * 100)}%</span>
        </div>
        <Slider value={[item.style.opacity * 100]} min={10} max={100} step={1} onValueChange={(v) => onStyleChange({ opacity: v[0] / 100 })} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ins-notes">Notes</Label>
        <Textarea id="ins-notes" rows={3} value={item.notes ?? ""} onChange={(e) => onChange({ notes: e.target.value })} />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
        <div className="flex items-center gap-2">
          {item.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          <span>Lock position</span>
        </div>
        <Switch checked={item.locked} onCheckedChange={(v) => onChange({ locked: v })} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={onForward}><ArrowUp className="w-4 h-4" /> Forward</Button>
        <Button variant="outline" size="sm" onClick={onBackward}><ArrowDown className="w-4 h-4" /> Backward</Button>
        <Button variant="outline" size="sm" onClick={onDuplicate}><Copy className="w-4 h-4" /> Duplicate</Button>
        <Button variant="destructive" size="sm" onClick={onDelete}><Trash2 className="w-4 h-4" /> Delete</Button>
      </div>
    </div>
  );
}