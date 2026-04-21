import type { LayoutItem } from "../../types";
import { place, type TemplateDef } from "../helpers";

/**
 * A property-boundary-first starter. Instead of handing the landscaper a
 * generic "Yard" rectangle, this template drops:
 *   - a dashed lot line (the property boundary)
 *   - a solid house footprint inside it
 *   - a driveway leading from the lot line to the house
 *   - hose-bib marker, north arrow, front/back yard labels
 * The landscaper adds plantings against these anchors.
 */
function build(): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;

  // Lot boundary — dashed, no fill. Simulates a survey plat.
  const lotX = 1400;
  const lotY = 1300;
  const lotW = 1100;
  const lotH = 1300;
  items.push(
    place("room-rect", lotX, lotY, z++, {
      width: lotW,
      height: lotH,
      label: "Property Line",
      style: {
        fill: "#f8f6f0",
        stroke: "#5a5a5a",
        strokeStyle: "dashed",
        opacity: 1,
      },
    }),
  );

  // House footprint — sits in the middle of the lot, roughly 40% of lot area
  const houseW = 600;
  const houseH = 480;
  const houseX = lotX + (lotW - houseW) / 2;
  const houseY = lotY + 360;
  items.push(
    place("room-rect", houseX, houseY, z++, {
      width: houseW,
      height: houseH,
      label: "House",
      style: {
        fill: "#d8d0c0",
        stroke: "#555555",
        strokeStyle: "solid",
        opacity: 1,
      },
    }),
  );

  // Driveway — from street (bottom lot line) up to the house on the right side
  const drivewayW = 130;
  const drivewayX = houseX + houseW - drivewayW - 60;
  items.push(
    place("path", drivewayX, houseY + houseH, z++, {
      width: drivewayW,
      height: lotY + lotH - (houseY + houseH) - 20,
      label: "Driveway",
    }),
  );

  // Front walkway — short path from the driveway to the front door area
  items.push(
    place("path", houseX + houseW / 2 - 30, houseY + houseH, z++, {
      width: 60,
      height: 100,
      label: "Walkway",
    }),
  );

  // North arrow (label marker) in top-right corner of lot
  items.push(
    place("marker-icon", lotX + lotW - 60, lotY + 20, z++, {
      width: 40,
      height: 40,
      label: "N",
    }),
  );

  // Hose bib markers — rear wall of house (landscapers plan around reach)
  items.push(
    place("marker-num", houseX + 20, houseY + houseH - 20, z++, {
      width: 22,
      height: 22,
      label: "H",
    }),
  );
  items.push(
    place("marker-num", houseX + houseW - 40, houseY + 20, z++, {
      width: 22,
      height: 22,
      label: "H",
    }),
  );

  // Zone labels (soft guidance — user moves/deletes freely)
  items.push(
    place("label-text", lotX + lotW / 2 - 70, lotY + 60, z++, {
      width: 140,
      height: 28,
      label: "Back Yard",
    }),
  );
  items.push(
    place("label-text", lotX + lotW / 2 - 70, lotY + lotH - 140, z++, {
      width: 140,
      height: 28,
      label: "Front Yard",
    }),
  );
  items.push(
    place("label-text", lotX + 20, houseY + houseH / 2 - 14, z++, {
      width: 100,
      height: 28,
      label: "Side Yard",
    }),
  );

  // Street label along the bottom edge
  items.push(
    place("label-text", lotX + lotW / 2 - 40, lotY + lotH + 20, z++, {
      width: 80,
      height: 22,
      label: "Street",
    }),
  );

  return items;
}

export const propertyStarter: TemplateDef = {
  id: "property-starter",
  name: "Property Starter (lot + house)",
  group: "Landscape",
  type: "garden",
  build,
};
