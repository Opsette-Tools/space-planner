import type { LayoutItem } from "../../types";
import { place, type TemplateDef } from "../helpers";

/**
 * Front walkway hardscape: a clear path from the street/driveway up to a
 * landing pad by the front door, flanked with low borders. Useful as a
 * starter for curb-appeal projects.
 */
function build(): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;

  // Front yard zone
  const yX = 1600;
  const yY = 1500;
  const yW = 800;
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

  // House wall at the top
  items.push(
    place("wall", yX + 60, yY + 40, z++, {
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
    place("label-text", yX + yW / 2 - 50, yY + 10, z++, {
      width: 100,
      height: 22,
      label: "House",
    }),
  );
  // Front door
  items.push(
    place("door", yX + yW / 2 - 30, yY + 50, z++, { width: 60, height: 8, label: "" }),
  );

  // Landing pad at the door
  items.push(
    place("patio", yX + yW / 2 - 60, yY + 60, z++, {
      width: 120,
      height: 60,
      label: "Landing",
    }),
  );

  // Main walkway from landing down to the street
  items.push(
    place("path", yX + yW / 2 - 35, yY + 120, z++, {
      width: 70,
      height: yH - 170,
      label: "Walkway",
    }),
  );

  // Driveway on the right edge
  items.push(
    place("path", yX + yW - 180, yY + 60, z++, {
      width: 140,
      height: yH - 100,
      label: "Driveway",
    }),
  );

  // Low-border shrubs along both sides of the walkway
  for (let i = 0; i < 6; i++) {
    items.push(
      place("shrub", yX + yW / 2 - 75, yY + 150 + i * 70, z++, {
        width: 30,
        height: 30,
        label: "",
        style: {
          fill: "#c8dcb8",
          stroke: "#5a7a4e",
          strokeStyle: "solid",
          opacity: 1,
        },
      }),
    );
    items.push(
      place("shrub", yX + yW / 2 + 45, yY + 150 + i * 70, z++, {
        width: 30,
        height: 30,
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

  // Flanking planters at the landing
  items.push(place("planter", yX + yW / 2 - 110, yY + 70, z++, { width: 40, height: 40, label: "" }));
  items.push(place("planter", yX + yW / 2 + 70, yY + 70, z++, { width: 40, height: 40, label: "" }));

  // Specimen tree at the front corner for curb appeal
  items.push(
    place("tree", yX + 80, yY + yH - 220, z++, { width: 120, height: 120, label: "Specimen" }),
  );

  // Foundation bed in front of the house wall, skipping the door
  items.push(
    place("garden-bed", yX + 80, yY + 50, z++, {
      width: yW / 2 - 140,
      height: 60,
      label: "",
    }),
  );
  items.push(
    place("garden-bed", yX + yW / 2 + 60, yY + 50, z++, {
      width: yW / 2 - 240,
      height: 60,
      label: "",
    }),
  );

  // Street label at bottom
  items.push(
    place("label-text", yX + yW / 2 - 40, yY + yH + 10, z++, {
      width: 80,
      height: 22,
      label: "Street",
    }),
  );

  return items;
}

export const patioWalkway: TemplateDef = {
  id: "patio-walkway",
  name: "Front Walkway + Entry",
  group: "Landscape",
  type: "garden",
  build,
};
