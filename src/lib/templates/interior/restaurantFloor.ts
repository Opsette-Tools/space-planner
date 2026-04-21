import type { LayoutItem } from "../../types";
import { genId } from "../../storage";
import { place, type TemplateDef } from "../helpers";

/**
 * Restaurant dining room: entry + host stand, bar with stools, booth
 * seating against one wall, a mix of 2-tops on the walls and 4-tops in the
 * middle, back-of-house door, restroom marker.
 */
function build(): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;

  const rX = 1400;
  const rY = 1500;
  const rW = 1100;
  const rH = 700;

  items.push(
    place("room-rect", rX, rY, z++, {
      width: rW,
      height: rH,
      label: "Dining Room",
    }),
  );

  // Entry on bottom-left, host stand just inside
  items.push(
    place("door", rX + 40, rY + rH - 4, z++, { width: 70, height: 8, label: "" }),
  );
  items.push(
    place("buffet", rX + 40, rY + rH - 90, z++, {
      width: 100,
      height: 50,
      label: "Host",
    }),
  );

  // Bar across the top
  items.push(
    place("buffet", rX + 240, rY + 20, z++, {
      width: 360,
      height: 45,
      label: "Bar",
    }),
  );
  // Bar stools
  for (let i = 0; i < 8; i++) {
    items.push(
      place("chair", rX + 260 + i * 42, rY + 75, z++, {
        width: 24,
        height: 24,
        label: "",
      }),
    );
  }

  // Back-of-house door top-right
  items.push(
    place("door", rX + rW - 100, rY - 4, z++, { width: 60, height: 8, label: "" }),
  );
  items.push(
    place("label-text", rX + rW - 160, rY + 14, z++, {
      width: 110,
      height: 22,
      label: "Kitchen",
    }),
  );

  // Restroom corridor marker top-right
  items.push(
    place("label-text", rX + rW - 80, rY + 80, z++, {
      width: 70,
      height: 22,
      label: "Restroom",
    }),
  );

  // Booth seating along the right wall
  for (let i = 0; i < 3; i++) {
    const bY = rY + 140 + i * 130;
    const boothGroup = genId();
    items.push(
      place("sofa", rX + rW - 160, bY, z++, {
        width: 140,
        height: 40,
        label: "",
        groupId: boothGroup,
      }),
    );
    items.push(
      place("table-rect", rX + rW - 150, bY + 40, z++, {
        width: 120,
        height: 40,
        label: "",
        groupId: boothGroup,
      }),
    );
    items.push(
      place("sofa", rX + rW - 160, bY + 80, z++, {
        width: 140,
        height: 40,
        label: "",
        groupId: boothGroup,
      }),
    );
  }

  // 2-tops along the left wall
  for (let i = 0; i < 3; i++) {
    const tY = rY + 140 + i * 120;
    const twoTopGroup = genId();
    items.push(
      place("table-rect", rX + 30, tY, z++, {
        width: 80,
        height: 60,
        label: "",
        groupId: twoTopGroup,
      }),
    );
    items.push(
      place("chair", rX + 40, tY - 28, z++, {
        width: 24,
        height: 24,
        groupId: twoTopGroup,
        label: "",
      }),
    );
    items.push(
      place("chair", rX + 40, tY + 64, z++, {
        width: 24,
        height: 24,
        groupId: twoTopGroup,
        label: "",
      }),
    );
  }

  // 4-tops in the center
  const centerCols = 3;
  const centerRows = 2;
  for (let r = 0; r < centerRows; r++) {
    for (let c = 0; c < centerCols; c++) {
      const cx = rX + 280 + c * 170;
      const cy = rY + 220 + r * 180;
      const fourTopGroup = genId();
      items.push(
        place("table-rect", cx - 50, cy - 40, z++, {
          width: 100,
          height: 80,
          label: "",
          groupId: fourTopGroup,
        }),
      );
      items.push(place("chair", cx - 40, cy - 68, z++, { width: 24, height: 24, groupId: fourTopGroup, label: "" }));
      items.push(place("chair", cx + 16, cy - 68, z++, { width: 24, height: 24, groupId: fourTopGroup, label: "" }));
      items.push(place("chair", cx - 40, cy + 44, z++, { width: 24, height: 24, groupId: fourTopGroup, label: "" }));
      items.push(place("chair", cx + 16, cy + 44, z++, { width: 24, height: 24, groupId: fourTopGroup, label: "" }));
    }
  }

  return items;
}

export const restaurantFloor: TemplateDef = {
  id: "restaurant-floor",
  name: "Restaurant Dining Room",
  group: "Interior",
  type: "floor",
  build,
};
