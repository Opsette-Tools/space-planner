import type { LayoutItem } from "../../types";
import { genId } from "../../storage";
import { place, type TemplateDef } from "../helpers";

/**
 * Living room with walls, window and door, TV/media wall on one side and
 * a seating group (sectional sofa + accent chairs + coffee table) facing
 * it. Rug zone grounds the arrangement.
 */
function build(): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;

  const rX = 1700;
  const rY = 1600;
  const rW = 600;
  const rH = 500;

  items.push(
    place("room-rect", rX, rY, z++, {
      width: rW,
      height: rH,
      label: "Living Room",
    }),
  );

  // Window on the right wall
  items.push(
    place("window", rX + rW - 4, rY + 120, z++, {
      width: 8,
      height: 140,
      label: "",
    }),
  );
  // Door on the bottom wall
  items.push(
    place("door", rX + 60, rY + rH - 4, z++, {
      width: 70,
      height: 8,
      label: "",
    }),
  );

  // Media wall on the left side (TV zone)
  items.push(
    place("buffet", rX + 20, rY + rH / 2 - 70, z++, {
      width: 40,
      height: 140,
      label: "Media",
    }),
  );

  // Rug zone defining the seating group
  items.push(
    place("room-rect", rX + 100, rY + 80, z++, {
      width: rW - 220,
      height: rH - 180,
      label: "",
      style: {
        fill: "#f5ece0",
        stroke: "#c8b898",
        strokeStyle: "dashed",
        opacity: 1,
      },
    }),
  );

  // Sectional sofa — L-shape: grouped
  const sofaGroup = genId();
  items.push(
    place("sofa", rX + 110, rY + 100, z++, {
      width: 240,
      height: 70,
      label: "",
      groupId: sofaGroup,
    }),
  );
  items.push(
    place("sofa", rX + 280, rY + 170, z++, {
      width: 70,
      height: 170,
      rotation: 0,
      label: "",
      groupId: sofaGroup,
    }),
  );

  // Coffee table centered in front of sofa
  items.push(
    place("table-rect", rX + 140, rY + 220, z++, {
      width: 140,
      height: 60,
      label: "Coffee",
    }),
  );

  // Accent chairs opposite the sofa, facing the media wall
  items.push(
    place("chair", rX + 120, rY + 330, z++, {
      width: 50,
      height: 50,
      label: "",
    }),
  );
  items.push(
    place("chair", rX + 200, rY + 330, z++, {
      width: 50,
      height: 50,
      label: "",
    }),
  );

  // Side table + floor lamp marker near sofa
  items.push(
    place("table-rect", rX + 360, rY + 100, z++, {
      width: 50,
      height: 50,
      label: "Side",
    }),
  );
  items.push(
    place("marker-icon", rX + 380, rY + 60, z++, {
      width: 22,
      height: 22,
      label: "L",
    }),
  );

  // Bookshelf on the back wall
  items.push(
    place("buffet", rX + 120, rY + 410, z++, {
      width: 200,
      height: 36,
      label: "Bookshelf",
    }),
  );

  return items;
}

export const livingRoom: TemplateDef = {
  id: "living-room",
  name: "Living Room",
  group: "Interior",
  type: "floor",
  build,
};
