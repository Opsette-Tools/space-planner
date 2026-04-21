import type { LayoutItem } from "../../types";
import { place, deskSet, type TemplateDef } from "../helpers";

/**
 * Office floor plan: perimeter walls with windows, a grid of workstations
 * in the center, phone-booth pods along one wall, a break area with a
 * kitchenette, and a print/copy station. Door + reception zone.
 */
function build(): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;

  const oX = 1500;
  const oY = 1500;
  const oW = 1000;
  const oH = 720;

  items.push(
    place("room-rect", oX, oY, z++, {
      width: oW,
      height: oH,
      label: "Office",
    }),
  );

  // Windows — long runs on the top and right walls
  items.push(
    place("window", oX + 80, oY - 4, z++, { width: oW - 160, height: 8, label: "" }),
  );
  items.push(
    place("window", oX + oW - 4, oY + 100, z++, { width: 8, height: oH - 260, label: "" }),
  );

  // Entry door bottom-left
  items.push(
    place("door", oX + 60, oY + oH - 4, z++, { width: 70, height: 8, label: "" }),
  );
  items.push(
    place("label-text", oX + 20, oY + oH - 40, z++, { width: 140, height: 22, label: "Entry" }),
  );

  // Reception: desk + seating
  items.push(
    place("desk", oX + 160, oY + oH - 90, z++, {
      width: 140,
      height: 55,
      label: "Reception",
    }),
  );
  items.push(
    place("chair", oX + 215, oY + oH - 40, z++, { width: 28, height: 28, label: "" }),
  );
  items.push(
    place("chair", oX + 60, oY + oH - 180, z++, { width: 44, height: 44, label: "" }),
  );
  items.push(
    place("chair", oX + 110, oY + oH - 180, z++, { width: 44, height: 44, label: "" }),
  );

  // Phone-booth pods along the left wall
  for (let i = 0; i < 3; i++) {
    items.push(
      place("booth", oX + 20, oY + 60 + i * 120, z++, {
        width: 90,
        height: 100,
        label: `Booth ${i + 1}`,
      }),
    );
  }

  // Open workstations — centered 3×3 grid
  const cols = 3;
  const rows = 3;
  const spacingX = 180;
  const spacingY = 150;
  const gridW = (cols - 1) * spacingX;
  const firstX = oX + oW / 2 - gridW / 2 - 60;
  const firstY = oY + 100;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const set = deskSet(firstX + c * spacingX, firstY + r * spacingY, z);
      items.push(...set);
      z += set.length;
    }
  }

  // Print / copy station against the right wall
  items.push(
    place("buffet", oX + oW - 100, oY + 60, z++, {
      width: 70,
      height: 50,
      label: "Copier",
    }),
  );
  items.push(
    place("buffet", oX + oW - 100, oY + 130, z++, {
      width: 70,
      height: 40,
      label: "Supply",
    }),
  );

  // Break area in the bottom-right
  items.push(
    place("room-rect", oX + oW - 260, oY + oH - 200, z++, {
      width: 240,
      height: 180,
      label: "Break Area",
      style: {
        fill: "#efe6d0",
        stroke: "#8a7a55",
        strokeStyle: "dashed",
        opacity: 1,
      },
    }),
  );
  items.push(
    place("buffet", oX + oW - 250, oY + oH - 190, z++, {
      width: 220,
      height: 40,
      label: "Kitchenette",
    }),
  );
  items.push(
    place("table-round", oX + oW - 190, oY + oH - 120, z++, {
      width: 70,
      height: 70,
      label: "",
    }),
  );
  items.push(
    place("chair", oX + oW - 180, oY + oH - 150, z++, { width: 26, height: 26, label: "" }),
  );
  items.push(
    place("chair", oX + oW - 130, oY + oH - 110, z++, { width: 26, height: 26, label: "" }),
  );
  items.push(
    place("chair", oX + oW - 180, oY + oH - 70, z++, { width: 26, height: 26, label: "" }),
  );

  return items;
}

export const officeWorkspace: TemplateDef = {
  id: "office-workspace",
  name: "Office — Open Plan",
  group: "Interior",
  type: "floor",
  build,
};
