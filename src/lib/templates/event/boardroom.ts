import type { LayoutItem } from "../../types";
import { genId } from "../../storage";
import { place, type TemplateDef } from "../helpers";

function buildBoardroom(): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;

  const roomW = 700;
  const roomH = 440;
  const rX = 1650;
  const rY = 1600;
  items.push(place("room-rect", rX, rY, z++, { width: roomW, height: roomH, label: "Boardroom" }));

  // Door on the bottom wall
  items.push(
    place("door", rX + 100, rY + roomH - 4, z++, { width: 60, height: 8, label: "" }),
  );

  // Presentation wall (screen / whiteboard) at top
  items.push(
    place("label-text", rX + roomW / 2 - 90, rY + 20, z++, {
      width: 180,
      height: 22,
      label: "Screen / Whiteboard",
    }),
  );

  // Credenza along the top wall
  items.push(
    place("buffet", rX + 80, rY + 50, z++, {
      width: 300,
      height: 40,
      label: "Credenza",
    }),
  );

  // Group: conference table + surrounding chairs
  const groupId = genId();
  const tableW = 380;
  const tableH = 130;
  const tableX = rX + roomW / 2 - tableW / 2;
  const tableY = rY + roomH / 2 - tableH / 2 + 20;
  items.push(
    place("table-rect", tableX, tableY, z++, {
      width: tableW,
      height: tableH,
      label: "Conference Table",
      groupId,
    }),
  );

  // 6 chairs each long side, 1 at each short end
  const longChairs = 6;
  const longGap = tableW / (longChairs + 1);
  for (let i = 0; i < longChairs; i++) {
    items.push(
      place("chair", tableX + longGap * (i + 1) - 14, tableY - 34, z++, {
        width: 28,
        height: 28,
        groupId,
        label: "",
      }),
    );
    items.push(
      place("chair", tableX + longGap * (i + 1) - 14, tableY + tableH + 6, z++, {
        width: 28,
        height: 28,
        groupId,
        label: "",
      }),
    );
  }
  // Head chairs
  items.push(
    place("chair", tableX - 34, tableY + tableH / 2 - 14, z++, {
      width: 28,
      height: 28,
      groupId,
      label: "",
    }),
  );
  items.push(
    place("chair", tableX + tableW + 6, tableY + tableH / 2 - 14, z++, {
      width: 28,
      height: 28,
      groupId,
      label: "",
    }),
  );

  return items;
}

export const boardroom: TemplateDef = {
  id: "boardroom",
  name: "Boardroom",
  group: "Event",
  type: "event",
  build: buildBoardroom,
};
