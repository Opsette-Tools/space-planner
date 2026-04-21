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

  // Media wall on the left side (TV zone) — oriented so screen faces the room
  items.push(
    place("tv-stand", rX - 30, rY + rH / 2 - 20, z++, {
      width: 140,
      height: 40,
      rotation: 90,
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

  // Sectional sofa — L-shape: grouped. Long piece along the top, short piece
  // rotated 90° CW so its backrest sits on the RIGHT side (against the east wall),
  // with cushions opening west toward the coffee table.
  const sofaGroup = genId();
  items.push(
    place("sofa", rX + 110, rY + 100, z++, {
      width: 240,
      height: 70,
      label: "",
      groupId: sofaGroup,
    }),
  );
  // Short piece of the L — rotated 90° CW, tucked into the east wall and
  // extending south so the L-corner butts against the long piece.
  items.push(
    place("sofa", rX + 300, rY + 240, z++, {
      width: 170,
      height: 70,
      rotation: 90,
      label: "",
      groupId: sofaGroup,
    }),
  );

  // Coffee table centered in front of sofa
  items.push(
    place("coffee-table", rX + 140, rY + 220, z++, {
      width: 140,
      height: 60,
      label: "Coffee",
    }),
  );

  // Accent chairs opposite the sofa, facing back toward the coffee table / sofa
  items.push(
    place("armchair", rX + 120, rY + 330, z++, {
      width: 50,
      height: 50,
      rotation: 180,
      label: "",
    }),
  );
  items.push(
    place("armchair", rX + 200, rY + 330, z++, {
      width: 50,
      height: 50,
      rotation: 180,
      label: "",
    }),
  );

  // Side table + floor lamp marker near sofa
  items.push(
    place("nightstand", rX + 360, rY + 100, z++, {
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
    place("bookshelf", rX + 120, rY + 410, z++, {
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
