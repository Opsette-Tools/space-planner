export type LayoutType = "floor" | "event" | "garden" | "seating" | "general";

export type ItemCategory =
  | "rooms"
  | "furniture"
  | "event"
  | "landscape"
  | "structural"
  | "labels";

export type BorderStyle = "none" | "solid" | "dashed";

export interface ItemStyle {
  fill: string;
  stroke: string;
  strokeStyle: BorderStyle;
  opacity: number;
}

export interface LayoutItem {
  id: string;
  type: string;
  category: ItemCategory;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  label: string;
  locked: boolean;
  style: ItemStyle;
  notes?: string;
  /** If set, this item belongs to a group. All items sharing the same groupId
   *  are selected and transformed together. */
  groupId?: string;
}

export interface CanvasSettings {
  width: number;
  height: number;
  showGrid: boolean;
  snap: boolean;
  gridSize: number;
}

/** A background tracing image (imported from PNG/JPG/PDF) that sits behind
 *  every LayoutItem. One per layout. */
export interface ReferenceImage {
  /** base64 PNG data URL. PDFs are rasterized to PNG at import time. */
  dataUrl: string;
  /** Top-left in canvas coordinates. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** 0 – 1. 0.4 by default so it's visible but doesn't compete with work. */
  opacity: number;
  visible: boolean;
  /** When locked, the image ignores pointer events on the canvas. Default ON. */
  locked: boolean;
}

export interface Layout {
  id: string;
  name: string;
  type: LayoutType;
  createdAt: number;
  updatedAt: number;
  canvas: CanvasSettings;
  items: LayoutItem[];
  thumbnail?: string;
  /** When true (default), the editor does NOT autosave. The user clicks Save
   *  (or Cmd/Ctrl+S) to persist. When false, changes autosave after a debounce. */
  manualSave?: boolean;
  /** Optional tracing image behind items. */
  reference?: ReferenceImage;
}

export const LAYOUT_TYPE_LABEL: Record<LayoutType, string> = {
  floor: "Floor plan",
  event: "Event",
  garden: "Garden",
  seating: "Seating",
  general: "General",
};

export const CATEGORY_LABEL: Record<ItemCategory, string> = {
  rooms: "Rooms",
  furniture: "Furniture",
  event: "Event",
  landscape: "Landscape",
  structural: "Structural",
  labels: "Labels",
};