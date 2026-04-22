import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { App as AntApp, Button, Drawer, Layout, Space, Typography } from "antd";
import {
  AppstoreAddOutlined,
  CopyOutlined,
  DeleteOutlined,
  DisconnectOutlined,
  LinkOutlined,
  SlidersOutlined,
} from "@ant-design/icons";
import { Canvas, type CanvasHandle } from "@/components/editor/Canvas";
import { CanvasToolbar } from "@/components/editor/CanvasToolbar";
import { EditorTopBar } from "@/components/editor/EditorTopBar";
import { Inspector } from "@/components/editor/Inspector";
import { ObjectLibrary } from "@/components/editor/ObjectLibrary";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHistory } from "@/hooks/useHistory";
import { deleteLayout, genId, getLayout, getPrefs, saveLayout, setPref } from "@/lib/storage";
import type { Layout as LayoutData, LayoutItem, ReferenceImage } from "@/lib/types";
import type { LibraryDef } from "@/lib/objectLibrary";
import { makeItem } from "@/lib/objectLibrary";
import {
  downloadDataUrl,
  downloadJSON,
  importJSON,
  nodeToPng,
} from "@/lib/exporters";
import { fileToReference } from "@/lib/referenceImport";
import { detectShapes } from "@/lib/detectShapes";
import { classifyDetection } from "@/lib/classifyDetection";
import { DetectionBar, type TypedDetection } from "@/components/editor/DetectionPreview";
import { findDef } from "@/lib/objectLibrary";

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
  const location = useLocation();
  const { message, modal } = AntApp.useApp();
  const isMobile = useIsMobile();

  const history = useHistory<LayoutData | null>(null);
  const layout = history.state;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  // True until the layout has been persisted to storage at least once.
  // Drafts arrive via router state (from "New" or "Use template") and live
  // only in memory until the user clicks Save.
  const [unsaved, setUnsaved] = useState(false);
  const [zoomPct, setZoomPct] = useState(40);
  const [libOpen, setLibOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  // Library sidebar width — draggable, persisted via IndexedDB prefs.
  const LIB_MIN = 200;
  const LIB_MAX = 480;
  const LIB_DEFAULT = 252;
  const [libWidth, setLibWidth] = useState(LIB_DEFAULT);
  const libWidthLoaded = useRef(false);
  // When false, the reference image is hidden. Used during PNG export so
  // tracing scaffolding doesn't get baked into the output.
  const [renderReference, setRenderReference] = useState(true);
  // Shape detection state: pending preview, running flag.
  const [detecting, setDetecting] = useState(false);
  const [detections, setDetections] = useState<TypedDetection[] | null>(null);

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
    const draft = (location.state as { draft?: LayoutData } | null)?.draft;
    if (draft && draft.id === id) {
      // Un-persisted draft handed off from the home page.
      history.reset(draft);
      setSelectedIds([]);
      setDirty(true);
      setUnsaved(true);
      // Clear router state so a refresh doesn't keep re-applying the draft.
      navigate(location.pathname, { replace: true, state: null });
      setTimeout(() => {
        loadingRef.current = false;
      }, 200);
      return;
    }
    getLayout(id).then((l) => {
      if (!l) {
        message.error("Layout not found");
        navigate("/");
        return;
      }
      history.reset(l);
      setSelectedIds([]);
      setDirty(false);
      setUnsaved(false);
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
    setUnsaved(false);
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

  // Warn before unload when there are unsaved changes (manual-save mode) or
  // when the layout has never been persisted at all.
  useEffect(() => {
    const shouldWarn = unsaved || (manualSave && dirty);
    if (!shouldWarn) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [manualSave, dirty, unsaved]);

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

  // ---- Reference image mutators ----
  // Coalesced: drag/resize gestures push one history entry per gesture via
  // Canvas's beginCoalesce/commitCoalesce wiring (shared with item gestures).
  const updateReference = useCallback(
    (patch: Partial<ReferenceImage>) => {
      history.set((prev) =>
        prev && prev.reference ? { ...prev, reference: { ...prev.reference, ...patch } } : prev,
      );
    },
    [history],
  );

  const importReference = useCallback(
    async (file: File) => {
      if (!layout) return;
      try {
        const ref = await fileToReference(file, layout.canvas);
        history.set((prev) => (prev ? { ...prev, reference: ref } : prev));
        message.success("Reference added");
      } catch (err) {
        message.error(err instanceof Error ? err.message : "Couldn't read that file");
      }
    },
    [layout, history, message],
  );

  const replaceReference = useCallback(
    async (file: File) => {
      if (!layout?.reference) return importReference(file);
      try {
        const next = await fileToReference(file, layout.canvas);
        // Preserve the user's current placement + display settings when swapping the image.
        const prev = layout.reference;
        const merged: ReferenceImage = {
          ...next,
          x: prev.x,
          y: prev.y,
          width: prev.width,
          height: prev.height,
          opacity: prev.opacity,
          visible: prev.visible,
          locked: prev.locked,
        };
        history.set((p) => (p ? { ...p, reference: merged } : p));
        message.success("Reference replaced");
      } catch (err) {
        message.error(err instanceof Error ? err.message : "Couldn't read that file");
      }
    },
    [layout, history, message, importReference],
  );

  const removeReference = useCallback(() => {
    history.set((prev) => {
      if (!prev) return prev;
      const { reference: _r, ...rest } = prev;
      return rest as LayoutData;
    });
  }, [history]);

  // Run shape detection against the current reference image. The pipeline
  // is synchronous CPU work; we yield a frame first so the popover's
  // "loading" state renders before we block the main thread for ~0.5–2s.
  const runDetection = useCallback(async () => {
    if (!layout?.reference || detecting) return;
    setDetecting(true);
    try {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const result = await detectShapes(layout.reference);
      // Classify each detection into a best-guess library type. User can
      // retype entire groups via the preview panel before committing.
      const typed: TypedDetection[] = result.shapes.map((s) => ({
        ...s,
        chosenType: classifyDetection(s),
      }));
      setDetections(typed);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Detection failed");
    } finally {
      setDetecting(false);
    }
  }, [layout, detecting, message]);

  const cancelDetection = useCallback(() => setDetections(null), []);

  /** Re-tag every pending detection whose current type is `oldType` to
   *  `newType`. Bulk re-type is the primary interaction in the preview. */
  const bulkRetype = useCallback((oldType: string, newType: string) => {
    setDetections((prev) =>
      prev
        ? prev.map((d) => (d.chosenType === oldType ? { ...d, chosenType: newType } : d))
        : prev,
    );
  }, []);

  // Commit all detected shapes as LayoutItems in a single history entry.
  // Each shape uses whatever library type the user confirmed/overrode in
  // the preview panel. Falls back to room-rect if a type is missing.
  const commitDetection = useCallback(() => {
    if (!detections || !layout) return;
    const fallback = findDef("room-rect");
    if (!fallback) return;
    const maxZ = layout.items.reduce((m, i) => Math.max(m, i.zIndex), 0);
    const newItems: LayoutItem[] = detections.map((s, i) => {
      const def = findDef(s.chosenType) ?? fallback;
      return {
        id: genId(),
        type: def.type,
        category: def.category,
        x: Math.round(s.x),
        y: Math.round(s.y),
        width: Math.max(16, Math.round(s.width)),
        height: Math.max(16, Math.round(s.height)),
        rotation: 0,
        zIndex: maxZ + 1 + i,
        label: def.label,
        locked: false,
        style: {
          fill: def.fill,
          stroke: def.stroke,
          strokeStyle: "solid",
          opacity: 1,
        },
        notes: "",
      };
    });
    history.set((prev) => (prev ? { ...prev, items: [...prev.items, ...newItems] } : prev));
    setDetections(null);
    setSelectedIds(newItems.map((i) => i.id));
    message.success(`Added ${newItems.length} shape${newItems.length === 1 ? "" : "s"}`);
  }, [detections, layout, history, message]);

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

  // Stamp a shared groupId on the selection (expanded to existing groupmates)
  // so the items move and select together from now on. Merges any existing
  // groups in the selection into one new group.
  const groupSelection = useCallback(() => {
    if (!layout || selectedIds.length < 2) return;
    const expanded = new Set(expandToGroup(layout.items, selectedIds));
    if (expanded.size < 2) return;
    const newGroupId = genId();
    history.set((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((i) =>
              expanded.has(i.id) ? { ...i, groupId: newGroupId } : i,
            ),
          }
        : prev,
    );
    setSelectedIds(Array.from(expanded));
    message.success("Grouped");
  }, [layout, selectedIds, history, message]);

  // Break grouping for the selection (and any groupmates). Table/chair sets
  // become independent items that can be edited one at a time.
  const ungroupSelection = useCallback(() => {
    if (!layout || selectedIds.length === 0) return;
    const expanded = new Set(expandToGroup(layout.items, selectedIds));
    // Only meaningful if something in the expanded set actually has a groupId.
    const anyGrouped = layout.items.some((i) => expanded.has(i.id) && !!i.groupId);
    if (!anyGrouped) return;
    history.set((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((i) =>
              expanded.has(i.id) && i.groupId ? { ...i, groupId: undefined } : i,
            ),
          }
        : prev,
    );
    // Keep the expanded set selected so the user can immediately act on them.
    setSelectedIds(Array.from(expanded));
    message.success("Ungrouped");
  }, [layout, selectedIds, history, message]);

  const selectionHasGroup = useMemo(() => {
    if (!layout || selectedIds.length === 0) return false;
    const expanded = new Set(expandToGroup(layout.items, selectedIds));
    return layout.items.some((i) => expanded.has(i.id) && !!i.groupId);
  }, [layout, selectedIds]);

  // Can group when the expanded selection contains >= 2 items AND isn't
  // already a single unified group. (Selecting one chair of an existing set
  // expands to the whole set — grouping that would be a no-op.)
  const canGroupSelection = useMemo(() => {
    if (!layout || selectedIds.length < 2) return false;
    const expanded = layout.items.filter((i) =>
      new Set(expandToGroup(layout.items, selectedIds)).has(i.id),
    );
    if (expanded.length < 2) return false;
    const groupIds = new Set<string | undefined>();
    for (const it of expanded) groupIds.add(it.groupId);
    // If every expanded item shares the same defined groupId, already grouped.
    if (groupIds.size === 1 && [...groupIds][0] !== undefined) return false;
    return true;
  }, [layout, selectedIds]);

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
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "g") {
        e.preventDefault();
        if (e.shiftKey) ungroupSelection();
        else groupSelection();
        return;
      }
      if (e.key === "Escape") setSelectedIds([]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    selectedIds,
    history,
    deleteSelection,
    duplicateSelection,
    persistLayout,
    groupSelection,
    ungroupSelection,
  ]);

  const handleExportJSON = () => {
    if (layout) downloadJSON(layout);
  };

  const handleExportPNG = async () => {
    const stage = canvasRef.current?.getStage();
    if (!stage || !layout) return;
    // Hide the reference image during capture so it doesn't bake into the PNG.
    const hadRef = !!layout.reference;
    if (hadRef) {
      setRenderReference(false);
      // Let React commit the hidden state before html-to-image walks the DOM.
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    }
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
    } finally {
      if (hadRef) setRenderReference(true);
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

  // Load the persisted sidebar width once on mount.
  useEffect(() => {
    getPrefs().then((p) => {
      if (typeof p.libraryWidth === "number") {
        const clamped = Math.max(LIB_MIN, Math.min(LIB_MAX, p.libraryWidth));
        setLibWidth(clamped);
      }
      libWidthLoaded.current = true;
    });
  }, []);

  // Drag handler for the divider between sidebar and canvas. Tracks pointer
  // horizontally and clamps to [LIB_MIN, LIB_MAX]. Persists on pointer-up.
  const startLibResize = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = libWidth;
    const onMove = (ev: PointerEvent) => {
      const next = Math.max(LIB_MIN, Math.min(LIB_MAX, startW + (ev.clientX - startX)));
      setLibWidth(next);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setLibWidth((w) => {
        if (libWidthLoaded.current) setPref("libraryWidth", w);
        return w;
      });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [libWidth]);

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
      onUngroup={ungroupSelection}
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
          {canGroupSelection && (
            <Button
              size="small"
              icon={<LinkOutlined />}
              onClick={groupSelection}
            >
              Group
            </Button>
          )}
          {selectionHasGroup && (
            <Button
              size="small"
              icon={<DisconnectOutlined />}
              onClick={ungroupSelection}
            >
              Ungroup
            </Button>
          )}
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
        unsaved={unsaved}
        onNameChange={(n) =>
          history.replace((prev) => (prev ? { ...prev, name: n } : prev))
        }
        onBack={() => {
          if (unsaved) {
            modal.confirm({
              title: "Discard this layout?",
              content:
                "This layout hasn't been saved yet. Leaving now will discard it entirely.",
              okText: "Discard",
              okButtonProps: { danger: true },
              onOk: () => navigate("/"),
            });
          } else if (manualSave && dirty) {
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
        reference={layout.reference ?? null}
        onReferenceChange={updateReference}
        onReferenceImport={importReference}
        onReferenceReplace={replaceReference}
        onReferenceRemove={removeReference}
        onReferenceDetect={runDetection}
        referenceDetecting={detecting}
        referenceDetectDisabled={!!detections}
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
          <>
            <aside
              style={{
                width: libWidth,
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
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize object library"
              onPointerDown={startLibResize}
              style={{
                width: 6,
                marginLeft: -3,
                marginRight: -3,
                cursor: "col-resize",
                flexShrink: 0,
                zIndex: 5,
                background: "transparent",
              }}
            />
          </>
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
              onUpdateReference={updateReference}
              renderReference={renderReference}
              previewShapes={detections ?? undefined}
              onGestureStart={history.beginCoalesce}
              onGestureEnd={history.commitCoalesce}
              onZoomChange={(z) => setZoomPct(Math.round(z * 100))}
            />
            {detections && (
              <DetectionBar
                detections={detections}
                onBulkRetype={bulkRetype}
                onCommit={commitDetection}
                onCancel={cancelDetection}
              />
            )}
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
