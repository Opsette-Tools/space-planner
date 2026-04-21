import type { LayoutItem } from "../../types";
import { place, type TemplateDef } from "../helpers";

/**
 * Mixed backyard: back of house at top, patio against it, open lawn in the
 * middle, a perimeter planting border with a specimen tree, and a perimeter
 * fence. A landscaper can start here and customize for the client (add kids'
 * play zone, pool, shed, etc.).
 */
function build(): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;

  const yX = 1500;
  const yY = 1400;
  const yW = 1000;
  const yH = 900;

  // Yard boundary (fence line)
  items.push(
    place("room-rect", yX, yY, z++, {
      width: yW,
      height: yH,
      label: "Back Yard",
      style: {
        fill: "#f4efde",
        stroke: "#7a6a3a",
        strokeStyle: "dashed",
        opacity: 1,
      },
    }),
  );

  // House wall along the top
  items.push(
    place("wall", yX + 60, yY, z++, {
      width: yW - 120,
      height: 10,
      label: "",
      style: {
        fill: "#bcbcbc",
        stroke: "#555555",
        strokeStyle: "solid",
        opacity: 1,
      },
    }),
  );
  items.push(
    place("label-text", yX + yW / 2 - 70, yY - 28, z++, {
      width: 140,
      height: 22,
      label: "Back of House",
    }),
  );
  // Back door
  items.push(
    place("door", yX + yW / 2 - 30, yY + 10, z++, {
      width: 60,
      height: 8,
      label: "",
    }),
  );

  // Patio against the house
  items.push(
    place("patio", yX + yW / 2 - 180, yY + 20, z++, {
      width: 360,
      height: 180,
      label: "Patio",
    }),
  );
  // Outdoor dining set on patio
  items.push(
    place("table-round", yX + yW / 2 - 40, yY + 70, z++, {
      width: 80,
      height: 80,
      label: "",
    }),
  );
  items.push(place("chair", yX + yW / 2 - 13, yY + 40, z++, { width: 26, height: 26, label: "" }));
  items.push(place("chair", yX + yW / 2 - 13, yY + 140, z++, { width: 26, height: 26, label: "" }));
  items.push(place("chair", yX + yW / 2 - 65, yY + 90, z++, { width: 26, height: 26, label: "" }));
  items.push(place("chair", yX + yW / 2 + 35, yY + 90, z++, { width: 26, height: 26, label: "" }));

  // Lawn zone in the middle
  items.push(
    place("room-rect", yX + 80, yY + 240, z++, {
      width: yW - 160,
      height: 360,
      label: "Lawn",
      style: {
        fill: "#e6efdc",
        stroke: "#8aa070",
        strokeStyle: "dashed",
        opacity: 1,
      },
    }),
  );

  // Perimeter planting border along the sides and back
  // Left border
  for (let i = 0; i < 4; i++) {
    items.push(
      place("garden-bed", yX + 20, yY + 240 + i * 120, z++, {
        width: 50,
        height: 110,
        label: "",
      }),
    );
    items.push(
      place("shrub", yX + 25, yY + 260 + i * 120, z++, {
        width: 40,
        height: 40,
        label: "",
      }),
    );
  }
  // Right border
  for (let i = 0; i < 4; i++) {
    items.push(
      place("garden-bed", yX + yW - 70, yY + 240 + i * 120, z++, {
        width: 50,
        height: 110,
        label: "",
      }),
    );
    items.push(
      place("shrub", yX + yW - 65, yY + 260 + i * 120, z++, {
        width: 40,
        height: 40,
        label: "",
      }),
    );
  }

  // Back border with specimen tree + water feature
  items.push(
    place("tree", yX + 120, yY + yH - 180, z++, { width: 110, height: 110, label: "Specimen" }),
  );
  items.push(
    place("water", yX + 280, yY + yH - 150, z++, {
      width: 120,
      height: 80,
      label: "Water Feature",
    }),
  );
  items.push(
    place("shrub", yX + yW - 250, yY + yH - 120, z++, { width: 50, height: 50, label: "" }),
  );
  items.push(
    place("shrub", yX + yW - 180, yY + yH - 130, z++, { width: 55, height: 55, label: "" }),
  );
  items.push(
    place("tree", yX + yW - 240, yY + yH - 220, z++, { width: 90, height: 90, label: "" }),
  );

  // Stepping path from patio out to the lawn
  items.push(
    place("path", yX + yW / 2 - 30, yY + 210, z++, {
      width: 60,
      height: 240,
      label: "",
    }),
  );

  // Gate / side exit (label only)
  items.push(
    place("label-text", yX - 36, yY + yH - 60, z++, {
      width: 72,
      height: 22,
      label: "Gate",
    }),
  );

  return items;
}

export const backyardGarden: TemplateDef = {
  id: "backyard-garden",
  name: "Backyard — Mixed Use",
  group: "Landscape",
  type: "garden",
  build,
};
