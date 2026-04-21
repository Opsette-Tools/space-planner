import type { LayoutItem } from "../../types";
import { genId } from "../../storage";
import { place, type TemplateDef } from "../helpers";

/**
 * Meeting room with a presentation wall (screen), whiteboard, small
 * credenza for coffee service, a window, and a labeled door. Conference
 * table + chairs are grouped so they move as one.
 */
function build(): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;

  const rX = 1700;
  const rY = 1650;
  const rW = 600;
  const rH = 420;

  items.push(
    place("room-rect", rX, rY, z++, {
      width: rW,
      height: rH,
      label: "Meeting Room",
    }),
  );

  // Door on bottom
  items.push(
    place("door", rX + 60, rY + rH - 4, z++, { width: 70, height: 8, label: "" }),
  );

  // Window on right wall
  items.push(
    place("window", rX + rW - 4, rY + 80, z++, { width: 8, height: 140, label: "" }),
  );

  // Presentation wall at the top — screen + whiteboard
  items.push(
    place("label-text", rX + rW / 2 - 70, rY + 16, z++, {
      width: 140,
      height: 22,
      label: "Screen",
    }),
  );
  items.push(
    place("label-text", rX + rW / 2 - 180, rY + 16, z++, {
      width: 100,
      height: 22,
      label: "Whiteboard",
    }),
  );

  // Credenza (coffee service) along the left wall
  items.push(
    place("buffet", rX + 20, rY + 80, z++, {
      width: 40,
      height: 160,
      label: "Credenza",
    }),
  );

  // Conference table + 8 chairs grouped
  const groupId = genId();
  const tableW = 320;
  const tableH = 110;
  const tableX = rX + rW / 2 - tableW / 2 + 20;
  const tableY = rY + 120;
  items.push(
    place("table-rect", tableX, tableY, z++, {
      width: tableW,
      height: tableH,
      label: "Table",
      groupId,
    }),
  );
  for (let i = 0; i < 4; i++) {
    items.push(
      place("chair", tableX + 20 + i * 70, tableY - 34, z++, {
        width: 28,
        height: 28,
        groupId,
        label: "",
      }),
    );
    items.push(
      place("chair", tableX + 20 + i * 70, tableY + tableH + 6, z++, {
        width: 28,
        height: 28,
        groupId,
        label: "",
      }),
    );
  }

  return items;
}

export const meetingRoom: TemplateDef = {
  id: "meeting-room",
  name: "Meeting Room",
  group: "Interior",
  type: "floor",
  build,
};
