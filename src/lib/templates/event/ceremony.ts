import type { LayoutItem } from "../../types";
import { place, type TemplateDef } from "../helpers";

/**
 * Straight-rows ceremony: traditional church / garden aisle. Two chair banks
 * flank a center aisle. An arbor/altar sits at the front, a reserved family
 * row is marked nearest the altar, and a signing table sits off to the side.
 */
function buildRowsCeremony(guests: number): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;

  // Outdoor "zone" rectangle — dashed stroke reads as soft boundary, not wall
  const zoneW = 900;
  const zoneH = 700;
  const zoneX = 1550;
  const zoneY = 1400;
  items.push(
    place("room-rect", zoneX, zoneY, z++, {
      width: zoneW,
      height: zoneH,
      label: "Ceremony Area",
      style: { fill: "#f0ead8", stroke: "#9a8f78", strokeStyle: "dashed", opacity: 1 },
    }),
  );

  // Arbor / altar at the top-center
  const arborW = 160;
  const arborX = zoneX + zoneW / 2 - arborW / 2;
  const arborY = zoneY + 50;
  items.push(
    place("stage", arborX, arborY, z++, {
      width: arborW,
      height: 40,
      label: "Arbor / Altar",
    }),
  );

  // Signing table to the right of the altar
  items.push(
    place("table-rect", arborX + arborW + 50, arborY, z++, {
      width: 110,
      height: 45,
      label: "Signing Table",
    }),
  );

  // Chair banks — each row has N chairs, aisle of ~100 in the middle
  const aisleWidth = 100;
  const chairW = 28;
  const chairGap = 6;
  const rowGap = 40;

  // Chairs per side: split evenly, round up to fit
  const perSide = Math.ceil(guests / 2);
  const chairsPerRow = 6;
  const rowsNeeded = Math.ceil(perSide / chairsPerRow);

  const bankWidth = chairsPerRow * (chairW + chairGap) - chairGap;
  const rowsStartY = arborY + 100;
  const leftBankX = zoneX + zoneW / 2 - aisleWidth / 2 - bankWidth;
  const rightBankX = zoneX + zoneW / 2 + aisleWidth / 2;

  let remaining = guests;
  for (let r = 0; r < rowsNeeded && remaining > 0; r++) {
    const y = rowsStartY + r * rowGap;
    // Left side — chairs face north (toward altar), so rotation: 180
    const leftInThisRow = Math.min(chairsPerRow, Math.ceil(remaining / 2));
    for (let c = 0; c < leftInThisRow; c++) {
      items.push(
        place(
          "chair",
          leftBankX + (bankWidth - leftInThisRow * (chairW + chairGap) + chairGap) +
            c * (chairW + chairGap),
          y,
          z++,
          { width: chairW, height: chairW, rotation: 180, label: "" },
        ),
      );
      remaining--;
    }
    // Right side
    const rightInThisRow = Math.min(chairsPerRow, remaining);
    for (let c = 0; c < rightInThisRow; c++) {
      items.push(
        place("chair", rightBankX + c * (chairW + chairGap), y, z++, {
          width: chairW,
          height: chairW,
          rotation: 180,
          label: "",
        }),
      );
      remaining--;
    }
  }

  // "Reserved for family" markers at the first row on each side
  items.push(
    place("label-text", leftBankX, rowsStartY - 28, z++, {
      width: bankWidth,
      height: 22,
      label: "Reserved",
    }),
  );
  items.push(
    place("label-text", rightBankX, rowsStartY - 28, z++, {
      width: bankWidth,
      height: 22,
      label: "Reserved",
    }),
  );

  // Entry at the back — door sitting ON the south zone-boundary, centered
  const doorW = 80;
  const doorH = 8;
  items.push(
    place("door", zoneX + zoneW / 2 - doorW / 2, zoneY + zoneH - doorH, z++, {
      width: doorW,
      height: doorH,
      label: "",
    }),
  );
  // "Entry" label sits inside the room, just above the door
  items.push(
    place("label-text", zoneX + zoneW / 2 - 40, zoneY + zoneH - doorH - 26, z++, {
      width: 80,
      height: 22,
      label: "Entry",
    }),
  );

  return items;
}

/** Circle ceremony: guests ring the couple. Very common for intimate weddings. */
function buildCircleCeremony(guests: number): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;

  const zoneW = 900;
  const zoneH = 900;
  const zoneX = 1550;
  const zoneY = 1300;
  items.push(
    place("room-rect", zoneX, zoneY, z++, {
      width: zoneW,
      height: zoneH,
      label: "Ceremony Area",
      style: { fill: "#f0ead8", stroke: "#9a8f78", strokeStyle: "dashed", opacity: 1 },
    }),
  );

  const cx = zoneX + zoneW / 2;
  const cy = zoneY + zoneH / 2;

  // Central altar marker (small rect)
  items.push(
    place("stage", cx - 50, cy - 25, z++, {
      width: 100,
      height: 50,
      label: "Couple",
    }),
  );

  // One or two concentric rings of chairs. First ring at r1, second at r2 if
  // needed. A break at the "front" (top) leaves an entry path.
  const chairW = 26;
  const ring1Radius = 180;
  const ring1Capacity = 24;
  const ring2Radius = 240;
  const ring2Capacity = 32;

  const inRing1 = Math.min(guests, ring1Capacity);
  const inRing2 = Math.max(0, Math.min(guests - inRing1, ring2Capacity));

  // Leave a 40° gap at the top (entry)
  const gap = (40 * Math.PI) / 180;

  for (let i = 0; i < inRing1; i++) {
    const a =
      -Math.PI / 2 + gap / 2 + ((Math.PI * 2 - gap) / inRing1) * (i + 0.5);
    items.push(
      place(
        "chair",
        cx + Math.cos(a) * ring1Radius - chairW / 2,
        cy + Math.sin(a) * ring1Radius - chairW / 2,
        z++,
        {
          width: chairW,
          height: chairW,
          rotation: (a * 180) / Math.PI + 90,
          label: "",
        },
      ),
    );
  }
  for (let i = 0; i < inRing2; i++) {
    const a =
      -Math.PI / 2 + gap / 2 + ((Math.PI * 2 - gap) / inRing2) * (i + 0.5);
    items.push(
      place(
        "chair",
        cx + Math.cos(a) * ring2Radius - chairW / 2,
        cy + Math.sin(a) * ring2Radius - chairW / 2,
        z++,
        {
          width: chairW,
          height: chairW,
          rotation: (a * 180) / Math.PI + 90,
          label: "",
        },
      ),
    );
  }

  // Entry marker at the top gap
  items.push(
    place("label-text", cx - 60, zoneY + 20, z++, {
      width: 120,
      height: 24,
      label: "Entry",
    }),
  );

  return items;
}

/**
 * Semicircle: chairs arc around the front of the altar, no one sits behind
 * the couple. This is a very common "modern" ceremony layout.
 */
function buildSemicircleCeremony(guests: number): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;

  const zoneW = 1000;
  const zoneH = 700;
  const zoneX = 1500;
  const zoneY = 1400;
  items.push(
    place("room-rect", zoneX, zoneY, z++, {
      width: zoneW,
      height: zoneH,
      label: "Ceremony Area",
      style: { fill: "#f0ead8", stroke: "#9a8f78", strokeStyle: "dashed", opacity: 1 },
    }),
  );

  const cx = zoneX + zoneW / 2;
  // Altar sits at a "focal point" near the top; the arc sweeps in front
  const altarY = zoneY + 80;
  items.push(
    place("stage", cx - 70, altarY, z++, {
      width: 140,
      height: 45,
      label: "Altar",
    }),
  );

  const chairW = 26;
  // Two or three arcs. Radii measured from the altar focal point.
  const ring1R = 200;
  const ring2R = 260;
  const ring3R = 320;
  const ring1Cap = 20;
  const ring2Cap = 26;
  const ring3Cap = 32;

  const rings: Array<{ r: number; count: number }> = [];
  let remaining = guests;
  for (const { r, cap } of [
    { r: ring1R, cap: ring1Cap },
    { r: ring2R, cap: ring2Cap },
    { r: ring3R, cap: ring3Cap },
  ]) {
    if (remaining <= 0) break;
    const count = Math.min(cap, remaining);
    rings.push({ r, count });
    remaining -= count;
  }

  // Arc spans ~160° centered below the altar (from 10° past horizontal on
  // each side). Altar focal point: (cx, altarY + 20).
  const focalY = altarY + 20;
  const arcSpan = (160 * Math.PI) / 180;
  const arcStart = Math.PI / 2 - arcSpan / 2; // starts at left
  for (const { r, count } of rings) {
    for (let i = 0; i < count; i++) {
      const a = arcStart + (arcSpan / (count - 1 || 1)) * i;
      items.push(
        place(
          "chair",
          cx + Math.cos(a) * r - chairW / 2,
          focalY + Math.sin(a) * r - chairW / 2,
          z++,
          {
            width: chairW,
            height: chairW,
            rotation: (a * 180) / Math.PI - 90,
            label: "",
          },
        ),
      );
    }
  }

  return items;
}

export const ceremonyRows: TemplateDef = {
  id: "ceremony-rows",
  name: "Ceremony · Rows (traditional)",
  group: "Event",
  type: "event",
  build: () => buildRowsCeremony(80),
};

export const ceremonyCircle: TemplateDef = {
  id: "ceremony-circle",
  name: "Ceremony · Circle (intimate)",
  group: "Event",
  type: "event",
  build: () => buildCircleCeremony(50),
};

export const ceremonySemicircle: TemplateDef = {
  id: "ceremony-semicircle",
  name: "Ceremony · Semicircle",
  group: "Event",
  type: "event",
  build: () => buildSemicircleCeremony(60),
};
