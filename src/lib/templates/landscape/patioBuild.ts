import type { LayoutItem } from "../../types";
import { genId } from "../../storage";
import { place, type TemplateDef } from "../helpers";

/**
 * Patio hardscape + outdoor living setup: a sized patio slab, a grill zone
 * with a clearance marker, a dining set grouped as one movable unit, planters
 * flanking the perimeter, and a fire pit with seating ring.
 */
function build(): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;

  // Patio slab — 20×16 ft ≈ 320×260 at our 1ft ≈ 16 scale
  const pX = 1600;
  const pY = 1600;
  const pW = 440;
  const pH = 320;

  // Soft lawn zone around the patio — drawn FIRST so later items sit on top.
  items.push(
    place("room-rect", pX - 120, pY - 80, z++, {
      width: pW + 240,
      height: pH + 280,
      label: "Lawn",
      style: {
        fill: "#e6efdc",
        stroke: "#8aa070",
        strokeStyle: "dashed",
        opacity: 1,
      },
    }),
  );

  items.push(
    place("patio", pX, pY, z++, {
      width: pW,
      height: pH,
      label: "Patio — 24'×20'",
    }),
  );

  // Grill zone in the corner closest to the house — with a soft clearance
  // circle (fire code typically wants 3' clearance from combustibles).
  items.push(
    place("buffet", pX + 20, pY + 20, z++, {
      width: 90,
      height: 40,
      label: "Grill",
    }),
  );
  items.push(
    place("water", pX + 5, pY + 5, z++, {
      width: 140,
      height: 90,
      label: "Clearance",
      style: {
        fill: "#f5e8d8",
        stroke: "#c48a5a",
        strokeStyle: "dashed",
        opacity: 0.4,
      },
    }),
  );

  // Dining set — table + 6 chairs as a grouped unit
  const diningGroup = genId();
  const tableCX = pX + pW - 180;
  const tableCY = pY + 100;
  items.push(
    place("table-rect", tableCX - 70, tableCY - 40, z++, {
      width: 140,
      height: 80,
      label: "Dining",
      groupId: diningGroup,
    }),
  );
  // 3 chairs each long side
  for (let i = 0; i < 3; i++) {
    items.push(
      place("chair", tableCX - 55 + i * 40, tableCY - 65, z++, {
        width: 26,
        height: 26,
        groupId: diningGroup,
        label: "",
      }),
    );
    items.push(
      place("chair", tableCX - 55 + i * 40, tableCY + 45, z++, {
        width: 26,
        height: 26,
        groupId: diningGroup,
        label: "",
      }),
    );
  }

  // Fire pit + seating ring — grouped
  const firePitGroup = genId();
  const fpCX = pX + 120;
  const fpCY = pY + pH - 100;
  items.push(
    place("water", fpCX - 40, fpCY - 40, z++, {
      width: 80,
      height: 80,
      label: "Fire Pit",
      style: {
        fill: "#a04a2a",
        stroke: "#5a2a15",
        strokeStyle: "solid",
        opacity: 0.85,
      },
      groupId: firePitGroup,
    }),
  );
  // 4 Adirondack-style chairs around the pit
  const fpRadius = 85;
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    items.push(
      place(
        "chair",
        fpCX + Math.cos(a) * fpRadius - 18,
        fpCY + Math.sin(a) * fpRadius - 18,
        z++,
        {
          width: 36,
          height: 36,
          rotation: (a * 180) / Math.PI + 90,
          groupId: firePitGroup,
          label: "",
        },
      ),
    );
  }

  // Planters along the outer edge of the patio
  items.push(place("planter", pX + pW - 70, pY + pH - 70, z++, { width: 60, height: 60, label: "" }));
  items.push(place("planter", pX + pW + 10, pY + 30, z++, { width: 50, height: 50, label: "" }));
  items.push(place("planter", pX - 40, pY + 30, z++, { width: 50, height: 50, label: "" }));

  // Walkway leading off the patio
  items.push(
    place("path", pX + pW / 2 - 30, pY + pH, z++, {
      width: 60,
      height: 140,
      label: "Walkway",
    }),
  );

  return items;
}

export const patioBuild: TemplateDef = {
  id: "patio-build",
  name: "Patio Build (hardscape + dining)",
  group: "Landscape",
  type: "garden",
  build,
};
