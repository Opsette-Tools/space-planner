import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Check, Download, Copy, FileJson, FileImage, MoreHorizontal, Trash2, Upload, Loader2 } from "lucide-react";
import { useState } from "react";

interface Props {
  name: string;
  onNameChange: (n: string) => void;
  onBack: () => void;
  saving: boolean;
  zoomPct: number;
  onExportJSON: () => void;
  onExportPNG: () => void;
  onImportJSON: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function EditorTopBar({
  name,
  onNameChange,
  onBack,
  saving,
  zoomPct,
  onExportJSON,
  onExportPNG,
  onImportJSON,
  onDuplicate,
  onDelete,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  return (
    <header className="h-14 shrink-0 border-b border-border bg-card flex items-center gap-2 px-3">
      <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
        <ArrowLeft className="w-4 h-4" />
      </Button>
      {editing ? (
        <Input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            onNameChange(draft.trim() || name);
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") {
              setDraft(name);
              setEditing(false);
            }
          }}
          className="h-8 max-w-[260px]"
        />
      ) : (
        <button
          onClick={() => {
            setDraft(name);
            setEditing(true);
          }}
          className="font-medium text-sm sm:text-base truncate max-w-[40vw] hover:text-accent transition"
        >
          {name}
        </button>
      )}

      <div className="ml-auto flex items-center gap-2">
        <span className="hidden sm:inline-flex text-xs text-muted-foreground tabular-nums">{zoomPct}%</span>
        <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground">
          {saving ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" /> Saving
            </>
          ) : (
            <>
              <Check className="w-3 h-3" /> Saved
            </>
          )}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Menu">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="w-4 h-4" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExportPNG}>
              <FileImage className="w-4 h-4" /> Export PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportJSON}>
              <FileJson className="w-4 h-4" /> Export JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onImportJSON}>
              <Upload className="w-4 h-4" /> Import JSON
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}