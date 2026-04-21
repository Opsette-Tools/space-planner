import type { LayoutItem } from "../../types";
import { place, deskSet, type TemplateDef } from "../helpers";

/** Traditional rows of individual student desks. */
function buildRows(): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;
  const roomW = 800;
  const roomH = 700;
  const rX = 1600;
  const rY = 1500;
  items.push(place("room-rect", rX, rY, z++, { width: roomW, height: roomH, label: "Classroom" }));

  // Teacher area at top-center
  const teacher = deskSet(rX + roomW / 2, rY + 70, z, { label: "Teacher" });
  items.push(...teacher);
  z += teacher.length;
  items.push(
    place("label-text", rX + 40, rY + 40, z++, { width: 140, height: 24, label: "Whiteboard" }),
  );

  // 4 rows × 5 cols, centered under teacher
  const cols = 5;
  const rows = 4;
  const spacingX = 130;
  const spacingY = 110;
  const gridW = (cols - 1) * spacingX;
  const firstX = rX + roomW / 2 - gridW / 2;
  const firstY = rY + 240;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const set = deskSet(firstX + c * spacingX, firstY + r * spacingY, z);
      items.push(...set);
      z += set.length;
    }
  }
  return items;
}

/** Collaborative pods: 4 desks pushed together facing inward, for group work. */
function buildPods(): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;
  const roomW = 860;
  const roomH = 700;
  const rX = 1580;
  const rY = 1500;
  items.push(place("room-rect", rX, rY, z++, { width: roomW, height: roomH, label: "Classroom · Pods" }));

  const teacher = deskSet(rX + roomW / 2, rY + 70, z, { label: "Teacher" });
  items.push(...teacher);
  z += teacher.length;
  items.push(
    place("label-text", rX + 40, rY + 40, z++, { width: 140, height: 24, label: "Whiteboard" }),
  );

  // 2×3 grid of pods. Each pod = 2×2 desks arranged around a center point.
  const podSpacingX = 280;
  const podSpacingY = 230;
  const podCols = 3;
  const podRows = 2;
  const gridW = (podCols - 1) * podSpacingX;
  const firstX = rX + roomW / 2 - gridW / 2;
  const firstY = rY + 240;

  for (let pr = 0; pr < podRows; pr++) {
    for (let pc = 0; pc < podCols; pc++) {
      const cx = firstX + pc * podSpacingX;
      const cy = firstY + pr * podSpacingY;
      // 4 desks forming a square around (cx, cy)
      items.push(place("desk", cx - 80, cy - 50, z++, { width: 80, height: 50 }));
      items.push(place("desk", cx, cy - 50, z++, { width: 80, height: 50 }));
      items.push(place("desk", cx - 80, cy + 0, z++, { width: 80, height: 50 }));
      items.push(place("desk", cx, cy + 0, z++, { width: 80, height: 50 }));
      // Chairs on the outside of each desk
      items.push(place("chair", cx - 67, cy - 78, z++, { width: 26, height: 26 }));
      items.push(place("chair", cx + 13, cy - 78, z++, { width: 26, height: 26 }));
      items.push(place("chair", cx - 67, cy + 58, z++, { width: 26, height: 26 }));
      items.push(place("chair", cx + 13, cy + 58, z++, { width: 26, height: 26 }));
    }
  }
  return items;
}

/** U-shape: everyone faces the teacher, common for seminars and language classes. */
function buildUShape(): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;
  const roomW = 780;
  const roomH = 680;
  const rX = 1620;
  const rY = 1500;
  items.push(place("room-rect", rX, rY, z++, { width: roomW, height: roomH, label: "Classroom · U-shape" }));

  const teacher = deskSet(rX + roomW / 2, rY + 70, z, { label: "Teacher" });
  items.push(...teacher);
  z += teacher.length;

  // U — three long tables forming three sides facing inward.
  const tableH = 50;
  const deskLen = 120;
  // Top run (absent — that's where the teacher is)
  // Left run (going down)
  const leftCount = 5;
  const leftX = rX + 100;
  const topY = rY + 200;
  for (let i = 0; i < leftCount; i++) {
    items.push(
      place("desk", leftX, topY + i * (tableH + 20), z++, {
        width: deskLen,
        height: tableH,
        rotation: 90,
      }),
    );
    items.push(
      place("chair", leftX - 60, topY + i * (tableH + 20) + 10, z++, {
        width: 26,
        height: 26,
      }),
    );
  }

  // Right run
  const rightCount = 5;
  const rightX = rX + roomW - 100 - deskLen;
  for (let i = 0; i < rightCount; i++) {
    items.push(
      place("desk", rightX, topY + i * (tableH + 20), z++, {
        width: deskLen,
        height: tableH,
        rotation: 90,
      }),
    );
    items.push(
      place("chair", rightX + deskLen + 30, topY + i * (tableH + 20) + 10, z++, {
        width: 26,
        height: 26,
      }),
    );
  }

  // Bottom run
  const bottomY = rY + roomH - 130;
  const bottomDesks = 5;
  const bottomSpacing = 150;
  const bottomGridW = (bottomDesks - 1) * bottomSpacing;
  const bottomStartX = rX + roomW / 2 - bottomGridW / 2 - deskLen / 2;
  for (let i = 0; i < bottomDesks; i++) {
    items.push(
      place("desk", bottomStartX + i * bottomSpacing, bottomY, z++, {
        width: deskLen,
        height: tableH,
      }),
    );
    items.push(
      place("chair", bottomStartX + i * bottomSpacing + 47, bottomY + tableH + 8, z++, {
        width: 26,
        height: 26,
      }),
    );
  }

  return items;
}

/** Lecture hall: many rows of narrow chairs facing a podium; no desks. */
function buildLecture(): LayoutItem[] {
  const items: LayoutItem[] = [];
  let z = 1;
  const roomW = 900;
  const roomH = 720;
  const rX = 1550;
  const rY = 1500;
  items.push(place("room-rect", rX, rY, z++, { width: roomW, height: roomH, label: "Lecture Hall" }));

  // Stage + podium at top
  items.push(
    place("stage", rX + roomW / 2 - 140, rY + 40, z++, {
      width: 280,
      height: 70,
      label: "Stage",
    }),
  );
  items.push(
    place("podium", rX + roomW / 2 - 30, rY + 75, z++, {
      width: 60,
      height: 40,
      label: "Podium",
    }),
  );
  items.push(
    place("label-text", rX + 40, rY + 40, z++, { width: 140, height: 24, label: "Projector" }),
  );

  // 8 rows × 10 chairs, center aisle of ~100
  const chairW = 26;
  const chairGap = 8;
  const rowGap = 48;
  const rows = 8;
  const chairsPerSide = 5;
  const aisle = 80;
  const bankWidth = chairsPerSide * (chairW + chairGap) - chairGap;
  const totalWidth = bankWidth * 2 + aisle;
  const leftBankX = rX + roomW / 2 - totalWidth / 2;
  const rightBankX = leftBankX + bankWidth + aisle;
  const firstY = rY + 180;
  for (let r = 0; r < rows; r++) {
    const y = firstY + r * rowGap;
    for (let c = 0; c < chairsPerSide; c++) {
      items.push(
        place("chair", leftBankX + c * (chairW + chairGap), y, z++, {
          width: chairW,
          height: chairW,
          label: "",
        }),
      );
      items.push(
        place("chair", rightBankX + c * (chairW + chairGap), y, z++, {
          width: chairW,
          height: chairW,
          label: "",
        }),
      );
    }
  }

  return items;
}

export const classroomRows: TemplateDef = {
  id: "classroom-rows",
  name: "Classroom · Rows",
  group: "Event",
  type: "event",
  build: buildRows,
};

export const classroomPods: TemplateDef = {
  id: "classroom-pods",
  name: "Classroom · Pods",
  group: "Event",
  type: "event",
  build: buildPods,
};

export const classroomUShape: TemplateDef = {
  id: "classroom-u-shape",
  name: "Classroom · U-shape",
  group: "Event",
  type: "event",
  build: buildUShape,
};

export const classroomLecture: TemplateDef = {
  id: "classroom-lecture",
  name: "Lecture Hall",
  group: "Event",
  type: "event",
  build: buildLecture,
};
