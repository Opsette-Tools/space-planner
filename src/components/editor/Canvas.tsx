import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Layout, LayoutItem } from "@/lib/types";
import { CanvasItem } from "./CanvasItem";

export interface CanvasHandle {
  resetView: () => void;
  fitToContent: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  getViewport: () => HTMLDivElement | null;
  getStage: () => HTMLDivElement | null;
  getZoom: () => number;
  clientToCanvas: (cx: number, cy: number) => { x: number; y: number };
}

interface Props {
  layout: Layout;
  selectedIds: string[];
  onSelectionChange: (ids: string[], opts?: { additive?: boolean }) => void;
  /** Update many items at once. Used for drag/rotate/resize so history can
   *  coalesce a single entry per gesture. */
  onUpdateItems: (patches: Record<string, Partial<LayoutItem>>) => void;
  onGestureStart: () => void;
  onGestureEnd: () => void;
  onZoomChange?: (z: number) => void;
}

const SNAP_GUIDE_THRESHOLD = 6; // px in canvas space

function snapTo(v: number, on: boolean, step: number) {
  if (!on || step <= 0) return v;
  return Math.round(v / step) * step;
}

/** Resolve which item ids should move together when `id` is dragged.
 *  Includes every selected id plus every item that shares a groupId with any
 *  selected item (so dragging one chair drags its whole table set). */
function resolveDragSet(items: LayoutItem[], selected: Set<string>): Set<string> {
  const out = new Set<string>(selected);
  const groups = new Set<string>();
  for (const it of items) {
    if (selected.has(it.id) && it.groupId) groups.add(it.groupId);
  }
  if (groups.size === 0) return out;
  for (const it of items) {
    if (it.groupId && groups.has(it.groupId)) out.add(it.id);
  }
  return out;
}

/** Resolve the full set of ids that should be selected when the user clicks
 *  `id`: that item plus everyone in its group. */
function resolveSelectionFor(items: LayoutItem[], id: string): string[] {
  const it = items.find((i) => i.id === id);
  if (!it) return [];
  if (!it.groupId) return [id];
  return items.filter((i) => i.groupId === it.groupId).map((i) => i.id);
}

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

function boundsOf(items: LayoutItem[]): Bounds | null {
  if (items.length === 0) return null;
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const i of items) {
    if (i.x < minX) minX = i.x;
    if (i.y < minY) minY = i.y;
    if (i.x + i.width > maxX) maxX = i.x + i.width;
    if (i.y + i.height > maxY) maxY = i.y + i.height;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

interface AlignGuide {
  axis: "x" | "y";
  pos: number;
}

/** Compute snap offset + alignment guides between the dragged group's bounds
 *  and the static items. We snap the bounds' left/center/right (and t/c/b) to
 *  the same edges of any other item. */
function computeAlignment(
  moving: Bounds,
  others: LayoutItem[],
): { dx: number; dy: number; guides: AlignGuide[] } {
  const movXs = [moving.x, moving.x + moving.width / 2, moving.x + moving.width];
  const movYs = [moving.y, moving.y + moving.height / 2, moving.y + moving.height];
  let bestDx = 0,
    bestDxAbs = SNAP_GUIDE_THRESHOLD;
  let bestDy = 0,
    bestDyAbs = SNAP_GUIDE_THRESHOLD;
  const guides: AlignGuide[] = [];
  for (const o of others) {
    const oxs = [o.x, o.x + o.width / 2, o.x + o.width];
    const oys = [o.y, o.y + o.height / 2, o.y + o.height];
    for (const mx of movXs) {
      for (const ox of oxs) {
        const d = ox - mx;
        const ad = Math.abs(d);
        if (ad < bestDxAbs) {
          bestDxAbs = ad;
          bestDx = d;
        }
      }
    }
    for (const my of movYs) {
      for (const oy of oys) {
        const d = oy - my;
        const ad = Math.abs(d);
        if (ad < bestDyAbs) {
          bestDyAbs = ad;
          bestDy = d;
        }
      }
    }
  }
  // After snapping, recompute guides based on actual aligned positions
  const finalX = (v: number) => v + bestDx;
  const finalY = (v: number) => v + bestDy;
  for (const o of others) {
    const oxs = [o.x, o.x + o.width / 2, o.x + o.width];
    const oys = [o.y, o.y + o.height / 2, o.y + o.height];
    for (const mx of movXs) {
      for (const ox of oxs) {
        if (Math.abs(finalX(mx) - ox) < 0.5) guides.push({ axis: "x", pos: ox });
      }
    }
    for (const my of movYs) {
      for (const oy of oys) {
        if (Math.abs(finalY(my) - oy) < 0.5) guides.push({ axis: "y", pos: oy });
      }
    }
  }
  return { dx: bestDx, dy: bestDy, guides };
}

export const Canvas = forwardRef<CanvasHandle, Props>(function Canvas(
  {
    layout,
    selectedIds,
    onSelectionChange,
    onUpdateItems,
    onGestureStart,
    onGestureEnd,
    onZoomChange,
  },
  ref,
) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.4);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [guides, setGuides] = useState<AlignGuide[]>([]);
  const [marquee, setMarquee] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  // Initial fit
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const vw = vp.clientWidth;
    const vh = vp.clientHeight;
    const initialZoom =
      Math.min(vw / layout.canvas.width, vh / layout.canvas.height) * 0.9;
    const z = Math.max(0.1, Math.min(2, initialZoom));
    setZoom(z);
    setPan({
      x: (vw - layout.canvas.width * z) / 2,
      y: (vh - layout.canvas.height * z) / 2,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout.id]);

  useEffect(() => {
    onZoomChange?.(zoom);
  }, [zoom, onZoomChange]);

  const clientToCanvas = useCallback(
    (cx: number, cy: number) => {
      const vp = viewportRef.current;
      if (!vp) return { x: 0, y: 0 };
      const rect = vp.getBoundingClientRect();
      const x = (cx - rect.left - pan.x) / zoom;
      const y = (cy - rect.top - pan.y) / zoom;
      return { x, y };
    },
    [pan, zoom],
  );

  const setZoomAt = useCallback(
    (newZoom: number, anchorClientX: number, anchorClientY: number) => {
      const vp = viewportRef.current;
      if (!vp) return;
      const rect = vp.getBoundingClientRect();
      const ax = anchorClientX - rect.left;
      const ay = anchorClientY - rect.top;
      const z = Math.max(0.1, Math.min(3, newZoom));
      const worldX = (ax - pan.x) / zoom;
      const worldY = (ay - pan.y) / zoom;
      setPan({ x: ax - worldX * z, y: ay - worldY * z });
      setZoom(z);
    },
    [pan, zoom],
  );

  useImperativeHandle(ref, () => ({
    resetView: () => {
      const vp = viewportRef.current;
      if (!vp) return;
      const vw = vp.clientWidth;
      const vh = vp.clientHeight;
      const z =
        Math.min(vw / layout.canvas.width, vh / layout.canvas.height) * 0.9;
      setZoom(z);
      setPan({
        x: (vw - layout.canvas.width * z) / 2,
        y: (vh - layout.canvas.height * z) / 2,
      });
    },
    fitToContent: () => {
      const vp = viewportRef.current;
      if (!vp || layout.items.length === 0) return;
      const b = boundsOf(layout.items);
      if (!b) return;
      const vw = vp.clientWidth;
      const vh = vp.clientHeight;
      const z = Math.min(vw / (b.width + 200), vh / (b.height + 200));
      const cz = Math.max(0.1, Math.min(3, z));
      setZoom(cz);
      setPan({
        x: vw / 2 - (b.x + b.width / 2) * cz,
        y: vh / 2 - (b.y + b.height / 2) * cz,
      });
    },
    zoomIn: () => {
      const vp = viewportRef.current;
      if (!vp) return;
      const r = vp.getBoundingClientRect();
      setZoomAt(zoom * 1.2, r.left + r.width / 2, r.top + r.height / 2);
    },
    zoomOut: () => {
      const vp = viewportRef.current;
      if (!vp) return;
      const r = vp.getBoundingClientRect();
      setZoomAt(zoom / 1.2, r.left + r.width / 2, r.top + r.height / 2);
    },
    getViewport: () => viewportRef.current,
    getStage: () => stageRef.current,
    getZoom: () => zoom,
    clientToCanvas,
  }));

  // Wheel zoom (passive: false so we can preventDefault)
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      setZoomAt(zoom * factor, e.clientX, e.clientY);
    };
    vp.addEventListener("wheel", handler, { passive: false });
    return () => vp.removeEventListener("wheel", handler);
  }, [zoom, setZoomAt]);

  // ---- Gesture state ----
  type Mode = "none" | "pan" | "drag" | "resize" | "rotate" | "pinch" | "marquee";
  const gesture = useRef<{
    mode: Mode;
    startClient: { x: number; y: number };
    startPan: { x: number; y: number };
    /** Per-item snapshots of the items being transformed. */
    snapshots: Map<string, LayoutItem>;
    /** For rotate: pivot in canvas space. */
    pivot?: { x: number; y: number };
    /** For rotate: starting pointer angle in degrees. */
    startAngle?: number;
    /** For resize: anchor (top-left) in canvas space (the group bounds origin). */
    resizeBounds?: Bounds;
    pointers: Map<number, { x: number; y: number }>;
    pinchStart?: {
      dist: number;
      zoom: number;
      midClient: { x: number; y: number };
    };
    /** Marquee start in canvas coords. */
    marqueeStart?: { x: number; y: number };
    /** Did the gesture actually mutate items? Drives history commit. */
    mutated: boolean;
  }>({
    mode: "none",
    startClient: { x: 0, y: 0 },
    startPan: { x: 0, y: 0 },
    snapshots: new Map(),
    pointers: new Map(),
    mutated: false,
  });

  const endGesture = useCallback(
    (e?: React.PointerEvent) => {
      const wasMutating =
        (gesture.current.mode === "drag" ||
          gesture.current.mode === "resize" ||
          gesture.current.mode === "rotate") &&
        gesture.current.mutated;
      gesture.current.mode = "none";
      gesture.current.snapshots.clear();
      gesture.current.mutated = false;
      setGuides([]);
      if (wasMutating) onGestureEnd();
      if (e) {
        try {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }
    },
    [onGestureEnd],
  );

  const onPointerDownViewport = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.dataset.role === "handle-resize" ||
      target.dataset.role === "handle-rotate"
    ) {
      return;
    }
    const itemEl = target.closest("[data-item-id]") as HTMLElement | null;
    const itemId = itemEl?.dataset.itemId ?? null;

    gesture.current.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Pinch zoom (touch)
    if (gesture.current.pointers.size === 2) {
      const pts = Array.from(gesture.current.pointers.values());
      const dx = pts[1].x - pts[0].x;
      const dy = pts[1].y - pts[0].y;
      gesture.current.mode = "pinch";
      gesture.current.pinchStart = {
        dist: Math.hypot(dx, dy),
        zoom,
        midClient: { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 },
      };
      try {
        (e.target as Element).setPointerCapture?.(e.pointerId);
      } catch {
        /* ignore */
      }
      return;
    }

    // Middle/right mouse OR shift+mouse = pan
    if (
      e.button === 1 ||
      e.button === 2 ||
      (e.pointerType === "mouse" && e.shiftKey && !itemId)
    ) {
      gesture.current.mode = "pan";
      gesture.current.startClient = { x: e.clientX, y: e.clientY };
      gesture.current.startPan = { ...pan };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      e.preventDefault();
      return;
    }

    if (itemId) {
      const item = layout.items.find((i) => i.id === itemId);
      if (!item) return;
      const additive = e.shiftKey || e.metaKey || e.ctrlKey;
      const groupSel = resolveSelectionFor(layout.items, itemId);
      let nextSelection: string[];
      if (additive) {
        const set = new Set(selectedIds);
        const allIn = groupSel.every((id) => set.has(id));
        if (allIn) {
          for (const id of groupSel) set.delete(id);
        } else {
          for (const id of groupSel) set.add(id);
        }
        nextSelection = Array.from(set);
      } else if (selectedSet.has(itemId)) {
        // already selected → keep current selection (allow group drag)
        nextSelection = selectedIds;
      } else {
        nextSelection = groupSel;
      }
      onSelectionChange(nextSelection);

      // Decide which items to drag: every selected id + their groupmates
      const dragSet = resolveDragSet(layout.items, new Set(nextSelection));
      // Don't start drag if everything in dragSet is locked
      const draggable = layout.items.filter(
        (i) => dragSet.has(i.id) && !i.locked,
      );
      if (draggable.length === 0) return;
      gesture.current.mode = "drag";
      gesture.current.startClient = { x: e.clientX, y: e.clientY };
      gesture.current.startPan = { ...pan };
      gesture.current.snapshots = new Map(
        draggable.map((i) => [i.id, { ...i }]),
      );
      gesture.current.mutated = false;
      onGestureStart();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      e.preventDefault();
      return;
    }

    // Background
    if (e.pointerType === "mouse") {
      // Mouse on background → start marquee select (deselect happens on up if no drag)
      const start = clientToCanvas(e.clientX, e.clientY);
      gesture.current.mode = "marquee";
      gesture.current.marqueeStart = start;
      gesture.current.startClient = { x: e.clientX, y: e.clientY };
      setMarquee({ x: start.x, y: start.y, w: 0, h: 0 });
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } else {
      // Touch on background → pan
      onSelectionChange([]);
      gesture.current.mode = "pan";
      gesture.current.startClient = { x: e.clientX, y: e.clientY };
      gesture.current.startPan = { ...pan };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const onPointerMoveViewport = (e: React.PointerEvent) => {
    if (gesture.current.pointers.has(e.pointerId)) {
      gesture.current.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (
      gesture.current.mode === "pinch" &&
      gesture.current.pinchStart &&
      gesture.current.pointers.size >= 2
    ) {
      const pts = Array.from(gesture.current.pointers.values()).slice(0, 2);
      const dx = pts[1].x - pts[0].x;
      const dy = pts[1].y - pts[0].y;
      const dist = Math.hypot(dx, dy);
      const factor = dist / gesture.current.pinchStart.dist;
      const newZoom = gesture.current.pinchStart.zoom * factor;
      const mid = gesture.current.pinchStart.midClient;
      setZoomAt(newZoom, mid.x, mid.y);
      return;
    }

    if (gesture.current.mode === "pan") {
      const dx = e.clientX - gesture.current.startClient.x;
      const dy = e.clientY - gesture.current.startClient.y;
      setPan({
        x: gesture.current.startPan.x + dx,
        y: gesture.current.startPan.y + dy,
      });
      return;
    }

    if (gesture.current.mode === "marquee" && gesture.current.marqueeStart) {
      const cur = clientToCanvas(e.clientX, e.clientY);
      const start = gesture.current.marqueeStart;
      const x = Math.min(start.x, cur.x);
      const y = Math.min(start.y, cur.y);
      const w = Math.abs(cur.x - start.x);
      const h = Math.abs(cur.y - start.y);
      setMarquee({ x, y, w, h });
      return;
    }

    if (gesture.current.mode === "drag" && gesture.current.snapshots.size > 0) {
      const dxRaw = (e.clientX - gesture.current.startClient.x) / zoom;
      const dyRaw = (e.clientY - gesture.current.startClient.y) / zoom;
      // Compute the moved bounds based on snapshot bounds + delta
      const snaps = Array.from(gesture.current.snapshots.values());
      const startBounds = boundsOf(snaps)!;
      const moving: Bounds = {
        x: startBounds.x + dxRaw,
        y: startBounds.y + dyRaw,
        width: startBounds.width,
        height: startBounds.height,
      };
      // Grid snap on the bounds origin
      let snappedX = snapTo(moving.x, layout.canvas.snap, layout.canvas.gridSize);
      let snappedY = snapTo(moving.y, layout.canvas.snap, layout.canvas.gridSize);
      // Alignment snap against other (non-moving) items
      const draggingIds = new Set(gesture.current.snapshots.keys());
      const others = layout.items.filter((i) => !draggingIds.has(i.id));
      const align = computeAlignment(
        { ...moving, x: snappedX, y: snappedY },
        others,
      );
      snappedX += align.dx;
      snappedY += align.dy;
      setGuides(align.guides);
      const dx = snappedX - startBounds.x;
      const dy = snappedY - startBounds.y;
      const patches: Record<string, Partial<LayoutItem>> = {};
      for (const snap of snaps) {
        patches[snap.id] = { x: snap.x + dx, y: snap.y + dy };
      }
      gesture.current.mutated = true;
      onUpdateItems(patches);
      return;
    }

    if (
      gesture.current.mode === "resize" &&
      gesture.current.resizeBounds &&
      gesture.current.snapshots.size > 0
    ) {
      const start = gesture.current.resizeBounds;
      const cur = clientToCanvas(e.clientX, e.clientY);
      const rawW = Math.max(8, cur.x - start.x);
      const rawH = Math.max(8, cur.y - start.y);
      const newW = Math.max(
        8,
        snapTo(rawW, layout.canvas.snap, layout.canvas.gridSize),
      );
      const newH = Math.max(
        8,
        snapTo(rawH, layout.canvas.snap, layout.canvas.gridSize),
      );
      const sx = newW / start.width;
      const sy = newH / start.height;
      const patches: Record<string, Partial<LayoutItem>> = {};
      for (const snap of gesture.current.snapshots.values()) {
        patches[snap.id] = {
          x: start.x + (snap.x - start.x) * sx,
          y: start.y + (snap.y - start.y) * sy,
          width: Math.max(4, snap.width * sx),
          height: Math.max(4, snap.height * sy),
        };
      }
      gesture.current.mutated = true;
      onUpdateItems(patches);
      return;
    }

    if (
      gesture.current.mode === "rotate" &&
      gesture.current.pivot &&
      gesture.current.startAngle !== undefined &&
      gesture.current.snapshots.size > 0
    ) {
      const { x: mx, y: my } = clientToCanvas(e.clientX, e.clientY);
      const pivot = gesture.current.pivot;
      const angle = (Math.atan2(my - pivot.y, mx - pivot.x) * 180) / Math.PI;
      let delta = angle - gesture.current.startAngle;
      if (e.shiftKey) delta = Math.round(delta / 15) * 15;
      const rad = (delta * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const patches: Record<string, Partial<LayoutItem>> = {};
      for (const snap of gesture.current.snapshots.values()) {
        const cx = snap.x + snap.width / 2;
        const cy = snap.y + snap.height / 2;
        // Rotate the item's center around pivot
        const dx = cx - pivot.x;
        const dy = cy - pivot.y;
        const ncx = pivot.x + dx * cos - dy * sin;
        const ncy = pivot.y + dx * sin + dy * cos;
        patches[snap.id] = {
          x: ncx - snap.width / 2,
          y: ncy - snap.height / 2,
          rotation: snap.rotation + delta,
        };
      }
      gesture.current.mutated = true;
      onUpdateItems(patches);
      return;
    }
  };

  const onPointerUpViewport = (e: React.PointerEvent) => {
    if (gesture.current.mode === "marquee") {
      // Resolve marquee selection
      const m = marquee;
      setMarquee(null);
      if (m && (m.w > 3 || m.h > 3)) {
        const inside = layout.items.filter(
          (i) =>
            i.x + i.width >= m.x &&
            i.x <= m.x + m.w &&
            i.y + i.height >= m.y &&
            i.y <= m.y + m.h,
        );
        // Expand to whole groups
        const ids = new Set<string>();
        const groupIds = new Set<string>();
        inside.forEach((i) => {
          ids.add(i.id);
          if (i.groupId) groupIds.add(i.groupId);
        });
        if (groupIds.size > 0) {
          for (const i of layout.items) {
            if (i.groupId && groupIds.has(i.groupId)) ids.add(i.id);
          }
        }
        const additive = e.shiftKey || e.metaKey || e.ctrlKey;
        if (additive) {
          onSelectionChange([...new Set([...selectedIds, ...ids])]);
        } else {
          onSelectionChange(Array.from(ids));
        }
      } else if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
        onSelectionChange([]);
      }
    }
    gesture.current.pointers.delete(e.pointerId);
    endGesture(e);
  };

  const onPointerCancelViewport = (e: React.PointerEvent) => {
    gesture.current.pointers.delete(e.pointerId);
    setMarquee(null);
    endGesture(e);
  };

  // ---- Selection bounds (for handles + outline) ----
  const selectionItems = useMemo(
    () => layout.items.filter((i) => selectedSet.has(i.id)),
    [layout.items, selectedSet],
  );
  const selectionBounds = useMemo(
    () => boundsOf(selectionItems),
    [selectionItems],
  );
  const allLocked =
    selectionItems.length > 0 && selectionItems.every((i) => i.locked);
  const singleSelection =
    selectionItems.length === 1 ? selectionItems[0] : null;

  const startResize = (e: React.PointerEvent) => {
    if (!selectionBounds || allLocked) return;
    e.stopPropagation();
    const draggable = selectionItems.filter((i) => !i.locked);
    gesture.current.mode = "resize";
    gesture.current.startClient = { x: e.clientX, y: e.clientY };
    gesture.current.snapshots = new Map(draggable.map((i) => [i.id, { ...i }]));
    gesture.current.resizeBounds = { ...selectionBounds };
    gesture.current.mutated = false;
    onGestureStart();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const startRotate = (e: React.PointerEvent) => {
    if (!selectionBounds || allLocked) return;
    e.stopPropagation();
    const draggable = selectionItems.filter((i) => !i.locked);
    const pivot = {
      x: selectionBounds.x + selectionBounds.width / 2,
      y: selectionBounds.y + selectionBounds.height / 2,
    };
    const { x: mx, y: my } = clientToCanvas(e.clientX, e.clientY);
    gesture.current.mode = "rotate";
    gesture.current.startClient = { x: e.clientX, y: e.clientY };
    gesture.current.snapshots = new Map(draggable.map((i) => [i.id, { ...i }]));
    gesture.current.pivot = pivot;
    gesture.current.startAngle =
      (Math.atan2(my - pivot.y, mx - pivot.x) * 180) / Math.PI;
    gesture.current.mutated = false;
    onGestureStart();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  return (
    <div
      ref={viewportRef}
      className="relative w-full h-full overflow-hidden bg-canvas no-select touch-none"
      onPointerDown={onPointerDownViewport}
      onPointerMove={onPointerMoveViewport}
      onPointerUp={onPointerUpViewport}
      onPointerCancel={onPointerCancelViewport}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        ref={stageRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: layout.canvas.width,
          height: layout.canvas.height,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          background: "hsl(var(--canvas-bg))",
          backgroundImage: layout.canvas.showGrid
            ? `radial-gradient(circle, hsl(var(--canvas-grid)) 1px, transparent 1px)`
            : undefined,
          backgroundSize: layout.canvas.showGrid
            ? `${layout.canvas.gridSize * 4}px ${layout.canvas.gridSize * 4}px`
            : undefined,
          boxShadow:
            "0 0 0 1px hsl(var(--border)), 0 8px 24px -8px rgba(0,0,0,0.08)",
        }}
      >
        {layout.items.map((it) => (
          <CanvasItem key={it.id} item={it} selected={selectedSet.has(it.id)} />
        ))}

        {/* Alignment guides */}
        {guides.map((g, i) =>
          g.axis === "x" ? (
            <div
              key={`gx-${i}-${g.pos}`}
              style={{
                position: "absolute",
                left: g.pos - 0.5 / zoom,
                top: 0,
                width: 1 / zoom,
                height: layout.canvas.height,
                background: "hsl(var(--selection))",
                pointerEvents: "none",
                opacity: 0.85,
              }}
            />
          ) : (
            <div
              key={`gy-${i}-${g.pos}`}
              style={{
                position: "absolute",
                top: g.pos - 0.5 / zoom,
                left: 0,
                height: 1 / zoom,
                width: layout.canvas.width,
                background: "hsl(var(--selection))",
                pointerEvents: "none",
                opacity: 0.85,
              }}
            />
          ),
        )}

        {/* Marquee */}
        {marquee && (
          <div
            style={{
              position: "absolute",
              left: marquee.x,
              top: marquee.y,
              width: marquee.w,
              height: marquee.h,
              background: "hsl(var(--selection) / 0.12)",
              border: `${1 / zoom}px solid hsl(var(--selection))`,
              pointerEvents: "none",
            }}
          />
        )}

        {/* Selection bounding box + handles */}
        {selectionBounds && selectionItems.length > 0 && (
          <div
            style={{
              position: "absolute",
              left: selectionBounds.x,
              top: selectionBounds.y,
              width: selectionBounds.width,
              height: selectionBounds.height,
              pointerEvents: "none",
              zIndex: 99999,
              outline:
                selectionItems.length > 1 || !singleSelection
                  ? `${1.5 / zoom}px dashed hsl(var(--selection))`
                  : "none",
              outlineOffset: `${4 / zoom}px`,
            }}
          >
            {!allLocked && (
              <>
                <div
                  data-role="handle-resize"
                  onPointerDown={startResize}
                  style={{
                    position: "absolute",
                    right: -8 / zoom,
                    bottom: -8 / zoom,
                    width: 16 / zoom,
                    height: 16 / zoom,
                    background: "hsl(var(--selection))",
                    border: `${2 / zoom}px solid white`,
                    borderRadius: 4 / zoom,
                    cursor: "nwse-resize",
                    pointerEvents: "auto",
                  }}
                />
                <div
                  data-role="handle-rotate"
                  onPointerDown={startRotate}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: -32 / zoom,
                    width: 18 / zoom,
                    height: 18 / zoom,
                    marginLeft: -9 / zoom,
                    background: "white",
                    border: `${2 / zoom}px solid hsl(var(--selection))`,
                    borderRadius: "50%",
                    cursor: "grab",
                    pointerEvents: "auto",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: -22 / zoom,
                    width: 0,
                    height: 14 / zoom,
                    borderLeft: `${1.5 / zoom}px solid hsl(var(--selection))`,
                    pointerEvents: "none",
                  }}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
});