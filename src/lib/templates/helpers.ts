import type { Layout, LayoutItem, LayoutType } from "../types";
import { findDef, makeItem } from "../objectLibrary";
import { genId } from "../storage";

export interface TemplateDef {
  id: string;
  name: string;
  group: "Event" | "Landscape" | "Interior";
  type: LayoutType;
  build: () => LayoutItem[];
}

/** Place a library item with top-left at (x, y). Overrides win over defaults. */
export function place(
  type: string,
  x: number,
  y: number,
  z: number,
  overrides: Partial<LayoutItem> = {},
): LayoutItem {
  const def = findDef(type)!;
  const it = makeItem(def, x + def.width / 2, y + def.height / 2, z, genId);
  return { ...it, ...overrides };
}

/** Build a grouped round-table set: table + surrounding chairs sharing a groupId. */
export function tableSet(
  cx: number,
  cy: number,
  startZ: number,
  opts: { tableSize?: number; chairCount?: number; label?: string; chairOffset?: number } = {},
): LayoutItem[] {
  const tableSize = opts.tableSize ?? 90;
  const chairCount = opts.chairCount ?? 8;
  const chairOffset = opts.chairOffset ?? 22;
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

/** Grouped desk + chair. */
export function deskSet(
  cx: number,
  cy: number,
  startZ: number,
  opts: { label?: string } = {},
): LayoutItem[] {
  const groupId = genId();
  const items: LayoutItem[] = [];
  let z = startZ;
  items.push(
    place("desk", cx - 40, cy - 25, z++, { width: 80, height: 50, groupId, label: opts.label ?? "" }),
  );
  items.push(
    place("chair", cx - 13, cy + 30, z++, { width: 26, height: 26, groupId, label: "" }),
  );
  return items;
}

/** Build a final Layout wrapper around a template's items. */
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
    manualSave: true,
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
    manualSave: true,
  };
}
