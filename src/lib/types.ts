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

export interface Layout {
  id: string;
  name: string;
  type: LayoutType;
  createdAt: number;
  updatedAt: number;
  canvas: CanvasSettings;
  items: LayoutItem[];
  thumbnail?: string;
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