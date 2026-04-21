import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Canvas, type CanvasHandle } from "@/components/editor/Canvas";
import { CanvasToolbar } from "@/components/editor/CanvasToolbar";
import { EditorTopBar } from "@/components/editor/EditorTopBar";
import { Inspector } from "@/components/editor/Inspector";
import { ObjectLibrary } from "@/components/editor/ObjectLibrary";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHistory } from "@/hooks/useHistory";
import { deleteLayout, genId, getLayout, saveLayout } from "@/lib/storage";
import type { Layout, LayoutItem } from "@/lib/types";
import type { LibraryDef } from "@/lib/objectLibrary";
import { makeItem } from "@/lib/objectLibrary";
import {
  downloadDataUrl,
  downloadJSON,
  importJSON,
  nodeToPng,
} from "@/lib/exporters";
import { Copy, Layers, Sliders, Trash2 } from "lucide-react";

/** Compute the set of ids dragged/edited together when `id` is selected:
 *  the id itself plus all its groupmates. */
function expandToGroup(items: LayoutItem[], ids: string[]): string[] {
  const set = new Set(ids);
  const groups = new Set<string>();
  for (const it of items) {
    if (set.has(it.id) && it.groupId) groups.add(it.groupId);
  }
  if (groups.size === 0) return Array.from(set);
  for (const it of items) {
    if (it.groupId && groups.has(it.groupId)) set.add(it.id);
  }
  return Array.from(set);
}

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const history = useHistory<Layout | null>(null);
  const layout = history.state;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [zoomPct, setZoomPct] = useState(40);
  const [libOpen, setLibOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const canvasRef = useRef<CanvasHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<number | null>(null);
  const loadingRef = useRef(true);

  // Load
  useEffect(() => {
    if (!id) return;
    loadingRef.current = true;
    getLayout(id).then((l) => {
      if (!l) {
        toast({ title: "Layout not found", variant: "destructive" });
        navigate("/");
        return;
      }
      history.reset(l);
      setSelectedIds([]);
      setTimeout(() => {
        loadingRef.current = false;
      }, 200);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate, toast]);

  // Debounced autosave
  useEffect(() => {
    if (!layout || loadingRef.current) return;
    setSaving(true);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      let thumbnail: string | undefined;
      try {
        const stage = canvasRef.current?.getStage();
        if (stage) {
          thumbnail = await nodeToPng(stage, {
            width: 480,
            height: 360,
            pixelRatio: 480 / layout.canvas.width,
          });
        }
      } catch {
        /* ignore thumbnail errors */
      }
      await saveLayout({ ...layout, thumbnail, updatedAt: Date.now() });
      setSaving(false);
    }, 600);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  // ---- Selection helpers ----
  const handleSelectionChange = useCallback(
    (ids: string[]) => {
      setSelectedIds(ids);
    },
    [],
  );

  // ---- Mutators (history-aware) ----
  /** Apply patch to a single item, push history entry. */
  const updateItem = useCallback(
    (itemId: string, patch: Partial<LayoutItem>) => {
      history.set((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) =>
                i.id === itemId ? { ...i, ...patch } : i,
              ),
            }
          : prev,
      );
    },
    [history],
  );

  /** Patch many items in one history step (used during drag/resize/rotate via
   *  coalesce). */
  const updateItems = useCallback(
    (patches: Record<string, Partial<LayoutItem>>) => {
      history.set((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) =>
                patches[i.id] ? { ...i, ...patches[i.id] } : i,
              ),
            }
          : prev,
      );
    },
    [history],
  );

  const updateStyle = useCallback(
    (itemId: string, patch: Partial<LayoutItem["style"]>) => {
      history.set((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) =>
                i.id === itemId
                  ? { ...i, style: { ...i.style, ...patch } }
                  : i,
              ),
            }
          : prev,
      );
    },
    [history],
  );

  const addItemFromDef = useCallback(
    (def: LibraryDef) => {
      if (!layout) return;
      const cx = layout.canvas.width / 2;
      const cy = layout.canvas.height / 2;
      const maxZ = layout.items.reduce((m, i) => Math.max(m, i.zIndex), 0);
      const item = makeItem(def, cx, cy, maxZ + 1, genId);
      history.set((prev) =>
        prev ? { ...prev, items: [...prev.items, item] } : prev,
      );
      setSelectedIds([item.id]);
      setLibOpen(false);
      toast({ title: `Added ${def.label}` });
    },
    [layout, history, toast],
  );

  const duplicateSelection = useCallback(() => {
    if (!layout || selectedIds.length === 0) return;
    const expanded = new Set(expandToGroup(layout.items, selectedIds));
    const toCopy = layout.items.filter((i) => expanded.has(i.id));
    if (toCopy.length === 0) return;
    const maxZ = layout.items.reduce((m, i) => Math.max(m, i.zIndex), 0);
    // Remap groupIds so duplicates form their own group
    const groupRemap = new Map<string, string>();
    const newItems: LayoutItem[] = toCopy.map((it, idx) => {
      let newGroupId = it.groupId;
      if (it.groupId) {
        if (!groupRemap.has(it.groupId)) groupRemap.set(it.groupId, genId());
        newGroupId = groupRemap.get(it.groupId);
      }
      return {
        ...it,
        id: genId(),
        x: it.x + 24,
        y: it.y + 24,
        zIndex: maxZ + 1 + idx,
        groupId: newGroupId,
      };
    });
    history.set((prev) =>
      prev ? { ...prev, items: [...prev.items, ...newItems] } : prev,
    );
    setSelectedIds(newItems.map((i) => i.id));
  }, [layout, selectedIds, history]);

  const deleteSelection = useCallback(() => {
    if (!layout || selectedIds.length === 0) return;
    const expanded = new Set(expandToGroup(layout.items, selectedIds));
    history.set((prev) =>
      prev
        ? { ...prev, items: prev.items.filter((i) => !expanded.has(i.id)) }
        : prev,
    );
    setSelectedIds([]);
  }, [layout, selectedIds, history]);

  const reorderSelection = useCallback(
    (dir: 1 | -1) => {
      if (!layout || selectedIds.length === 0) return;
      const sel = new Set(selectedIds);
      history.set((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) =>
                sel.has(i.id) ? { ...i, zIndex: i.zIndex + dir } : i,
              ),
            }
          : prev,
      );
    },
    [layout, selectedIds, history],
  );

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      // Undo / Redo
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) history.redo();
        else history.undo();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        history.redo();
        return;
      }
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedIds.length > 0
      ) {
        e.preventDefault();
        deleteSelection();
        return;
      }
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === "d" &&
        selectedIds.length > 0
      ) {
        e.preventDefault();
        duplicateSelection();
        return;
      }
      if (e.key === "Escape") setSelectedIds([]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedIds, history, deleteSelection, duplicateSelection]);

  const handleExportJSON = () => {
    if (layout) downloadJSON(layout);
  };

  const handleExportPNG = async () => {
    const stage = canvasRef.current?.getStage();
    if (!stage || !layout) return;
    try {
      const dataUrl = await nodeToPng(stage, {
        width: layout.canvas.width,
        height: layout.canvas.height,
        pixelRatio: 1,
      });
      downloadDataUrl(dataUrl, `${layout.name}.png`);
      toast({ title: "PNG exported" });
    } catch {
      toast({ title: "PNG export failed", variant: "destructive" });
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const imported = await importJSON(file);
      const fresh: Layout = {
        ...imported,
        id: genId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await saveLayout(fresh);
      toast({ title: "Imported", description: imported.name });
      navigate(`/editor/${fresh.id}`);
    } catch {
      toast({
        title: "Import failed",
        description: "Invalid layout file",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateLayout = async () => {
    if (!layout) return;
    const copy: Layout = {
      ...layout,
      id: genId(),
      name: `${layout.name} (copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveLayout(copy);
    navigate(`/editor/${copy.id}`);
  };

  const handleDeleteLayout = async () => {
    if (!layout) return;
    await deleteLayout(layout.id);
    navigate("/");
  };

  const selectedItem = useMemo(
    () =>
      layout && selectedIds.length === 1
        ? layout.items.find((i) => i.id === selectedIds[0]) ?? null
        : null,
    [layout, selectedIds],
  );

  if (!layout) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        Loading…
      </div>
    );
  }

  const inspector = selectedItem ? (
    <Inspector
      item={selectedItem}
      onChange={(p) => updateItem(selectedItem.id, p)}
      onStyleChange={(p) => updateStyle(selectedItem.id, p)}
      onDuplicate={duplicateSelection}
      onDelete={deleteSelection}
      onForward={() => reorderSelection(1)}
      onBackward={() => reorderSelection(-1)}
    />
  ) : null;

  const multiSelectBar =
    selectedIds.length > 1 ? (
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
        <span className="text-sm font-medium">
          {selectedIds.length} items selected
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={duplicateSelection}>
            <Copy className="w-4 h-4" /> Duplicate
          </Button>
          <Button size="sm" variant="destructive" onClick={deleteSelection}>
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        </div>
      </div>
    ) : null;

  return (
    <div className="flex flex-col h-screen bg-background">
      <EditorTopBar
        name={layout.name}
        onNameChange={(n) =>
          history.replace((prev) => (prev ? { ...prev, name: n } : prev))
        }
        onBack={() => navigate("/")}
        saving={saving}
        zoomPct={zoomPct}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onUndo={history.undo}
        onRedo={history.redo}
        onExportJSON={handleExportJSON}
        onExportPNG={handleExportPNG}
        onImportJSON={handleImportClick}
        onDuplicate={handleDuplicateLayout}
        onDelete={() => setConfirmDelete(true)}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImportFile}
      />

      <div className="flex-1 flex min-h-0">
        {/* Desktop library */}
        {!isMobile && (
          <aside className="w-64 shrink-0 border-r border-border bg-card flex flex-col">
            <div className="px-3 py-2.5 border-b border-border text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Objects
            </div>
            <ObjectLibrary onPick={addItemFromDef} />
          </aside>
        )}

        {/* Canvas + toolbars */}
        <div className="flex-1 relative min-w-0 flex flex-col">
          {multiSelectBar}
          <div className="flex-1 relative min-h-0">
            <Canvas
              ref={canvasRef}
              layout={layout}
              selectedIds={selectedIds}
              onSelectionChange={handleSelectionChange}
              onUpdateItems={updateItems}
              onGestureStart={history.beginCoalesce}
              onGestureEnd={history.commitCoalesce}
              onZoomChange={(z) => setZoomPct(Math.round(z * 100))}
            />
            <CanvasToolbar
              showGrid={layout.canvas.showGrid}
              snap={layout.canvas.snap}
              gridSize={layout.canvas.gridSize}
              onToggleGrid={() =>
                history.set((prev) =>
                  prev
                    ? {
                        ...prev,
                        canvas: {
                          ...prev.canvas,
                          showGrid: !prev.canvas.showGrid,
                        },
                      }
                    : prev,
                )
              }
              onToggleSnap={() =>
                history.set((prev) =>
                  prev
                    ? {
                        ...prev,
                        canvas: { ...prev.canvas, snap: !prev.canvas.snap },
                      }
                    : prev,
                )
              }
              onCycleGridSize={() =>
                history.set((prev) => {
                  if (!prev) return prev;
                  const order = [8, 16, 32];
                  const idx = order.indexOf(prev.canvas.gridSize);
                  const next = order[(idx + 1) % order.length] ?? 8;
                  return {
                    ...prev,
                    canvas: { ...prev.canvas, gridSize: next },
                  };
                })
              }
              onZoomIn={() => canvasRef.current?.zoomIn()}
              onZoomOut={() => canvasRef.current?.zoomOut()}
              onReset={() => canvasRef.current?.resetView()}
              onFit={() => canvasRef.current?.fitToContent()}
            />

            {/* Mobile floating action bar */}
            {isMobile && (
              <div className="absolute top-3 left-3 right-3 flex gap-2 z-10">
                <Sheet open={libOpen} onOpenChange={setLibOpen}>
                  <SheetTrigger asChild>
                    <Button size="sm" className="rounded-full shadow-md">
                      <Layers className="w-4 h-4" /> Add
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="bottom"
                    className="h-[70vh] flex flex-col p-0"
                  >
                    <SheetHeader className="px-4 pt-4 pb-2">
                      <SheetTitle>Object Library</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 min-h-0">
                      <ObjectLibrary onPick={addItemFromDef} />
                    </div>
                  </SheetContent>
                </Sheet>
                {selectedItem && (
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-full shadow-md ml-auto"
                      >
                        <Sliders className="w-4 h-4" /> Edit
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      side="bottom"
                      className="h-[80vh] overflow-y-auto p-0"
                    >
                      <SheetHeader className="px-4 pt-4 pb-1">
                        <SheetTitle>Inspector</SheetTitle>
                      </SheetHeader>
                      {inspector}
                    </SheetContent>
                  </Sheet>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Desktop inspector */}
        {!isMobile && selectedItem && (
          <aside className="w-72 shrink-0 border-l border-border bg-card overflow-y-auto">
            <div className="px-3 py-2.5 border-b border-border text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Inspector
            </div>
            {inspector}
          </aside>
        )}
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this layout?</AlertDialogTitle>
            <AlertDialogDescription>
              "{layout.name}" will be removed permanently. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLayout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}