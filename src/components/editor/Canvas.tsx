import { forwardRef, useEffect, useImperativeHandle, useRef, useState, useCallback } from "react";
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
  /** convert client (x,y) to canvas coords */
  clientToCanvas: (cx: number, cy: number) => { x: number; y: number };
}

interface Props {
  layout: Layout;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateItem: (id: string, patch: Partial<LayoutItem>) => void;
  onZoomChange?: (z: number) => void;
}

function snap(v: number, on: boolean, step: number) {
  if (!on) return v;
  return Math.round(v / step) * step;
}

export const Canvas = forwardRef<CanvasHandle, Props>(function Canvas(
  { layout, selectedId, onSelect, onUpdateItem, onZoomChange },
  ref,
) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.4);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Initial fit-to-canvas-center
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const vw = vp.clientWidth;
    const vh = vp.clientHeight;
    const initialZoom = Math.min(vw / layout.canvas.width, vh / layout.canvas.height) * 0.9;
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
      const z = Math.min(vw / layout.canvas.width, vh / layout.canvas.height) * 0.9;
      setZoom(z);
      setPan({
        x: (vw - layout.canvas.width * z) / 2,
        y: (vh - layout.canvas.height * z) / 2,
      });
    },
    fitToContent: () => {
      const vp = viewportRef.current;
      if (!vp || layout.items.length === 0) return;
      const minX = Math.min(...layout.items.map((i) => i.x));
      const minY = Math.min(...layout.items.map((i) => i.y));
      const maxX = Math.max(...layout.items.map((i) => i.x + i.width));
      const maxY = Math.max(...layout.items.map((i) => i.y + i.height));
      const w = maxX - minX;
      const h = maxY - minY;
      const vw = vp.clientWidth;
      const vh = vp.clientHeight;
      const z = Math.min(vw / (w + 100), vh / (h + 100));
      const cz = Math.max(0.1, Math.min(3, z));
      setZoom(cz);
      setPan({
        x: vw / 2 - (minX + w / 2) * cz,
        y: vh / 2 - (minY + h / 2) * cz,
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

  // Wheel zoom
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) > 0) {
        const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
        setZoomAt(zoom * factor, e.clientX, e.clientY);
      }
    };
    vp.addEventListener("wheel", handler, { passive: false });
    return () => vp.removeEventListener("wheel", handler);
  }, [zoom, setZoomAt]);

  // Pan + pinch
  const gesture = useRef<{
    mode: "none" | "pan" | "drag" | "resize" | "rotate" | "pinch";
    startClient: { x: number; y: number };
    startPan: { x: number; y: number };
    targetId?: string;
    startItem?: LayoutItem;
    pointers?: Map<number, { x: number; y: number }>;
    pinchStart?: { dist: number; zoom: number; midClient: { x: number; y: number } };
    handle?: "br" | "rot";
  }>({ mode: "none", startClient: { x: 0, y: 0 }, startPan: { x: 0, y: 0 } });

  const onPointerDownViewport = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.dataset.role === "handle-resize" || target.dataset.role === "handle-rotate") {
      return; // handled by handle pointer events
    }
    const itemEl = target.closest("[data-item-id]") as HTMLElement | null;
    const itemId = itemEl?.dataset.itemId ?? null;

    // Two-finger / pinch
    if (!gesture.current.pointers) gesture.current.pointers = new Map();
    gesture.current.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

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
      (e.target as Element).setPointerCapture?.(e.pointerId);
      return;
    }

    if (e.button === 1 || e.button === 2 || (e.pointerType === "mouse" && e.shiftKey)) {
      gesture.current = {
        ...gesture.current,
        mode: "pan",
        startClient: { x: e.clientX, y: e.clientY },
        startPan: { ...pan },
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      e.preventDefault();
      return;
    }

    if (itemId) {
      const item = layout.items.find((i) => i.id === itemId);
      if (!item) return;
      onSelect(itemId);
      if (item.locked) return;
      gesture.current = {
        ...gesture.current,
        mode: "drag",
        startClient: { x: e.clientX, y: e.clientY },
        startPan: { ...pan },
        targetId: itemId,
        startItem: { ...item },
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      e.preventDefault();
    } else {
      // Background → pan on touch, otherwise deselect
      onSelect(null);
      if (e.pointerType !== "mouse") {
        gesture.current = {
          ...gesture.current,
          mode: "pan",
          startClient: { x: e.clientX, y: e.clientY },
          startPan: { ...pan },
        };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }
    }
  };

  const onPointerMoveViewport = (e: React.PointerEvent) => {
    if (gesture.current.pointers?.has(e.pointerId)) {
      gesture.current.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (gesture.current.mode === "pinch" && gesture.current.pointers && gesture.current.pinchStart) {
      const pts = Array.from(gesture.current.pointers.values()).slice(0, 2);
      if (pts.length < 2) return;
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
      setPan({ x: gesture.current.startPan.x + dx, y: gesture.current.startPan.y + dy });
      return;
    }

    if (gesture.current.mode === "drag" && gesture.current.targetId && gesture.current.startItem) {
      const dx = (e.clientX - gesture.current.startClient.x) / zoom;
      const dy = (e.clientY - gesture.current.startClient.y) / zoom;
      const it = gesture.current.startItem;
      const nx = snap(it.x + dx, layout.canvas.snap, layout.canvas.gridSize);
      const ny = snap(it.y + dy, layout.canvas.snap, layout.canvas.gridSize);
      onUpdateItem(gesture.current.targetId, { x: nx, y: ny });
      return;
    }

    if (gesture.current.mode === "resize" && gesture.current.targetId && gesture.current.startItem) {
      const dx = (e.clientX - gesture.current.startClient.x) / zoom;
      const dy = (e.clientY - gesture.current.startClient.y) / zoom;
      const it = gesture.current.startItem;
      const nw = Math.max(8, snap(it.width + dx, layout.canvas.snap, layout.canvas.gridSize));
      const nh = Math.max(8, snap(it.height + dy, layout.canvas.snap, layout.canvas.gridSize));
      onUpdateItem(gesture.current.targetId, { width: nw, height: nh });
      return;
    }

    if (gesture.current.mode === "rotate" && gesture.current.targetId && gesture.current.startItem) {
      const it = gesture.current.startItem;
      const cx = it.x + it.width / 2;
      const cy = it.y + it.height / 2;
      const { x: mx, y: my } = clientToCanvas(e.clientX, e.clientY);
      const angle = (Math.atan2(my - cy, mx - cx) * 180) / Math.PI + 90;
      const snapped = e.shiftKey ? Math.round(angle / 15) * 15 : Math.round(angle);
      onUpdateItem(gesture.current.targetId, { rotation: snapped });
      return;
    }
  };

  const endPointer = (e: React.PointerEvent) => {
    gesture.current.pointers?.delete(e.pointerId);
    if ((gesture.current.pointers?.size ?? 0) < 2 && gesture.current.mode === "pinch") {
      gesture.current.mode = "none";
    } else {
      gesture.current.mode = "none";
    }
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const startResize = (e: React.PointerEvent) => {
    if (!selectedId) return;
    const item = layout.items.find((i) => i.id === selectedId);
    if (!item || item.locked) return;
    e.stopPropagation();
    gesture.current = {
      ...gesture.current,
      mode: "resize",
      startClient: { x: e.clientX, y: e.clientY },
      startPan: { ...pan },
      targetId: selectedId,
      startItem: { ...item },
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const startRotate = (e: React.PointerEvent) => {
    if (!selectedId) return;
    const item = layout.items.find((i) => i.id === selectedId);
    if (!item || item.locked) return;
    e.stopPropagation();
    gesture.current = {
      ...gesture.current,
      mode: "rotate",
      startClient: { x: e.clientX, y: e.clientY },
      startPan: { ...pan },
      targetId: selectedId,
      startItem: { ...item },
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const selectedItem = layout.items.find((i) => i.id === selectedId);

  return (
    <div
      ref={viewportRef}
      className="relative w-full h-full overflow-hidden bg-canvas no-select touch-none"
      onPointerDown={onPointerDownViewport}
      onPointerMove={onPointerMoveViewport}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
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
          backgroundSize: layout.canvas.showGrid ? `${layout.canvas.gridSize * 4}px ${layout.canvas.gridSize * 4}px` : undefined,
          boxShadow: "0 0 0 1px hsl(var(--border)), 0 8px 24px -8px rgba(0,0,0,0.08)",
        }}
      >
        {layout.items.map((it) => (
          <CanvasItem key={it.id} item={it} selected={it.id === selectedId} />
        ))}

        {selectedItem && (
          <div
            style={{
              position: "absolute",
              left: selectedItem.x,
              top: selectedItem.y,
              width: selectedItem.width,
              height: selectedItem.height,
              transform: `rotate(${selectedItem.rotation}deg)`,
              transformOrigin: "center center",
              pointerEvents: "none",
              zIndex: 99999,
            }}
          >
            {/* Resize handle (bottom-right) */}
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
            {/* Rotate handle (top center) */}
            <div
              data-role="handle-rotate"
              onPointerDown={startRotate}
              style={{
                position: "absolute",
                left: "50%",
                top: -28 / zoom,
                width: 16 / zoom,
                height: 16 / zoom,
                marginLeft: -8 / zoom,
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
                top: -20 / zoom,
                width: 0,
                height: 12 / zoom,
                borderLeft: `${1.5 / zoom}px solid hsl(var(--selection))`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
});