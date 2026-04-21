import type { LayoutItem } from "../../types";
import { place, type TemplateDef } from "../helpers";

/**
 * A pollinator / cottage-style garden bed. Plants are staggered in three
 * layers — tall back, mid, short front — with a small water source and a
 * couple of stepping stones for access.
 */
function build(): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;

  // Bed footprint — kidney/oval feel via rounded stroke
  const bX = 1600;
  const bY = 1700;
  const bW = 700;
  const bH = 220;
  items.push(
    place("garden-bed", bX, bY, z++, {
      width: bW,
      height: bH,
      label: "Pollinator Bed",
      style: {
        fill: "#d8c8a0",
        stroke: "#7a6a3a",
        strokeStyle: "solid",
        opacity: 1,
      },
    }),
  );

  // Lawn behind (north-facing back of the bed)
  items.push(
    place("room-rect", bX - 60, bY - 220, z++, {
      width: bW + 120,
      height: 200,
      label: "Lawn",
      style: {
        fill: "#e6efdc",
        stroke: "#8aa070",
        strokeStyle: "dashed",
        opacity: 1,
      },
    }),
  );

  // Back row — tall plants (marked as "shrub" at larger size)
  for (let i = 0; i < 5; i++) {
    items.push(
      place("shrub", bX + 50 + i * 130, bY + 20, z++, {
        width: 54,
        height: 54,
        label: "",
      }),
    );
  }
  // Middle row — mid-height
  for (let i = 0; i < 6; i++) {
    items.push(
      place("shrub", bX + 30 + i * 110, bY + 90, z++, {
        width: 38,
        height: 38,
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
  // Front row — low, ground-cover style
  for (let i = 0; i < 8; i++) {
    items.push(
      place("shrub", bX + 20 + i * 85, bY + bH - 50, z++, {
        width: 28,
        height: 28,
        label: "",
        style: {
          fill: "#e8d8a8",
          stroke: "#8a7a4a",
          strokeStyle: "solid",
          opacity: 1,
        },
      }),
    );
  }

  // Water source for pollinators — small bird bath at one end
  items.push(
    place("water", bX + bW - 70, bY - 30, z++, {
      width: 50,
      height: 50,
      label: "Bird Bath",
    }),
  );

  // Stepping stones for access into the bed
  for (let i = 0; i < 3; i++) {
    items.push(
      place("planter", bX + 100 + i * 240, bY + bH - 10, z++, {
        width: 32,
        height: 24,
        label: "",
        style: {
          fill: "#c8c0b8",
          stroke: "#7a7066",
          strokeStyle: "solid",
          opacity: 1,
        },
      }),
    );
  }

  return items;
}

export const pollinatorBed: TemplateDef = {
  id: "pollinator-bed",
  name: "Pollinator Bed (layered)",
  group: "Landscape",
  type: "garden",
  build,
};
