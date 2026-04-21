import type { LayoutItem } from "../../types";
import { place, type TemplateDef } from "../helpers";

/**
 * Studio apartment layout: an efficient open-plan unit with a sleeping zone,
 * a kitchen counter run, a compact dining nook, a small living area, and a
 * bathroom pocket. Windows and entry door included.
 */
function build(): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;

  const rX = 1700;
  const rY = 1600;
  const rW = 650;
  const rH = 520;

  items.push(
    place("room-rect", rX, rY, z++, {
      width: rW,
      height: rH,
      label: "Studio",
    }),
  );

  // Windows on the top wall
  items.push(
    place("window", rX + 80, rY - 4, z++, { width: 120, height: 8, label: "" }),
  );
  items.push(
    place("window", rX + rW - 200, rY - 4, z++, { width: 120, height: 8, label: "" }),
  );

  // Entry door on the bottom wall
  items.push(
    place("door", rX + rW / 2 - 35, rY + rH - 4, z++, {
      width: 70,
      height: 8,
      label: "",
    }),
  );

  // Bathroom pocket — top-right corner
  items.push(
    place("room-rect", rX + rW - 160, rY + 20, z++, {
      width: 140,
      height: 130,
      label: "Bath",
      style: {
        fill: "#d8e4ec",
        stroke: "#5b7a8a",
        strokeStyle: "solid",
        opacity: 1,
      },
    }),
  );
  items.push(
    place("door", rX + rW - 160, rY + 60, z++, {
      width: 8,
      height: 50,
      label: "",
    }),
  );

  // Sleeping zone — top-left
  items.push(
    place("room-rect", rX + 20, rY + 20, z++, {
      width: 260,
      height: 170,
      label: "Bed Zone",
      style: {
        fill: "#efe6d0",
        stroke: "#8a7a55",
        strokeStyle: "dashed",
        opacity: 1,
      },
    }),
  );
  items.push(
    place("sofa", rX + 50, rY + 50, z++, { width: 200, height: 100, label: "Bed" }),
  );
  items.push(
    place("table-rect", rX + 30, rY + 50, z++, {
      width: 30,
      height: 40,
      label: "",
    }),
  );

  // Kitchen counter run along the middle of the left wall
  items.push(
    place("buffet", rX + 20, rY + 220, z++, { width: 40, height: 220, label: "" }),
  );
  items.push(
    place("label-text", rX + 70, rY + 300, z++, { width: 100, height: 22, label: "Kitchen" }),
  );
  // Stove + sink markers
  items.push(
    place("marker-num", rX + 28, rY + 240, z++, { width: 22, height: 22, label: "S" }),
  );
  items.push(
    place("marker-num", rX + 28, rY + 310, z++, { width: 22, height: 22, label: "K" }),
  );

  // Dining nook — small table + 2 chairs near the kitchen
  items.push(
    place("table-round", rX + 200, rY + 260, z++, { width: 70, height: 70, label: "" }),
  );
  items.push(place("chair", rX + 175, rY + 240, z++, { width: 24, height: 24, label: "" }));
  items.push(place("chair", rX + 260, rY + 275, z++, { width: 24, height: 24, label: "" }));

  // Living area — sofa + coffee table facing toward the entry
  items.push(
    place("sofa", rX + rW - 200, rY + 220, z++, {
      width: 180,
      height: 65,
      label: "",
    }),
  );
  items.push(
    place("table-rect", rX + rW - 170, rY + 300, z++, {
      width: 100,
      height: 45,
      label: "",
    }),
  );
  items.push(
    place("chair", rX + rW - 200, rY + 370, z++, { width: 44, height: 44, label: "" }),
  );

  // Desk / work corner
  items.push(
    place("desk", rX + 180, rY + 420, z++, { width: 100, height: 50, label: "Desk" }),
  );
  items.push(
    place("chair", rX + 210, rY + 470, z++, { width: 26, height: 26, label: "" }),
  );

  return items;
}

export const studioRoom: TemplateDef = {
  id: "studio-room",
  name: "Studio Apartment",
  group: "Interior",
  type: "floor",
  build,
};
