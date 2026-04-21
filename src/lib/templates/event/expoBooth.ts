import type { LayoutItem } from "../../types";
import { place, type TemplateDef } from "../helpers";

/**
 * Booths are shown at a scale where 1 foot ≈ 10 units. A 10×10 booth is
 * therefore 100×100 units on the canvas. Adjacent aisle is drawn as a dashed
 * "zone" so planners can see traffic flow around the booth.
 */

function buildBooth10x10(): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;

  const aisleX = 1700;
  const aisleY = 1600;
  const aisleW = 400;
  const aisleH = 300;
  items.push(
    place("room-rect", aisleX, aisleY, z++, {
      width: aisleW,
      height: aisleH,
      label: "Aisle / Booth Area",
      style: { fill: "#f5f3ec", stroke: "#b8ae94", strokeStyle: "dashed", opacity: 1 },
    }),
  );

  // 10×10 booth in the center-right of the zone, back wall against the top
  const boothX = aisleX + 150;
  const boothY = aisleY + 60;
  items.push(
    place("booth", boothX, boothY, z++, {
      width: 100,
      height: 100,
      label: "10×10 Booth",
    }),
  );
  // Backdrop (along back wall)
  items.push(
    place("wall", boothX, boothY, z++, {
      width: 100,
      height: 8,
      label: "",
    }),
  );
  // Counter at the front-center
  items.push(
    place("buffet", boothX + 20, boothY + 70, z++, {
      width: 60,
      height: 22,
      label: "Counter",
    }),
  );
  // Banner stand in back corner
  items.push(
    place("marker-num", boothX + 10, boothY + 15, z++, {
      width: 18,
      height: 18,
      label: "1",
    }),
  );

  return items;
}

function buildBooth10x20(): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;

  const aisleX = 1600;
  const aisleY = 1600;
  items.push(
    place("room-rect", aisleX, aisleY, z++, {
      width: 500,
      height: 320,
      label: "Aisle / Booth Area",
      style: { fill: "#f5f3ec", stroke: "#b8ae94", strokeStyle: "dashed", opacity: 1 },
    }),
  );

  // 10×20 booth: 200 wide × 100 deep
  const boothX = aisleX + 150;
  const boothY = aisleY + 80;
  items.push(
    place("booth", boothX, boothY, z++, {
      width: 200,
      height: 100,
      label: "10×20 Booth",
    }),
  );
  // Back wall with printed graphic
  items.push(
    place("wall", boothX, boothY, z++, { width: 200, height: 8, label: "" }),
  );
  // Two counters forming a small L
  items.push(
    place("buffet", boothX + 20, boothY + 70, z++, { width: 70, height: 22, label: "Counter" }),
  );
  items.push(
    place("buffet", boothX + 120, boothY + 70, z++, { width: 60, height: 22, label: "Counter" }),
  );
  // Meeting area: small table + 2 chairs
  items.push(
    place("table-round", boothX + 90, boothY + 25, z++, { width: 45, height: 45, label: "" }),
  );
  items.push(
    place("chair", boothX + 75, boothY + 10, z++, { width: 22, height: 22, label: "" }),
  );
  items.push(
    place("chair", boothX + 130, boothY + 10, z++, { width: 22, height: 22, label: "" }),
  );

  return items;
}

function buildIsland20x20(): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;

  const aisleX = 1500;
  const aisleY = 1500;
  items.push(
    place("room-rect", aisleX, aisleY, z++, {
      width: 600,
      height: 500,
      label: "Aisles on all 4 sides",
      style: { fill: "#f5f3ec", stroke: "#b8ae94", strokeStyle: "dashed", opacity: 1 },
    }),
  );

  // 20×20 island: 200 × 200 centered
  const boothX = aisleX + 200;
  const boothY = aisleY + 150;
  items.push(
    place("booth", boothX, boothY, z++, {
      width: 200,
      height: 200,
      label: "20×20 Island",
    }),
  );

  // Center hanging sign marker
  items.push(
    place("marker-icon", boothX + 90, boothY + 90, z++, {
      width: 26,
      height: 26,
      label: "",
    }),
  );

  // Four corner "zones": counter, product display, meeting, storage
  items.push(
    place("buffet", boothX + 15, boothY + 15, z++, { width: 70, height: 22, label: "Counter" }),
  );
  items.push(
    place("table-rect", boothX + 115, boothY + 15, z++, { width: 70, height: 40, label: "Display" }),
  );
  items.push(
    place("table-round", boothX + 30, boothY + 130, z++, { width: 50, height: 50, label: "Meet" }),
  );
  items.push(
    place("chair", boothX + 10, boothY + 140, z++, { width: 24, height: 24, label: "" }),
  );
  items.push(
    place("chair", boothX + 80, boothY + 140, z++, { width: 24, height: 24, label: "" }),
  );
  items.push(
    place("booth", boothX + 120, boothY + 120, z++, {
      width: 70,
      height: 70,
      label: "Storage",
      style: { fill: "#e0d8c8", stroke: "#8a7a4a", strokeStyle: "dashed", opacity: 1 },
    }),
  );

  return items;
}

export const expoBooth10x10: TemplateDef = {
  id: "expo-booth-10x10",
  name: "Expo Booth · 10×10",
  group: "Event",
  type: "event",
  build: buildBooth10x10,
};

export const expoBooth10x20: TemplateDef = {
  id: "expo-booth-10x20",
  name: "Expo Booth · 10×20",
  group: "Event",
  type: "event",
  build: buildBooth10x20,
};

export const expoBoothIsland: TemplateDef = {
  id: "expo-booth-island",
  name: "Expo Booth · 20×20 Island",
  group: "Event",
  type: "event",
  build: buildIsland20x20,
};
