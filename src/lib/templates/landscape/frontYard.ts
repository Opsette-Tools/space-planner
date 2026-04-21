import type { LayoutItem } from "../../types";
import { place, type TemplateDef } from "../helpers";

/**
 * Full front-yard design. Anchors: house wall at top, driveway on the right,
 * walkway up the middle, lawn filling the center, foundation planting along
 * the house, curbside shrub cluster and ornamental trees for framing.
 */
function build(): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;

  const yX = 1500;
  const yY = 1500;
  const yW = 1000;
  const yH = 700;

  items.push(
    place("room-rect", yX, yY, z++, {
      width: yW,
      height: yH,
      label: "Front Yard",
      style: {
        fill: "#f4efde",
        stroke: "#8a7a4a",
        strokeStyle: "dashed",
        opacity: 1,
      },
    }),
  );

  // House wall + label
  items.push(
    place("wall", yX + 40, yY + 30, z++, {
      width: yW - 80,
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
    place("label-text", yX + yW / 2 - 50, yY, z++, { width: 100, height: 22, label: "House" }),
  );
  items.push(
    place("door", yX + yW / 2 - 30, yY + 40, z++, { width: 60, height: 8, label: "" }),
  );

  // Driveway on the right
  items.push(
    place("path", yX + yW - 180, yY + 40, z++, {
      width: 140,
      height: yH - 80,
      label: "Driveway",
    }),
  );

  // Walkway up the middle
  items.push(
    place("path", yX + yW / 2 - 35, yY + 50, z++, {
      width: 70,
      height: yH - 100,
      label: "Walkway",
    }),
  );

  // Foundation beds flanking the door
  items.push(
    place("garden-bed", yX + 60, yY + 40, z++, {
      width: yW / 2 - 130,
      height: 70,
      label: "",
    }),
  );
  items.push(
    place("garden-bed", yX + yW / 2 + 40, yY + 40, z++, {
      width: yW / 2 - 240,
      height: 70,
      label: "",
    }),
  );

  // Shrubs along the foundation beds — taller near corners, shorter near door
  for (let i = 0; i < 4; i++) {
    items.push(
      place("shrub", yX + 80 + i * 60, yY + 55, z++, {
        width: 40 + (i === 0 ? 10 : 0),
        height: 40 + (i === 0 ? 10 : 0),
        label: "",
      }),
    );
    items.push(
      place("shrub", yX + yW / 2 + 60 + i * 60, yY + 55, z++, {
        width: 40 + (i === 3 ? 10 : 0),
        height: 40 + (i === 3 ? 10 : 0),
        label: "",
      }),
    );
  }

  // Lawn in the middle
  items.push(
    place("room-rect", yX + 60, yY + 140, z++, {
      width: yW - 280,
      height: yH - 220,
      label: "Lawn",
      style: {
        fill: "#e6efdc",
        stroke: "#8aa070",
        strokeStyle: "dashed",
        opacity: 1,
      },
    }),
  );

  // Two ornamental trees framing the walkway at the front
  items.push(
    place("tree", yX + 120, yY + yH - 240, z++, {
      width: 110,
      height: 110,
      label: "Ornamental",
    }),
  );
  items.push(
    place("tree", yX + yW - 320, yY + yH - 240, z++, {
      width: 110,
      height: 110,
      label: "Ornamental",
    }),
  );

  // Curbside shrub cluster at the street edge
  for (let i = 0; i < 5; i++) {
    items.push(
      place("shrub", yX + 100 + i * 70, yY + yH - 90, z++, {
        width: 40,
        height: 40,
        label: "",
        style: {
          fill: "#c8dcb8",
          stroke: "#5a7a4e",
          strokeStyle: "solid",
          opacity: 1,
        },
      }),
    );
  }

  // Street label
  items.push(
    place("label-text", yX + yW / 2 - 40, yY + yH + 10, z++, {
      width: 80,
      height: 22,
      label: "Street",
    }),
  );

  return items;
}

export const frontYard: TemplateDef = {
  id: "front-yard",
  name: "Front Yard — Full Design",
  group: "Landscape",
  type: "garden",
  build,
};
