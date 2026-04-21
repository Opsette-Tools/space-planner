import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Canvas, type CanvasHandle } from "@/components/editor/Canvas";
import { CanvasToolbar } from "@/components/editor/CanvasToolbar";
import { EditorTopBar } from "@/components/editor/EditorTopBar";
import { Inspector } from "@/components/editor/Inspector";
import { ObjectLibrary } from "@/components/editor/ObjectLibrary";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { deleteLayout, genId, getLayout, saveLayout } from "@/lib/storage";
import type { Layout, LayoutItem } from "@/lib/types";
import type { LibraryDef } from "@/lib/objectLibrary";
import { makeItem } from "@/lib/objectLibrary";
import { downloadDataUrl, downloadJSON, importJSON, nodeToPng } from "@/lib/exporters";
import { Layers, Sliders } from "lucide-react";

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [layout, setLayout] = useState<Layout | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
      setLayout(l);
      setTimeout(() => {
        loadingRef.current = false;
      }, 200);
    });
  }, [id, navigate, toast]);

  // Debounced autosave
  useEffect(() => {
    if (!layout || loadingRef.current) return;
    setSaving(true);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      // generate thumbnail off the stage
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

  const updateItem = useCallback((itemId: string, patch: Partial<LayoutItem>) => {
    setLayout((prev) =>
      prev
        ? { ...prev, items: prev.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) }
        : prev,
    );
  }, []);

  const updateStyle = useCallback((itemId: string, patch: Partial<LayoutItem["style"]>) => {
    setLayout((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((i) => (i.id === itemId ? { ...i, style: { ...i.style, ...patch } } : i)),
          }
        : prev,
    );
  }, []);

  const addItemFromDef = useCallback(
    (def: LibraryDef) => {
      setLayout((prev) => {
        if (!prev) return prev;
        const cx = prev.canvas.width / 2;
        const cy = prev.canvas.height / 2;
        const maxZ = prev.items.reduce((m, i) => Math.max(m, i.zIndex), 0);
        const item = makeItem(def, cx, cy, maxZ + 1, genId);
        setSelectedId(item.id);
        return { ...prev, items: [...prev.items, item] };
      });
      setLibOpen(false);
      toast({ title: `Added ${def.label}`, description: "Tap to move, resize, or rotate." });
    },
    [toast],
  );

  const duplicateItem = (itemId: string) => {
    setLayout((prev) => {
      if (!prev) return prev;
      const it = prev.items.find((i) => i.id === itemId);
      if (!it) return prev;
      const maxZ = prev.items.reduce((m, i) => Math.max(m, i.zIndex), 0);
      const copy: LayoutItem = { ...it, id: genId(), x: it.x + 20, y: it.y + 20, zIndex: maxZ + 1 };
      setSelectedId(copy.id);
      return { ...prev, items: [...prev.items, copy] };
    });
  };

  const deleteItem = (itemId: string) => {
    setLayout((prev) => (prev ? { ...prev, items: prev.items.filter((i) => i.id !== itemId) } : prev));
    setSelectedId(null);
  };

  const reorder = (itemId: string, dir: 1 | -1) => {
    setLayout((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((i) =>
          i.id === itemId ? { ...i, zIndex: i.zIndex + dir * 1 } : i,
        ),
      };
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        deleteItem(selectedId);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d" && selectedId) {
        e.preventDefault();
        duplicateItem(selectedId);
      }
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

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
    } catch (e) {
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
      const fresh: Layout = { ...imported, id: genId(), createdAt: Date.now(), updatedAt: Date.now() };
      await saveLayout(fresh);
      toast({ title: "Imported", description: imported.name });
      navigate(`/editor/${fresh.id}`);
    } catch {
      toast({ title: "Import failed", description: "Invalid layout file", variant: "destructive" });
    }
  };

  const handleDuplicate = async () => {
    if (!layout) return;
    const copy: Layout = { ...layout, id: genId(), name: `${layout.name} (copy)`, createdAt: Date.now(), updatedAt: Date.now() };
    await saveLayout(copy);
    navigate(`/editor/${copy.id}`);
  };

  const handleDelete = async () => {
    if (!layout) return;
    await deleteLayout(layout.id);
    navigate("/");
  };

  const selectedItem = useMemo(
    () => (layout && selectedId ? layout.items.find((i) => i.id === selectedId) ?? null : null),
    [layout, selectedId],
  );

  if (!layout) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">Loading…</div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <EditorTopBar
        name={layout.name}
        onNameChange={(n) => setLayout({ ...layout, name: n })}
        onBack={() => navigate("/")}
        saving={saving}
        zoomPct={zoomPct}
        onExportJSON={handleExportJSON}
        onExportPNG={handleExportPNG}
        onImportJSON={handleImportClick}
        onDuplicate={handleDuplicate}
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

        {/* Canvas */}
        <div className="flex-1 relative min-w-0">
          <Canvas
            ref={canvasRef}
            layout={layout}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onUpdateItem={updateItem}
            onZoomChange={(z) => setZoomPct(Math.round(z * 100))}
          />
          <CanvasToolbar
            showGrid={layout.canvas.showGrid}
            snap={layout.canvas.snap}
            onToggleGrid={() => setLayout({ ...layout, canvas: { ...layout.canvas, showGrid: !layout.canvas.showGrid } })}
            onToggleSnap={() => setLayout({ ...layout, canvas: { ...layout.canvas, snap: !layout.canvas.snap } })}
            onZoomIn={() => canvasRef.current?.zoomIn()}
            onZoomOut={() => canvasRef.current?.zoomOut()}
            onReset={() => canvasRef.current?.resetView()}
            onFit={() => canvasRef.current?.fitToContent()}
          />

          {/* Mobile bottom action bar */}
          {isMobile && (
            <div className="absolute top-3 left-3 right-3 flex gap-2 z-10">
              <Sheet open={libOpen} onOpenChange={setLibOpen}>
                <SheetTrigger asChild>
                  <Button size="sm" className="rounded-full shadow-md">
                    <Layers className="w-4 h-4" /> Add Object
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[70vh] flex flex-col p-0">
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
                    <Button size="sm" variant="secondary" className="rounded-full shadow-md ml-auto">
                      <Sliders className="w-4 h-4" /> Edit
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[80vh] overflow-y-auto p-0">
                    <SheetHeader className="px-4 pt-4 pb-1">
                      <SheetTitle>Inspector</SheetTitle>
                    </SheetHeader>
                    <Inspector
                      item={selectedItem}
                      onChange={(p) => updateItem(selectedItem.id, p)}
                      onStyleChange={(p) => updateStyle(selectedItem.id, p)}
                      onDuplicate={() => duplicateItem(selectedItem.id)}
                      onDelete={() => deleteItem(selectedItem.id)}
                      onForward={() => reorder(selectedItem.id, 1)}
                      onBackward={() => reorder(selectedItem.id, -1)}
                    />
                  </SheetContent>
                </Sheet>
              )}
            </div>
          )}
        </div>

        {/* Desktop inspector */}
        {!isMobile && selectedItem && (
          <aside className="w-72 shrink-0 border-l border-border bg-card overflow-y-auto">
            <div className="px-3 py-2.5 border-b border-border text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Inspector
            </div>
            <Inspector
              item={selectedItem}
              onChange={(p) => updateItem(selectedItem.id, p)}
              onStyleChange={(p) => updateStyle(selectedItem.id, p)}
              onDuplicate={() => duplicateItem(selectedItem.id)}
              onDelete={() => deleteItem(selectedItem.id)}
              onForward={() => reorder(selectedItem.id, 1)}
              onBackward={() => reorder(selectedItem.id, -1)}
            />
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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}