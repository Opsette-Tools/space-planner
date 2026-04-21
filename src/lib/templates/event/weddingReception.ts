import type { LayoutItem } from "../../types";
import { place, tableSet, type TemplateDef } from "../helpers";

/**
 * Wedding reception parameterized by guest count. Chooses a hall size, table
 * count (assuming ~8 per round table), and common infrastructure: head table,
 * dance floor, DJ, bar, gift/cake tables, photo booth zone, restroom + entry
 * markers.
 */
function buildReception(guests: number): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;

  // Size the hall from guest count. Rule of thumb: ~15 sqft/guest → scales
  // gracefully for a top-down canvas. Widths stay wider than deep so the
  // dance floor + head table read front-to-back.
  const tablesNeeded = Math.ceil(guests / 8);
  const hallWidth = 900 + Math.ceil(tablesNeeded / 3) * 120;
  const hallHeight = 700 + Math.ceil(tablesNeeded / 4) * 80;
  const hallX = 1500;
  const hallY = 1300;

  // Hall shell
  items.push(
    place("room-rect", hallX, hallY, z++, {
      width: hallWidth,
      height: hallHeight,
      label: `Reception Hall · ${guests} guests`,
    }),
  );

  // Entry marker at bottom-center
  items.push(
    place("label-text", hallX + hallWidth / 2 - 60, hallY + hallHeight - 30, z++, {
      width: 120,
      height: 28,
      label: "Main Entry",
    }),
  );

  // Head / sweetheart table along the top-center of the hall
  const headTableWidth = Math.min(320, hallWidth * 0.3);
  const headTableX = hallX + hallWidth / 2 - headTableWidth / 2;
  const headTableY = hallY + 70;
  items.push(
    place("table-rect", headTableX, headTableY, z++, {
      width: headTableWidth,
      height: 70,
      label: "Head Table",
    }),
  );
  // Head-table chairs, facing out toward guests
  const headSeats = guests <= 100 ? 2 : guests <= 150 ? 6 : 10;
  const chairGap = headTableWidth / (headSeats + 1);
  for (let i = 0; i < headSeats; i++) {
    items.push(
      place(
        "chair",
        headTableX + chairGap * (i + 1) - 13,
        headTableY - 32,
        z++,
        { width: 26, height: 26, label: "" },
      ),
    );
  }

  // Dance floor centered between head table and guest tables — nudged closer
  // to the head table to recover vertical space for guest rows.
  const danceSize = Math.min(280, hallWidth * 0.28);
  const danceX = hallX + hallWidth / 2 - danceSize / 2;
  const danceY = headTableY + 100;
  const danceH = danceSize * 0.75;
  items.push(
    place("dance-floor", danceX, danceY, z++, {
      width: danceSize,
      height: danceH,
      label: "Dance Floor",
    }),
  );

  // DJ / band to the right of the dance floor
  items.push(
    place("stage", danceX + danceSize + 20, danceY, z++, {
      width: 120,
      height: 80,
      label: "DJ / Band",
    }),
  );

  // Gift & cake tables on the left side near the head table
  items.push(
    place("buffet", hallX + 40, headTableY + 20, z++, {
      width: 140,
      height: 45,
      label: "Gift Table",
    }),
  );
  items.push(
    place("buffet", hallX + 40, headTableY + 90, z++, {
      width: 140,
      height: 45,
      label: "Cake Table",
    }),
  );

  // Bar flush against the right wall, oriented vertically at the dance-floor
  // latitude — keeps the guest-table rows unobstructed.
  const sideServiceY = danceY - 10;
  const sideServiceH = danceH + 30;
  items.push(
    place("buffet", hallX + hallWidth - 60, sideServiceY, z++, {
      width: 50,
      height: sideServiceH,
      label: "Bar",
    }),
  );

  // Buffet flush against the left wall, oriented vertically, at the same
  // latitude as the bar.
  items.push(
    place("buffet", hallX + 10, sideServiceY, z++, {
      width: 50,
      height: sideServiceH,
      label: "Buffet",
    }),
  );

  // Photo booth zone bottom-left corner
  items.push(
    place("booth", hallX + 40, hallY + hallHeight - 160, z++, {
      width: 120,
      height: 120,
      label: "Photo Booth",
    }),
  );

  // Guest tables — laid out in rows below the dance floor, centered.
  // tableSet footprint ≈ 160 wide (table 90 + 2×chairOffset 22 + chair 26),
  // so spacingX 180 leaves a 20-unit breathing gap between neighbors' chairs.
  const tableSize = 90;
  const spacingX = 180;
  const spacingY = 170;
  const usableWidth = hallWidth - 180; // leave ~90 on each side for side service / walls
  const cols = Math.max(3, Math.floor(usableWidth / spacingX));
  const rows = Math.ceil(tablesNeeded / cols);
  const gridWidth = (cols - 1) * spacingX;
  const firstX = hallX + hallWidth / 2 - gridWidth / 2;
  const firstY = danceY + danceH + 110;

  let tableNum = 1;
  for (let r = 0; r < rows && tableNum <= tablesNeeded; r++) {
    for (let c = 0; c < cols && tableNum <= tablesNeeded; c++) {
      const cx = firstX + c * spacingX;
      const cy = firstY + r * spacingY;
      const set = tableSet(cx, cy, z, {
        tableSize,
        chairCount: 8,
        label: `Table ${tableNum}`,
      });
      items.push(...set);
      z += set.length;
      tableNum++;
    }
  }

  return items;
}

export const weddingReceptionSmall: TemplateDef = {
  id: "wedding-reception-80",
  name: "Wedding Reception · 80 guests",
  group: "Event",
  type: "event",
  build: () => buildReception(80),
};

export const weddingReceptionMedium: TemplateDef = {
  id: "wedding-reception-120",
  name: "Wedding Reception · 120 guests",
  group: "Event",
  type: "event",
  build: () => buildReception(120),
};

export const weddingReceptionLarge: TemplateDef = {
  id: "wedding-reception-200",
  name: "Wedding Reception · 200 guests",
  group: "Event",
  type: "event",
  build: () => buildReception(200),
};
