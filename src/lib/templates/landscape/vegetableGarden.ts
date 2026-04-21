import type { LayoutItem } from "../../types";
import { place, type TemplateDef } from "../helpers";

/**
 * Kitchen / vegetable garden with raised beds on a grid, crossing paths
 * between them, and the infrastructure a working gardener actually needs:
 * water source, compost bin, and trellis row on the north edge so tall
 * vines don't shade shorter crops.
 */
function build(): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;

  // Garden enclosure (could be fenced or just a visual zone)
  const gX = 1500;
  const gY = 1500;
  const gW = 900;
  const gH = 700;
  items.push(
    place("room-rect", gX, gY, z++, {
      width: gW,
      height: gH,
      label: "Vegetable Garden",
      style: {
        fill: "#f2eed8",
        stroke: "#8a7a4a",
        strokeStyle: "dashed",
        opacity: 1,
      },
    }),
  );

  // North-arrow indicator (so the gardener places tall crops correctly)
  items.push(
    place("marker-icon", gX + gW - 50, gY + 16, z++, {
      width: 30,
      height: 30,
      label: "N",
    }),
  );

  // Trellis row along the north edge — narrow strips for pole beans, peas, etc.
  for (let i = 0; i < 3; i++) {
    items.push(
      place("fence", gX + 60 + i * 280, gY + 60, z++, {
        width: 240,
        height: 8,
        label: i === 0 ? "Trellis" : "",
      }),
    );
  }

  // 3×2 raised beds. Classic 4×8 raised-bed footprint at 1ft ≈ 10 units:
  // so each bed is 80×40 units. Space 50 for a wheelbarrow path.
  const bedW = 220;
  const bedH = 90;
  const bedCols = 3;
  const bedRows = 2;
  const gapX = 40;
  const gapY = 60;
  const gridW = bedCols * bedW + (bedCols - 1) * gapX;
  const firstX = gX + (gW - gridW) / 2;
  const firstY = gY + 140;

  for (let r = 0; r < bedRows; r++) {
    for (let c = 0; c < bedCols; c++) {
      const x = firstX + c * (bedW + gapX);
      const y = firstY + r * (bedH + gapY);
      items.push(
        place("garden-bed", x, y, z++, {
          width: bedW,
          height: bedH,
          label: `Bed ${r * bedCols + c + 1}`,
          style: {
            fill: "#d6c8a8",
            stroke: "#8a7a4a",
            strokeStyle: "solid",
            opacity: 1,
          },
        }),
      );
    }
  }

  // Cross path — horizontal between bed rows
  items.push(
    place("path", gX + 40, firstY + bedH + gapY / 2 - 15, z++, {
      width: gW - 80,
      height: 30,
      label: "",
    }),
  );

  // Compost bin in the back corner
  items.push(
    place("planter", gX + 30, gY + 60, z++, {
      width: 60,
      height: 60,
      label: "Compost",
    }),
  );

  // Water source (hose bib / spigot) near the entry
  items.push(
    place("marker-num", gX + 30, gY + gH - 50, z++, {
      width: 22,
      height: 22,
      label: "H",
    }),
  );

  // Garden entrance label
  items.push(
    place("label-text", gX + gW / 2 - 50, gY + gH - 30, z++, {
      width: 100,
      height: 22,
      label: "Entrance",
    }),
  );

  return items;
}

export const vegetableGarden: TemplateDef = {
  id: "vegetable-garden",
  name: "Vegetable Garden (raised beds)",
  group: "Landscape",
  type: "garden",
  build,
};
