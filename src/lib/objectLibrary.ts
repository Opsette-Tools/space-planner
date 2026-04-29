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
  { type: "loveseat", category: "furniture", subgroup: "Seating", label: "Loveseat", width: 120, height: 60, fill: C.furniture, stroke: C.furnitureStroke, shape: "rounded" },
  { type: "sectional", category: "furniture", subgroup: "Seating", label: "Sectional", width: 220, height: 180, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "bench", category: "furniture", subgroup: "Seating", label: "Bench", width: 140, height: 36, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },

  // Furniture — Tables
  { type: "table-round", category: "furniture", subgroup: "Tables", label: "Round Table", width: 80, height: 80, fill: C.furniture, stroke: C.furnitureStroke, shape: "circle" },
  { type: "table-rect", category: "furniture", subgroup: "Tables", label: "Rect Table", width: 120, height: 60, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "table-square", category: "furniture", subgroup: "Tables", label: "Square Table", width: 90, height: 90, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "coffee-table", category: "furniture", subgroup: "Tables", label: "Coffee Table", width: 100, height: 50, fill: C.furniture, stroke: C.furnitureStroke, shape: "rounded" },
  { type: "side-table", category: "furniture", subgroup: "Tables", label: "Side Table", width: 44, height: 44, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "desk", category: "furniture", subgroup: "Tables", label: "Desk", width: 140, height: 60, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "l-desk", category: "furniture", subgroup: "Tables", label: "L-Desk", width: 160, height: 160, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "conference-table-oval", category: "furniture", subgroup: "Tables", label: "Conference Table (Oval)", width: 240, height: 120, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "conference-table-rect", category: "furniture", subgroup: "Tables", label: "Conference Table (Rect)", width: 240, height: 120, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },

  // Furniture — Dining
  { type: "dining-round-4", category: "furniture", subgroup: "Dining", label: "Round Dining (4)", width: 160, height: 160, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "dining-rect-6", category: "furniture", subgroup: "Dining", label: "Rect Dining (6)", width: 200, height: 200, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "dining-chair", category: "furniture", subgroup: "Dining", label: "Dining Chair", width: 40, height: 40, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "bar-counter", category: "furniture", subgroup: "Dining", label: "Bar Counter", width: 200, height: 80, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "bar-stool", category: "furniture", subgroup: "Dining", label: "Bar Stool", width: 40, height: 40, fill: C.furniture, stroke: C.furnitureStroke, shape: "circle" },

  // Furniture — Office
  { type: "office-chair", category: "furniture", subgroup: "Office", label: "Office Chair", width: 50, height: 50, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "filing-cabinet", category: "furniture", subgroup: "Office", label: "Filing Cabinet", width: 50, height: 80, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },

  // Furniture — Storage
  { type: "dresser", category: "furniture", subgroup: "Storage", label: "Dresser", width: 160, height: 50, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "credenza", category: "furniture", subgroup: "Storage", label: "Credenza", width: 200, height: 50, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "bookshelf", category: "furniture", subgroup: "Storage", label: "Bookshelf", width: 120, height: 36, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "cabinet", category: "furniture", subgroup: "Storage", label: "Cabinet", width: 80, height: 40, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "closet", category: "furniture", subgroup: "Storage", label: "Closet", width: 160, height: 60, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "wardrobe", category: "furniture", subgroup: "Storage", label: "Wardrobe", width: 120, height: 60, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "tv-stand", category: "furniture", subgroup: "Storage", label: "TV Stand", width: 140, height: 40, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "fireplace", category: "furniture", subgroup: "Storage", label: "Fireplace", width: 160, height: 50, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },

  // Furniture — Bedroom
  { type: "bed", category: "furniture", subgroup: "Bedroom", label: "Bed", width: 160, height: 200, fill: "#f0e8d8", stroke: C.furnitureStroke, shape: "rect" },
  { type: "bed-king", category: "furniture", subgroup: "Bedroom", label: "King Bed", width: 180, height: 200, fill: "#f0e8d8", stroke: C.furnitureStroke, shape: "rect" },
  { type: "bed-queen", category: "furniture", subgroup: "Bedroom", label: "Queen Bed", width: 150, height: 200, fill: "#f0e8d8", stroke: C.furnitureStroke, shape: "rect" },
  { type: "bed-twin", category: "furniture", subgroup: "Bedroom", label: "Twin Bed", width: 90, height: 200, fill: "#f0e8d8", stroke: C.furnitureStroke, shape: "rect" },
  { type: "nightstand", category: "furniture", subgroup: "Bedroom", label: "Nightstand", width: 40, height: 40, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },

  // Furniture — Kitchen
  { type: "stove", category: "furniture", subgroup: "Kitchen", label: "Stove / Range", width: 60, height: 60, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "oven", category: "furniture", subgroup: "Kitchen", label: "Oven", width: 60, height: 60, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "microwave", category: "furniture", subgroup: "Kitchen", label: "Microwave", width: 55, height: 35, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "fridge", category: "furniture", subgroup: "Kitchen", label: "Refrigerator", width: 70, height: 70, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "kitchen-counter", category: "furniture", subgroup: "Kitchen", label: "Kitchen Counter", width: 140, height: 50, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "kitchen-counter-l", category: "furniture", subgroup: "Kitchen", label: "Counter (L-shape)", width: 160, height: 160, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "kitchen-island", category: "furniture", subgroup: "Kitchen", label: "Kitchen Island", width: 180, height: 70, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "kitchen-sink", category: "furniture", subgroup: "Kitchen", label: "Double Sink", width: 60, height: 45, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "kitchen-sink-single", category: "furniture", subgroup: "Kitchen", label: "Single Sink", width: 55, height: 45, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "dishwasher", category: "furniture", subgroup: "Kitchen", label: "Dishwasher", width: 55, height: 55, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },

  // Furniture — Bathroom
  { type: "toilet", category: "furniture", subgroup: "Bathroom", label: "Toilet", width: 40, height: 60, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "sink", category: "furniture", subgroup: "Bathroom", label: "Wall Sink", width: 55, height: 40, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "pedestal-sink", category: "furniture", subgroup: "Bathroom", label: "Pedestal Sink", width: 55, height: 55, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "vanity", category: "furniture", subgroup: "Bathroom", label: "Double Vanity", width: 120, height: 50, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "bathtub", category: "furniture", subgroup: "Bathroom", label: "Bathtub", width: 140, height: 70, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "shower", category: "furniture", subgroup: "Bathroom", label: "Walk-in Shower", width: 80, height: 80, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },
  { type: "corner-shower", category: "furniture", subgroup: "Bathroom", label: "Corner Shower", width: 80, height: 80, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },

  // Event — Seating
  { type: "banquet-round-8", category: "event", subgroup: "Seating", label: "Banquet Round (8)", width: 160, height: 160, fill: C.event, stroke: C.eventStroke, shape: "circle" },
  { type: "banquet-round-10", category: "event", subgroup: "Seating", label: "Banquet Round (10)", width: 180, height: 180, fill: C.event, stroke: C.eventStroke, shape: "circle" },
  { type: "long-table-seating", category: "event", subgroup: "Seating", label: "Long Table Seating", width: 240, height: 100, fill: C.event, stroke: C.eventStroke, shape: "rect" },
  { type: "theater-chair", category: "event", subgroup: "Seating", label: "Theater Chair", width: 40, height: 40, fill: C.event, stroke: C.eventStroke, shape: "rect" },
  { type: "ceremony-chair", category: "event", subgroup: "Seating", label: "Ceremony Chair", width: 36, height: 40, fill: C.event, stroke: C.eventStroke, shape: "rect" },

  // Event — Tables
  { type: "cocktail-round", category: "event", subgroup: "Tables", label: "Cocktail Round", width: 70, height: 70, fill: C.event, stroke: C.eventStroke, shape: "circle" },
  { type: "buffet", category: "event", subgroup: "Tables", label: "Buffet Table", width: 240, height: 60, fill: C.event, stroke: C.eventStroke, shape: "rect" },
  { type: "event-bar", category: "event", subgroup: "Tables", label: "Event Bar", width: 240, height: 80, fill: C.event, stroke: C.eventStroke, shape: "rect" },

  // Event — Stage
  { type: "stage", category: "event", subgroup: "Stage", label: "Stage / Riser", width: 240, height: 120, fill: C.event, stroke: C.eventStroke, shape: "rect" },
  { type: "podium", category: "event", subgroup: "Stage", label: "Podium", width: 60, height: 60, fill: C.event, stroke: C.eventStroke, shape: "rounded" },
  { type: "dj-booth", category: "event", subgroup: "Stage", label: "DJ Booth", width: 140, height: 70, fill: C.event, stroke: C.eventStroke, shape: "rect" },
  { type: "dance-floor", category: "event", subgroup: "Stage", label: "Dance Floor", width: 220, height: 220, fill: "#e8d8e8", stroke: C.eventStroke, shape: "rect" },

  // Event — Service
  { type: "registration", category: "event", subgroup: "Service", label: "Registration Desk", width: 140, height: 50, fill: C.event, stroke: C.eventStroke, shape: "rect" },
  { type: "booth", category: "event", subgroup: "Service", label: "Booth / Exhibit", width: 120, height: 120, fill: C.event, stroke: C.eventStroke, shape: "rect" },
  { type: "coat-check", category: "event", subgroup: "Service", label: "Coat Check", width: 160, height: 50, fill: C.event, stroke: C.eventStroke, shape: "rect" },

  // Landscape — Plants
  { type: "tree", category: "landscape", subgroup: "Plants", label: "Tree", width: 70, height: 70, fill: C.landscape, stroke: C.landscapeStroke, shape: "circle" },
  { type: "shrub", category: "landscape", subgroup: "Plants", label: "Shrub", width: 50, height: 50, fill: "#b8d0a8", stroke: C.landscapeStroke, shape: "circle" },
  { type: "hedge", category: "landscape", subgroup: "Plants", label: "Hedge", width: 200, height: 50, fill: "#b8d0a8", stroke: C.landscapeStroke, shape: "rounded" },
  { type: "garden-bed", category: "landscape", subgroup: "Plants", label: "Garden Bed", width: 200, height: 90, fill: "#d6c8a8", stroke: "#8a7a4a", shape: "rounded" },
  { type: "planter", category: "landscape", subgroup: "Plants", label: "Planter", width: 60, height: 60, fill: "#c8a888", stroke: "#7a5a3a", shape: "rect" },
  { type: "potted-plant", category: "landscape", subgroup: "Plants", label: "Potted Plant", width: 60, height: 60, fill: C.landscape, stroke: C.landscapeStroke, shape: "circle" },

  // Landscape — Hardscape
  { type: "patio", category: "landscape", subgroup: "Hardscape", label: "Patio", width: 240, height: 180, fill: "#d8d0c0", stroke: "#888070", shape: "rect" },
  { type: "deck", category: "landscape", subgroup: "Hardscape", label: "Deck", width: 240, height: 160, fill: "#c8a878", stroke: "#7a5a3a", shape: "rect" },
  { type: "path", category: "landscape", subgroup: "Hardscape", label: "Path", width: 200, height: 40, fill: "#d8cca8", stroke: "#8a7a55", shape: "rect" },
  { type: "walkway", category: "landscape", subgroup: "Hardscape", label: "Walkway", width: 80, height: 240, fill: "#d8cca8", stroke: "#8a7a55", shape: "rect" },
  { type: "driveway", category: "landscape", subgroup: "Hardscape", label: "Driveway", width: 120, height: 300, fill: "#a8a8a8", stroke: "#555555", shape: "rect" },
  { type: "fence", category: "landscape", subgroup: "Hardscape", label: "Fence", width: 160, height: 8, fill: "#a08868", stroke: "#5a4a35", shape: "rect" },
  { type: "retaining-wall", category: "landscape", subgroup: "Hardscape", label: "Retaining Wall", width: 200, height: 30, fill: "#b89868", stroke: "#6a4a25", shape: "rect" },

  // Landscape — Water
  { type: "water", category: "landscape", subgroup: "Water", label: "Water Feature", width: 160, height: 100, fill: C.water, stroke: C.waterStroke, shape: "rounded" },
  { type: "pool", category: "landscape", subgroup: "Water", label: "Pool", width: 300, height: 160, fill: C.water, stroke: C.waterStroke, shape: "rounded" },
  { type: "hot-tub", category: "landscape", subgroup: "Water", label: "Hot Tub", width: 120, height: 120, fill: C.water, stroke: C.waterStroke, shape: "rounded" },
  { type: "pond", category: "landscape", subgroup: "Water", label: "Pond", width: 200, height: 140, fill: C.water, stroke: C.waterStroke, shape: "rounded" },
  { type: "fountain", category: "landscape", subgroup: "Water", label: "Fountain", width: 100, height: 100, fill: C.water, stroke: C.waterStroke, shape: "circle" },
  { type: "stream", category: "landscape", subgroup: "Water", label: "Stream", width: 280, height: 80, fill: C.water, stroke: C.waterStroke, shape: "rect" },

  // Landscape — Outdoor Living
  { type: "grill", category: "landscape", subgroup: "Outdoor Living", label: "Grill", width: 70, height: 50, fill: "#6c6c70", stroke: "#2e2e32", shape: "rounded" },
  { type: "fire-pit", category: "landscape", subgroup: "Outdoor Living", label: "Fire Pit", width: 80, height: 80, fill: "#8a6a55", stroke: "#4a3525", shape: "circle" },
  { type: "umbrella", category: "landscape", subgroup: "Outdoor Living", label: "Patio Umbrella", width: 110, height: 110, fill: "#e8b888", stroke: "#8a5a35", shape: "circle" },
  { type: "outdoor-dining-set", category: "landscape", subgroup: "Outdoor Living", label: "Outdoor Dining Set", width: 160, height: 160, fill: C.landscape, stroke: C.landscapeStroke, shape: "circle" },
  { type: "adirondack-chair", category: "landscape", subgroup: "Outdoor Living", label: "Adirondack Chair", width: 60, height: 70, fill: "#c8a878", stroke: "#6a4a25", shape: "rect" },
  { type: "hammock", category: "landscape", subgroup: "Outdoor Living", label: "Hammock", width: 180, height: 60, fill: "#d8cca8", stroke: "#8a7a55", shape: "rect" },

  // Landscape — Structures
  { type: "shed", category: "landscape", subgroup: "Structures", label: "Shed", width: 140, height: 100, fill: "#b89868", stroke: "#6a4a25", shape: "rect" },
  { type: "gazebo", category: "landscape", subgroup: "Structures", label: "Gazebo", width: 160, height: 160, fill: "#c8a878", stroke: "#6a4a25", shape: "rect" },
  { type: "pergola", category: "landscape", subgroup: "Structures", label: "Pergola", width: 180, height: 180, fill: "#c8a878", stroke: "#6a4a25", shape: "rect" },
  { type: "mailbox", category: "landscape", subgroup: "Structures", label: "Mailbox", width: 50, height: 50, fill: "#6c6c70", stroke: "#2e2e32", shape: "rect" },
  { type: "outdoor-bench", category: "landscape", subgroup: "Structures", label: "Outdoor Bench", width: 140, height: 40, fill: "#c8a878", stroke: "#6a4a25", shape: "rect" },

  // Structural — Walls & Openings
  { type: "wall", category: "structural", subgroup: "Walls", label: "Wall", width: 200, height: 8, fill: C.structural, stroke: C.structuralStroke, shape: "rect" },
  { type: "divider", category: "structural", subgroup: "Walls", label: "Divider", width: 140, height: 6, fill: "#bcbcbc", stroke: "#666666", shape: "rect" },
  { type: "opening", category: "structural", subgroup: "Walls", label: "Opening", width: 80, height: 8, fill: "#e8e3d6", stroke: C.structuralStroke, shape: "rect" },
  { type: "stairs", category: "structural", subgroup: "Walls", label: "Stairs", width: 80, height: 140, fill: C.furniture, stroke: C.furnitureStroke, shape: "rect" },

  // Structural — Doors
  { type: "door", category: "structural", subgroup: "Doors", label: "Door", width: 50, height: 8, fill: "#d8b888", stroke: "#7a5a35", shape: "rect" },
  { type: "double-door", category: "structural", subgroup: "Doors", label: "Double Door", width: 100, height: 8, fill: "#d8b888", stroke: "#7a5a35", shape: "rect" },
  { type: "sliding-door", category: "structural", subgroup: "Doors", label: "Sliding Door", width: 120, height: 8, fill: "#d8b888", stroke: "#7a5a35", shape: "rect" },

  // Structural — Windows
  { type: "window", category: "structural", subgroup: "Windows", label: "Window", width: 80, height: 12, fill: C.water, stroke: C.waterStroke, shape: "rect" },

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