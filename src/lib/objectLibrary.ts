import type { ItemCategory, LayoutItem } from "./types";

export interface LibraryDef {
  type: string;
  category: ItemCategory;
  label: string;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  shape?: "rect" | "circle" | "rounded" | "line" | "label" | "marker";
  /** Optional sub-grouping label shown as a header inside the category panel. */
  subgroup?: string;
}

const C = {
  room: "#e8e3d6",
  roomStroke: "#9a8f78",
  furniture: "#c8d3e0",
  furnitureStroke: "#5b6b80",
  event: "#d8cce8",
  eventStroke: "#6b5a86",
  landscape: "#cee0c8",
  landscapeStroke: "#5a7a4e",
  structural: "#b8b8b8",
  structuralStroke: "#555555",
  water: "#bcd9e8",
  waterStroke: "#3d6a85",
  label: "#fff8d8",
  labelStroke: "#a89968",
};

export const LIBRARY: LibraryDef[] = [
  // Rooms / Zones
  { type: "room-rect", category: "rooms", label: "Rectangle Room", width: 320, height: 220, fill: C.room, stroke: C.roomStroke, shape: "rect" },
  { type: "room-square", category: "rooms", label: "Square Room", width: 240, height: 240, fill: C.room, stroke: C.roomStroke, shape: "rect" },
  { type: "room-rounded", category: "rooms", label: "Rounded Room", width: 300, height: 200, fill: C.room, stroke: C.roomStroke, shape: "rounded" },
  { type: "room-open", category: "rooms", label: "Open Zone", width: 280, height: 200, fill: "#f0ead8", stroke: C.roomStroke, shape: "rounded" },
  { type: "room-labeled", category: "rooms", label: "Labeled Zone", width: 260, height: 180, fill: "#ece5cf", stroke: C.roomStroke, shape: "rect" },

  // Furniture — Seating
  { type: "chair", category: "furniture", subgroup: "Seating", label: "Chair", width: 32, height: 32, fill: C.furniture, stroke: C.furnitureStroke, shape: "rounded" },
  { type: "armchair", category: "furniture", subgroup: "Seating", label: "Armchair", width: 60, height: 60, fill: C.furniture, stroke: C.furnitureStroke, shape: "rounded" },
  { type: "sofa", category: "furniture", subgroup: "Seating", label: "Sofa", width: 160, height: 60, fill: C.furniture, stroke: C.furnitureStroke, shape: "rounded" },
  { type: "bench", category: "furniture", subgroup: "Seating", label: "Bench", width: 140, height: 36, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },

  // Furniture — Tables
  { type: "table-round", category: "furniture", subgroup: "Tables", label: "Round Table", width: 80, height: 80, fill: C.furniture, stroke: C.furnitureStroke, shape: "circle" },
  { type: "table-rect", category: "furniture", subgroup: "Tables", label: "Rect Table", width: 120, height: 60, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "coffee-table", category: "furniture", subgroup: "Tables", label: "Coffee Table", width: 100, height: 50, fill: C.furniture, stroke: C.furnitureStroke, shape: "rounded" },
  { type: "desk", category: "furniture", subgroup: "Tables", label: "Desk", width: 140, height: 60, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },

  // Furniture — Storage
  { type: "dresser", category: "furniture", subgroup: "Storage", label: "Dresser", width: 160, height: 50, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "credenza", category: "furniture", subgroup: "Storage", label: "Credenza", width: 200, height: 50, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "bookshelf", category: "furniture", subgroup: "Storage", label: "Bookshelf", width: 120, height: 36, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "tv-stand", category: "furniture", subgroup: "Storage", label: "TV Stand", width: 140, height: 40, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },

  // Furniture — Bedroom
  { type: "bed", category: "furniture", subgroup: "Bedroom", label: "Bed", width: 160, height: 200, fill: "#f0e8d8", stroke: C.furnitureStroke, shape: "rect" },
  { type: "nightstand", category: "furniture", subgroup: "Bedroom", label: "Nightstand", width: 40, height: 40, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },

  // Event
  { type: "stage", category: "event", label: "Stage", width: 240, height: 120, fill: C.event, stroke: C.eventStroke, shape: "rect" },
  { type: "booth", category: "event", label: "Booth", width: 120, height: 120, fill: C.event, stroke: C.eventStroke, shape: "rect" },
  { type: "podium", category: "event", label: "Podium", width: 60, height: 60, fill: C.event, stroke: C.eventStroke, shape: "rounded" },
  { type: "buffet", category: "event", label: "Buffet / Bar", width: 200, height: 50, fill: C.event, stroke: C.eventStroke, shape: "rect" },
  { type: "registration", category: "event", label: "Registration", width: 140, height: 50, fill: C.event, stroke: C.eventStroke, shape: "rect" },
  { type: "dance-floor", category: "event", label: "Dance Floor", width: 220, height: 220, fill: "#e8d8e8", stroke: C.eventStroke, shape: "rect" },

  // Landscape
  { type: "tree", category: "landscape", label: "Tree", width: 70, height: 70, fill: C.landscape, stroke: C.landscapeStroke, shape: "circle" },
  { type: "shrub", category: "landscape", label: "Shrub", width: 50, height: 50, fill: "#b8d0a8", stroke: C.landscapeStroke, shape: "circle" },
  { type: "garden-bed", category: "landscape", label: "Garden Bed", width: 200, height: 90, fill: "#d6c8a8", stroke: "#8a7a4a", shape: "rounded" },
  { type: "planter", category: "landscape", label: "Planter", width: 60, height: 60, fill: "#c8a888", stroke: "#7a5a3a", shape: "rect" },
  { type: "patio", category: "landscape", label: "Patio", width: 240, height: 180, fill: "#d8d0c0", stroke: "#888070", shape: "rect" },
  { type: "path", category: "landscape", label: "Path", width: 200, height: 40, fill: "#d8cca8", stroke: "#8a7a55", shape: "rect" },
  { type: "fence", category: "landscape", label: "Fence", width: 160, height: 8, fill: "#a08868", stroke: "#5a4a35", shape: "rect" },
  { type: "water", category: "landscape", label: "Water Feature", width: 160, height: 100, fill: C.water, stroke: C.waterStroke, shape: "rounded" },

  // Structural
  { type: "wall", category: "structural", label: "Wall", width: 200, height: 8, fill: C.structural, stroke: C.structuralStroke, shape: "rect" },
  { type: "door", category: "structural", label: "Door", width: 50, height: 8, fill: "#d8b888", stroke: "#7a5a35", shape: "rect" },
  { type: "window", category: "structural", label: "Window", width: 80, height: 8, fill: C.water, stroke: C.waterStroke, shape: "rect" },
  { type: "divider", category: "structural", label: "Divider", width: 140, height: 6, fill: "#bcbcbc", stroke: "#666666", shape: "rect" },

  // Labels / Markers
  { type: "label-text", category: "labels", label: "Label", width: 120, height: 36, fill: C.label, stroke: C.labelStroke, shape: "label" },
  { type: "marker-num", category: "labels", label: "Marker", width: 40, height: 40, fill: "#ffd766", stroke: "#a87a1a", shape: "marker" },
  { type: "marker-icon", category: "labels", label: "Icon Marker", width: 40, height: 40, fill: "#ffe6a8", stroke: "#a87a1a", shape: "marker" },
];

export function findDef(type: string): LibraryDef | undefined {
  return LIBRARY.find((d) => d.type === type);
}

export function makeItem(
  def: LibraryDef,
  x: number,
  y: number,
  zIndex: number,
  idGen: () => string,
): LayoutItem {
  return {
    id: idGen(),
    type: def.type,
    category: def.category,
    x: Math.round(x - def.width / 2),
    y: Math.round(y - def.height / 2),
    width: def.width,
    height: def.height,
    rotation: 0,
    zIndex,
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
}