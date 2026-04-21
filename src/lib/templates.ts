import type { Layout, LayoutItem, LayoutType } from "./types";
import { findDef, makeItem } from "./objectLibrary";
import { genId } from "./storage";

export interface TemplateDef {
  id: string;
  name: string;
  group: "Event" | "Landscape" | "Interior";
  type: LayoutType;
  build: () => LayoutItem[];
}

function place(type: string, x: number, y: number, z: number, overrides: Partial<LayoutItem> = {}): LayoutItem {
  const def = findDef(type)!;
  const it = makeItem(def, x + def.width / 2, y + def.height / 2, z, genId);
  return { ...it, ...overrides };
}

function ring(type: string, cx: number, cy: number, radius: number, count: number, startZ: number): LayoutItem[] {
  const out: LayoutItem[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    out.push(place(type, cx + Math.cos(a) * radius - 16, cy + Math.sin(a) * radius - 16, startZ + i, { rotation: (a * 180) / Math.PI + 90 }));
  }
  return out;
}

export const TEMPLATES: TemplateDef[] = [
  {
    id: "wedding-reception",
    name: "Wedding Reception",
    group: "Event",
    type: "event",
    build: () => {
      const items: LayoutItem[] = [];
      let z = 1;
      items.push(place("room-rect", 1700, 1500, z++, { width: 800, height: 600, label: "Reception Hall" }));
      items.push(place("stage", 1900, 1550, z++));
      items.push(place("dance-floor", 1900, 1750, z++, { width: 200, height: 200 }));
      const tables = [
        [1750, 2000], [2050, 2000], [1750, 2200], [2050, 2200],
        [1600, 2100], [2200, 2100],
      ];
      tables.forEach(([x, y], i) => {
        items.push(place("table-round", x, y, z++, { width: 90, height: 90, label: `Table ${i + 1}` }));
        items.push(...ring("chair", x + 45, y + 45, 70, 8, z));
        z += 8;
      });
      items.push(place("buffet", 1700, 1900, z++, { label: "Buffet" }));
      return items;
    },
  },
  {
    id: "classroom",
    name: "Classroom Seating",
    group: "Event",
    type: "event",
    build: () => {
      const items: LayoutItem[] = [];
      let z = 1;
      items.push(place("room-rect", 1800, 1600, z++, { width: 600, height: 500, label: "Classroom" }));
      items.push(place("desk", 2050, 1650, z++, { label: "Teacher" }));
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 5; c++) {
          items.push(place("desk", 1850 + c * 100, 1800 + r * 90, z++, { width: 80, height: 50 }));
          items.push(place("chair", 1860 + c * 100, 1860 + r * 90, z++, { width: 30, height: 25 }));
        }
      }
      return items;
    },
  },
  {
    id: "boardroom",
    name: "Boardroom",
    group: "Event",
    type: "event",
    build: () => {
      const items: LayoutItem[] = [];
      let z = 1;
      items.push(place("room-rect", 1800, 1700, z++, { width: 500, height: 350, label: "Boardroom" }));
      items.push(place("table-rect", 1900, 1820, z++, { width: 320, height: 110, label: "Conference Table" }));
      for (let i = 0; i < 6; i++) {
        items.push(place("chair", 1920 + i * 50, 1780, z++));
        items.push(place("chair", 1920 + i * 50, 1940, z++));
      }
      return items;
    },
  },
  {
    id: "expo-booth",
    name: "Expo Booth",
    group: "Event",
    type: "event",
    build: () => {
      const items: LayoutItem[] = [];
      let z = 1;
      items.push(place("room-rect", 1800, 1700, z++, { width: 600, height: 400, label: "Expo Floor" }));
      const positions = [[1850, 1750], [2050, 1750], [2250, 1750], [1850, 1950], [2050, 1950], [2250, 1950]];
      positions.forEach(([x, y], i) => items.push(place("booth", x, y, z++, { label: `Booth ${i + 1}` })));
      items.push(place("registration", 1850, 1700, z++));
      return items;
    },
  },
  {
    id: "backyard-garden",
    name: "Backyard Garden",
    group: "Landscape",
    type: "garden",
    build: () => {
      const items: LayoutItem[] = [];
      let z = 1;
      items.push(place("room-rect", 1700, 1600, z++, { width: 700, height: 500, label: "Yard" }));
      items.push(place("patio", 1750, 1650, z++));
      items.push(place("garden-bed", 2050, 1650, z++));
      items.push(place("garden-bed", 2050, 1800, z++));
      items.push(place("tree", 1750, 1900, z++));
      items.push(place("tree", 1900, 1950, z++));
      items.push(place("shrub", 2200, 1900, z++));
      items.push(place("shrub", 2200, 2000, z++));
      items.push(place("water", 1900, 1750, z++));
      items.push(place("path", 1750, 2030, z++, { width: 600, height: 30 }));
      return items;
    },
  },
  {
    id: "patio-walkway",
    name: "Patio + Walkway",
    group: "Landscape",
    type: "garden",
    build: () => {
      const items: LayoutItem[] = [];
      let z = 1;
      items.push(place("patio", 1800, 1700, z++, { width: 300, height: 220 }));
      items.push(place("path", 2120, 1780, z++, { width: 280, height: 50 }));
      items.push(place("planter", 1820, 1670, z++));
      items.push(place("planter", 2050, 1670, z++));
      items.push(place("tree", 2400, 1700, z++));
      items.push(place("shrub", 2410, 1850, z++));
      return items;
    },
  },
  {
    id: "front-yard",
    name: "Front Yard Planting",
    group: "Landscape",
    type: "garden",
    build: () => {
      const items: LayoutItem[] = [];
      let z = 1;
      items.push(place("room-rect", 1700, 1600, z++, { width: 700, height: 400, label: "Front Yard" }));
      items.push(place("path", 2010, 1700, z++, { width: 60, height: 280, rotation: 0 }));
      items.push(place("garden-bed", 1750, 1700, z++));
      items.push(place("garden-bed", 2200, 1700, z++));
      items.push(place("tree", 1780, 1900, z++));
      items.push(place("tree", 2280, 1900, z++));
      items.push(place("shrub", 1900, 1900, z++));
      items.push(place("shrub", 2150, 1900, z++));
      return items;
    },
  },
  {
    id: "studio-room",
    name: "Studio Room",
    group: "Interior",
    type: "floor",
    build: () => {
      const items: LayoutItem[] = [];
      let z = 1;
      items.push(place("room-rect", 1800, 1700, z++, { width: 500, height: 400, label: "Studio" }));
      items.push(place("sofa", 1850, 1750, z++));
      items.push(place("table-rect", 1850, 1830, z++, { width: 100, height: 50 }));
      items.push(place("desk", 2150, 1750, z++));
      items.push(place("chair", 2170, 1820, z++));
      items.push(place("bench", 1850, 1980, z++));
      return items;
    },
  },
  {
    id: "living-room",
    name: "Living Room",
    group: "Interior",
    type: "floor",
    build: () => {
      const items: LayoutItem[] = [];
      let z = 1;
      items.push(place("room-rect", 1800, 1700, z++, { width: 500, height: 380, label: "Living Room" }));
      items.push(place("sofa", 1850, 1750, z++, { width: 200, height: 70 }));
      items.push(place("sofa", 2080, 1830, z++, { width: 70, height: 180, rotation: 0 }));
      items.push(place("table-rect", 1900, 1880, z++, { width: 140, height: 70, label: "Coffee Table" }));
      items.push(place("chair", 2200, 1750, z++));
      return items;
    },
  },
  {
    id: "office-workspace",
    name: "Office Workspace",
    group: "Interior",
    type: "floor",
    build: () => {
      const items: LayoutItem[] = [];
      let z = 1;
      items.push(place("room-rect", 1700, 1600, z++, { width: 700, height: 500, label: "Office" }));
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
          items.push(place("desk", 1750 + c * 150, 1700 + r * 130, z++));
          items.push(place("chair", 1790 + c * 150, 1770 + r * 130, z++));
        }
      }
      return items;
    },
  },
  {
    id: "meeting-room",
    name: "Meeting Room",
    group: "Interior",
    type: "floor",
    build: () => {
      const items: LayoutItem[] = [];
      let z = 1;
      items.push(place("room-rect", 1800, 1700, z++, { width: 450, height: 320, label: "Meeting Room" }));
      items.push(place("table-rect", 1900, 1810, z++, { width: 260, height: 100 }));
      for (let i = 0; i < 4; i++) {
        items.push(place("chair", 1920 + i * 60, 1780, z++));
        items.push(place("chair", 1920 + i * 60, 1920, z++));
      }
      return items;
    },
  },
];

export function buildLayoutFromTemplate(t: TemplateDef): Layout {
  const now = Date.now();
  return {
    id: genId(),
    name: t.name,
    type: t.type,
    createdAt: now,
    updatedAt: now,
    canvas: { width: 4000, height: 4000, showGrid: true, snap: true, gridSize: 8 },
    items: t.build(),
  };
}

export function newEmptyLayout(name: string, type: LayoutType): Layout {
  const now = Date.now();
  return {
    id: genId(),
    name,
    type,
    createdAt: now,
    updatedAt: now,
    canvas: { width: 4000, height: 4000, showGrid: true, snap: true, gridSize: 8 },
    items: [],
  };
}