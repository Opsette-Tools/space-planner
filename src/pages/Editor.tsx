import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { App as AntApp, Button, Drawer, Layout, Space, Typography } from "antd";
import { AppstoreAddOutlined, CopyOutlined, DeleteOutlined, SlidersOutlined } from "@ant-design/icons";
import { Canvas, type CanvasHandle } from "@/components/editor/Canvas";
import { CanvasToolbar } from "@/components/editor/CanvasToolbar";
import { EditorTopBar } from "@/components/editor/EditorTopBar";
import { Inspector } from "@/components/editor/Inspector";
import { ObjectLibrary } from "@/components/editor/ObjectLibrary";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHistory } from "@/hooks/useHistory";
import { deleteLayout, genId, getLayout, saveLayout } from "@/lib/storage";
import type { Layout as LayoutData, LayoutItem } from "@/lib/types";
import type { LibraryDef } from "@/lib/objectLibrary";
import { makeItem } from "@/lib/objectLibrary";
import {
  downloadDataUrl,
  downloadJSON,
  importJSON,
  nodeToPng,
} from "@/lib/exporters";

const { Text } = Typography;

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
  const { message, modal } = AntApp.useApp();
  const isMobile = useIsMobile();

  const history = useHistory<LayoutData | null>(null);
  const layout = history.state;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [zoomPct, setZoomPct] = useState(40);
  const [libOpen, setLibOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  const canvasRef = useRef<CanvasHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<number | null>(null);
  const loadingRef = useRef(true);
  // When true, the next layout-change effect will NOT mark the layout dirty.
  // Used by internal metadata flips (e.g., toggling auto-save) that we just persisted.
  const skipDirtyRef = useRef(false);
  // True when manual-save mode is on. Default: true (auto-save OFF).
  const manualSave = layout?.manualSave ?? true;

  // Load
  useEffect(() => {
    if (!id) return;
    loadingRef.current = true;
    getLayout(id).then((l) => {
      if (!l) {
        message.error("Layout not found");
        navigate("/");
        return;
      }
      history.reset(l);
      setSelectedIds([]);
      setDirty(false);
      setTimeout(() => {
        loadingRef.current = false;
      }, 200);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  // Single save implementation — used by both auto-save (on timer) and manual Save button.
  const persistLayout = useCallback(async () => {
    if (!layout) return;
    setSaving(true);
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
    setDirty(false);
  }, [layout]);

  // Mark dirty whenever layout changes post-load. Auto-save (when enabled) debounces.
  useEffect(() => {
    if (!layout || loadingRef.current) return;
    if (skipDirtyRef.current) {
      skipDirtyRef.current = false;
      return;
    }
    setDirty(true);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    if (!manualSave) {
      // Auto-save mode: debounce 600ms
      saveTimer.current = window.setTimeout(() => {
        persistLayout();
      }, 600);
    }
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, manualSave]);

  // Warn before unload when there are unsaved changes in manual-save mode
  useEffect(() => {
    if (!manualSave || !dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [manualSave, dirty]);

  const toggleManualSave = useCallback(async () => {
    if (!layout) return;
    const next = !manualSave;
    const updated = { ...layout, manualSave: next, updatedAt: Date.now() };
    await saveLayout(updated);
    // Don't let this metadata flip trip the mark-dirty effect.
    skipDirtyRef.current = true;
    history.replace(() => updated);
    setDirty(false);
    message.success(next ? "Auto-save turned off" : "Auto-save turned on");
  }, [layout, manualSave, history, message]);

  // ---- Selection helpers ----
  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  // ---- Mutators (history-aware) ----
  const updateItem = useCallback(
    (itemId: string, patch: Partial<LayoutItem>) => {
      history.set((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
            }
          : prev,
      );
    },
    [history],
  );

  const updateItems = useCallback(
    (patches: Record<string, Partial<LayoutItem>>) => {
      history.set((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) => (patches[i.id] ? { ...i, ...patches[i.id] } : i)),
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
                i.id === itemId ? { ...i, style: { ...i.style, ...patch } } : i,
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
      history.set((prev) => (prev ? { ...prev, items: [...prev.items, item] } : prev));
      setSelectedIds([item.id]);
      setLibOpen(false);
      message.success(`Added ${def.label}`);
    },
    [layout, history, message],
  );

  const duplicateSelection = useCallback(() => {
    if (!layout || selectedIds.length === 0) return;
    const expanded = new Set(expandToGroup(layout.items, selectedIds));
    const toCopy = layout.items.filter((i) => expanded.has(i.id));
    if (toCopy.length === 0) return;
    const maxZ = layout.items.reduce((m, i) => Math.max(m, i.zIndex), 0);
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
    history.set((prev) => (prev ? { ...prev, items: [...prev.items, ...newItems] } : prev));
    setSelectedIds(newItems.map((i) => i.id));
  }, [layout, selectedIds, history]);

  const deleteSelection = useCallback(() => {
    if (!layout || selectedIds.length === 0) return;
    const expanded = new Set(expandToGroup(layout.items, selectedIds));
    history.set((prev) =>
      prev ? { ...prev, items: prev.items.filter((i) => !expanded.has(i.id)) } : prev,
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
      const isTyping = tag === "INPUT" || tag === "TEXTAREA";
      // Cmd/Ctrl+S — save (works from anywhere, even while typing)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        persistLayout();
        return;
      }
      if (isTyping) return;
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
      if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.length > 0) {
        e.preventDefault();
        deleteSelection();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d" && selectedIds.length > 0) {
        e.preventDefault();
        duplicateSelection();
        return;
      }
      if (e.key === "Escape") setSelectedIds([]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedIds, history, deleteSelection, duplicateSelection, persistLayout]);

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
      message.success("PNG exported");
    } catch {
      message.error("PNG export failed");
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const imported = await importJSON(file);
      const fresh: LayoutData = {
        ...imported,
        id: genId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await saveLayout(fresh);
      message.success(`Imported "${imported.name}"`);
      navigate(`/editor/${fresh.id}`);
    } catch {
      message.error("Invalid layout file");
    }
  };

  const handleDuplicateLayout = async () => {
    if (!layout) return;
    const copy: LayoutData = {
      ...layout,
      id: genId(),
      name: `${layout.name} (copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveLayout(copy);
    navigate(`/editor/${copy.id}`);
  };

  const confirmDeleteLayout = () => {
    if (!layout) return;
    modal.confirm({
      title: "Delete this layout?",
      content: `"${layout.name}" will be removed permanently. This cannot be undone.`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        await deleteLayout(layout.id);
        navigate("/");
      },
    });
  };

  const selectedItem = useMemo(
    () =>
      layout && selectedIds.length === 1
        ? layout.items.find((i) => i.id === selectedIds[0]) ?? null
        : null,
    [layout, selectedIds],
  );

  // Close the mobile inspector drawer when selection clears
  useEffect(() => {
    if (!selectedItem && inspectorOpen) setInspectorOpen(false);
  }, [selectedItem, inspectorOpen]);

  if (!layout) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          color: "#64748b",
        }}
      >
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 16px",
          borderBottom: "1px solid #eaedf1",
          background: "#f7f8fa",
        }}
      >
        <Text strong style={{ fontSize: 13 }}>
          {selectedIds.length} items selected
        </Text>
        <div style={{ flex: 1 }} />
        <Space size={8}>
          <Button size="small" icon={<CopyOutlined />} onClick={duplicateSelection}>
            Duplicate
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={deleteSelection}>
            Delete
          </Button>
        </Space>
      </div>
    ) : null;

  return (
    <Layout style={{ height: "100vh", background: "#ffffff" }}>
      <EditorTopBar
        name={layout.name}
        onNameChange={(n) =>
          history.replace((prev) => (prev ? { ...prev, name: n } : prev))
        }
        onBack={() => {
          if (manualSave && dirty) {
            modal.confirm({
              title: "Leave without saving?",
              content: "Unsaved changes will be lost.",
              okText: "Discard",
              okButtonProps: { danger: true },
              onOk: () => navigate("/"),
            });
          } else {
            navigate("/");
          }
        }}
        saving={saving}
        dirty={dirty}
        manualSave={manualSave}
        onSave={persistLayout}
        onToggleManualSave={toggleManualSave}
        zoomPct={zoomPct}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onUndo={history.undo}
        onRedo={history.redo}
        onExportJSON={handleExportJSON}
        onExportPNG={handleExportPNG}
        onImportJSON={handleImportClick}
        onDuplicate={handleDuplicateLayout}
        onDelete={confirmDeleteLayout}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        style={{ display: "none" }}
        onChange={handleImportFile}
      />

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {!isMobile && (
          <aside
            style={{
              width: 252,
              flexShrink: 0,
              borderRight: "1px solid #eaedf1",
              background: "#fafbfc",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "8px 12px",
                borderBottom: "1px solid #eaedf1",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 0.6,
                textTransform: "uppercase",
                color: "#64748b",
              }}
            >
              Objects
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ObjectLibrary onPick={addItemFromDef} />
            </div>
          </aside>
        )}

        <div style={{ flex: 1, position: "relative", minWidth: 0, display: "flex", flexDirection: "column" }}>
          {multiSelectBar}
          <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
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
                  prev ? { ...prev, canvas: { ...prev.canvas, showGrid: !prev.canvas.showGrid } } : prev,
                )
              }
              onToggleSnap={() =>
                history.set((prev) =>
                  prev ? { ...prev, canvas: { ...prev.canvas, snap: !prev.canvas.snap } } : prev,
                )
              }
              onCycleGridSize={() =>
                history.set((prev) => {
                  if (!prev) return prev;
                  const order = [8, 16, 32];
                  const idx = order.indexOf(prev.canvas.gridSize);
                  const next = order[(idx + 1) % order.length] ?? 8;
                  return { ...prev, canvas: { ...prev.canvas, gridSize: next } };
                })
              }
              onZoomIn={() => canvasRef.current?.zoomIn()}
              onZoomOut={() => canvasRef.current?.zoomOut()}
              onReset={() => canvasRef.current?.resetView()}
              onFit={() => canvasRef.current?.fitToContent()}
            />

            {isMobile && (
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  right: 12,
                  display: "flex",
                  gap: 8,
                  zIndex: 10,
                }}
              >
                <Button
                  type="primary"
                  shape="round"
                  icon={<AppstoreAddOutlined />}
                  onClick={() => setLibOpen(true)}
                  style={{ boxShadow: "0 2px 8px rgba(15, 23, 42, 0.18)" }}
                >
                  Add
                </Button>
                {selectedItem && (
                  <Button
                    shape="round"
                    icon={<SlidersOutlined />}
                    onClick={() => setInspectorOpen(true)}
                    style={{ marginLeft: "auto", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.18)" }}
                  >
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {!isMobile && selectedItem && (
          <aside
            style={{
              width: 288,
              flexShrink: 0,
              borderLeft: "1px solid #eaedf1",
              background: "#fafbfc",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                padding: "8px 12px",
                borderBottom: "1px solid #eaedf1",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 0.6,
                textTransform: "uppercase",
                color: "#64748b",
              }}
            >
              Inspector
            </div>
            {inspector}
          </aside>
        )}
      </div>

      {isMobile && (
        <Drawer
          title="Object library"
          placement="bottom"
          open={libOpen}
          onClose={() => setLibOpen(false)}
          height="70vh"
          styles={{ body: { padding: 0 } }}
        >
          <ObjectLibrary onPick={addItemFromDef} />
        </Drawer>
      )}

      {isMobile && (
        <Drawer
          title="Inspector"
          placement="bottom"
          open={inspectorOpen && !!selectedItem}
          onClose={() => setInspectorOpen(false)}
          height="80vh"
          styles={{ body: { padding: 0 } }}
        >
          {inspector}
        </Drawer>
      )}
    </Layout>
  );
}
