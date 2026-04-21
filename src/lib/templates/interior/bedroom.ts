import type { LayoutItem } from "../../types";
import { genId } from "../../storage";
import { place, type TemplateDef } from "../helpers";

/**
 * Primary bedroom: queen bed centered on a wall with flanking nightstands,
 * dresser opposite, walk-in-closet zone, reading chair, window, and labeled
 * door. Rug zone frames the bed.
 */
function build(): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;

  const rX = 1700;
  const rY = 1600;
  const rW = 540;
  const rH = 450;

  items.push(
    place("room-rect", rX, rY, z++, {
      width: rW,
      height: rH,
      label: "Bedroom",
    }),
  );

  // Window on top wall
  items.push(
    place("window", rX + rW / 2 - 80, rY - 4, z++, {
      width: 160,
      height: 8,
      label: "",
    }),
  );

  // Door at bottom-right
  items.push(
    place("door", rX + rW - 120, rY + rH - 4, z++, {
      width: 70,
      height: 8,
      label: "",
    }),
  );

  // Closet zone top-right
  items.push(
    place("room-rect", rX + rW - 170, rY + 20, z++, {
      width: 150,
      height: 110,
      label: "Closet",
      style: {
        fill: "#efe6d0",
        stroke: "#8a7a55",
        strokeStyle: "solid",
        opacity: 1,
      },
    }),
  );
  items.push(
    place("door", rX + rW - 170, rY + 60, z++, { width: 8, height: 50, label: "" }),
  );

  // Rug zone framing the bed
  items.push(
    place("room-rect", rX + 50, rY + 150, z++, {
      width: 280,
      height: 220,
      label: "",
      style: {
        fill: "#f5ece0",
        stroke: "#c8b898",
        strokeStyle: "dashed",
        opacity: 1,
      },
    }),
  );

  // Bed + nightstands grouped as one unit
  const bedGroup = genId();
  items.push(
    place("bed", rX + 100, rY + 160, z++, {
      width: 180,
      height: 200,
      label: "Bed",
      groupId: bedGroup,
    }),
  );
  items.push(
    place("nightstand", rX + 60, rY + 170, z++, {
      width: 40,
      height: 40,
      label: "",
      groupId: bedGroup,
    }),
  );
  items.push(
    place("marker-icon", rX + 70, rY + 180, z++, {
      width: 20,
      height: 20,
      label: "L",
    }),
  );
  items.push(
    place("nightstand", rX + 280, rY + 170, z++, {
      width: 40,
      height: 40,
      label: "",
      groupId: bedGroup,
    }),
  );
  items.push(
    place("marker-icon", rX + 290, rY + 180, z++, {
      width: 20,
      height: 20,
      label: "L",
    }),
  );

  // Dresser opposite the bed
  items.push(
    place("dresser", rX + 110, rY + 385, z++, {
      width: 160,
      height: 50,
      label: "Dresser",
    }),
  );

  // Reading chair + side table in the corner
  items.push(
    place("armchair", rX + rW - 120, rY + 220, z++, {
      width: 60,
      height: 60,
      label: "",
    }),
  );
  items.push(
    place("nightstand", rX + rW - 60, rY + 240, z++, {
      width: 40,
      height: 40,
      label: "",
    }),
  );

  return items;
}

export const bedroom: TemplateDef = {
  id: "bedroom",
  name: "Bedroom",
  group: "Interior",
  type: "floor",
  build,
};
