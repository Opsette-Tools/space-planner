import type { LayoutItem } from "../../types";
import { place, type TemplateDef } from "../helpers";

/**
 * Foundation planting: the classic front-of-house landscape. The template
 * builds a house wall at the top, a walkway splitting a symmetrical mixed
 * bed in half, shrubs in graduated heights, and specimen trees at the
 * outside corners where they won't overgrow the foundation.
 */
function build(): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;

  // House wall / facade along the top — just the foreground edge, not a full house
  const wallX = 1500;
  const wallY = 1500;
  const wallW = 900;
  items.push(
    place("wall", wallX, wallY, z++, {
      width: wallW,
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
    place("label-text", wallX + wallW / 2 - 70, wallY - 28, z++, {
      width: 140,
      height: 22,
      label: "House Facade",
    }),
  );

  // Front door + steps
  items.push(
    place("door", wallX + wallW / 2 - 30, wallY + 10, z++, {
      width: 60,
      height: 8,
      label: "",
    }),
  );

  // Walkway splitting the bed
  items.push(
    place("path", wallX + wallW / 2 - 35, wallY + 18, z++, {
      width: 70,
      height: 240,
      label: "Walkway",
    }),
  );

  // Mulch beds on both sides of the walkway
  const bedY = wallY + 20;
  const bedH = 160;
  const leftBedW = wallW / 2 - 50;
  items.push(
    place("garden-bed", wallX + 20, bedY, z++, {
      width: leftBedW,
      height: bedH,
      label: "",
    }),
  );
  items.push(
    place("garden-bed", wallX + wallW / 2 + 30, bedY, z++, {
      width: leftBedW,
      height: bedH,
      label: "",
    }),
  );

  // Shrubs — graduated: taller near the house, shorter toward the lawn
  // Left bed: 3 tall shrubs back, 3 short shrubs front
  const leftBackY = bedY + 20;
  const leftFrontY = bedY + bedH - 60;
  for (let i = 0; i < 3; i++) {
    items.push(
      place("shrub", wallX + 60 + i * 110, leftBackY, z++, {
        width: 50,
        height: 50,
        label: "",
      }),
    );
    items.push(
      place("shrub", wallX + 90 + i * 110, leftFrontY, z++, {
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
  // Right bed: mirror
  for (let i = 0; i < 3; i++) {
    items.push(
      place("shrub", wallX + wallW / 2 + 60 + i * 110, leftBackY, z++, {
        width: 50,
        height: 50,
        label: "",
      }),
    );
    items.push(
      place("shrub", wallX + wallW / 2 + 90 + i * 110, leftFrontY, z++, {
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

  // Specimen trees at the corners — drawn at near-mature canopy
  items.push(
    place("tree", wallX - 30, wallY + 120, z++, {
      width: 110,
      height: 110,
      label: "Specimen",
    }),
  );
  items.push(
    place("tree", wallX + wallW - 80, wallY + 120, z++, {
      width: 110,
      height: 110,
      label: "Specimen",
    }),
  );

  // Lawn zone in front of the beds (dashed-zone style)
  items.push(
    place("room-rect", wallX - 40, wallY + bedH + 40, z++, {
      width: wallW + 80,
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

  return items;
}

export const foundationPlanting: TemplateDef = {
  id: "foundation-planting",
  name: "Foundation Planting",
  group: "Landscape",
  type: "garden",
  build,
};
