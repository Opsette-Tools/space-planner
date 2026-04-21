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

/** Build a grouped round-table set: a round table surrounded by `chairCount`
 *  chairs. All items share a generated groupId so they move/rotate together. */
function tableSet(
  cx: number,
  cy: number,
  startZ: number,
  opts: { tableSize?: number; chairCount?: number; label?: string; chairOffset?: number } = {},
): LayoutItem[] {
  const tableSize = opts.tableSize ?? 90;
  const chairCount = opts.chairCount ?? 8;
  const chairOffset = opts.chairOffset ?? 22; // gap from table edge to chair center
  const groupId = genId();
  const items: LayoutItem[] = [];
  let z = startZ;
  items.push(
    place("table-round", cx - tableSize / 2, cy - tableSize / 2, z++, {
      width: tableSize,
      height: tableSize,
      label: opts.label ?? "Table",
      groupId,
    }),
  );
  const chairSize = 26;
  const radius = tableSize / 2 + chairOffset;
  for (let i = 0; i < chairCount; i++) {
    const a = (i / chairCount) * Math.PI * 2 - Math.PI / 2;
    items.push(
      place(
        "chair",
        cx + Math.cos(a) * radius - chairSize / 2,
        cy + Math.sin(a) * radius - chairSize / 2,
        z++,
        {
          width: chairSize,
          height: chairSize,
          rotation: (a * 180) / Math.PI + 90,
          groupId,
          label: "",
        },
      ),
    );
  }
  return items;
}

/** Build a grouped desk + chair set. */
function deskSet(cx: number, cy: number, startZ: number, opts: { label?: string } = {}): LayoutItem[] {
  const groupId = genId();
  const items: LayoutItem[] = [];
  let z = startZ;
  items.push(place("desk", cx - 40, cy - 25, z++, { width: 80, height: 50, groupId, label: opts.label ?? "" }));
  items.push(place("chair", cx - 13, cy + 30, z++, { width: 26, height: 26, groupId, label: "" }));
  return items;
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
      // Hall: 1000 wide × 800 tall, top-left at (1500, 1400).
      items.push(place("room-rect", 1500, 1400, z++, { width: 1000, height: 800, label: "Reception Hall" }));
      // Stage along the top inside the hall
      items.push(place("stage", 1880, 1450, z++, { width: 240, height: 110, label: "Stage" }));
      // Dance floor centered below the stage
      items.push(place("dance-floor", 1850, 1600, z++, { width: 300, height: 220, label: "Dance Floor" }));
      // Buffet along the right wall
      items.push(place("buffet", 2300, 1880, z++, { width: 160, height: 50, label: "Buffet", rotation: 90 }));
      // 6 round-table sets in two rows below the dance floor, well within hall
      const tableCenters: [number, number][] = [
        [1700, 1900], [2000, 1900], [2300, 1900],
        [1700, 2080], [2000, 2080], [2300, 2080],
      ];
      tableCenters.forEach(([cx, cy], i) => {
        const set = tableSet(cx, cy, z, { tableSize: 90, chairCount: 8, label: `Table ${i + 1}` });
        items.push(...set);
        z += set.length;
      });
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
      items.push(place("room-rect", 1600, 1500, z++, { width: 800, height: 700, label: "Classroom" }));
      // Teacher desk near the top-center
      const teacher = deskSet(2000, 1600, z, { label: "Teacher" });
      items.push(...teacher);
      z += teacher.length;
      // 4 rows × 5 cols student desk-sets
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 5; c++) {
          const set = deskSet(1720 + c * 130, 1780 + r * 110, z);
          items.push(...set);
          z += set.length;
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
      items.push(place("room-rect", 1700, 1650, z++, { width: 600, height: 400, label: "Boardroom" }));
      // Group: conference table + surrounding chairs
      const groupId = genId();
      items.push(place("table-rect", 1830, 1790, z++, { width: 340, height: 120, label: "Conference Table", groupId }));
      for (let i = 0; i < 6; i++) {
        items.push(place("chair", 1850 + i * 55, 1750, z++, { width: 28, height: 28, groupId, label: "" }));
        items.push(place("chair", 1850 + i * 55, 1925, z++, { width: 28, height: 28, groupId, label: "" }));
      }
      items.push(place("chair", 1790, 1840, z++, { width: 28, height: 28, groupId, label: "" }));
      items.push(place("chair", 2185, 1840, z++, { width: 28, height: 28, groupId, label: "" }));
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
      items.push(place("room-rect", 1600, 1550, z++, { width: 800, height: 600, label: "Expo Floor" }));
      items.push(place("registration", 1640, 1590, z++, { label: "Registration" }));
      const positions: [number, number][] = [
        [1700, 1750], [1900, 1750], [2100, 1750], [2280, 1750],
        [1700, 1950], [1900, 1950], [2100, 1950], [2280, 1950],
      ];
      positions.forEach(([x, y], i) => items.push(place("booth", x, y, z++, { label: `Booth ${i + 1}` })));
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
      items.push(place("room-rect", 1700, 1650, z++, { width: 550, height: 380, label: "Meeting Room" }));
      const groupId = genId();
      items.push(place("table-rect", 1830, 1790, z++, { width: 290, height: 110, label: "Table", groupId }));
      for (let i = 0; i < 4; i++) {
        items.push(place("chair", 1860 + i * 65, 1750, z++, { width: 28, height: 28, groupId, label: "" }));
        items.push(place("chair", 1860 + i * 65, 1915, z++, { width: 28, height: 28, groupId, label: "" }));
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