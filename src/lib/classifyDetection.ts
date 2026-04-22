import type { DetectedShape } from "./detectShapes";

/** Library type string produced by the classifier. Must match a `LibraryDef.type`
 *  registered in `objectLibrary.ts`. The commit step will look it up. */
export type ClassifiedType = string;

/** Best-guess mapping from geometric signals to a library type.
 *
 *  Rules are ordered by specificity — the first match wins. Tweak freely
 *  without touching the detector: the detector produces geometry, this file
 *  produces semantics. That separation is deliberate.
 *
 *  Size classes (longer edge, canvas units):
 *    xs  < 40     — thumb-size specks: chair dots, small details
 *    s   40-80    — single chair, nightstand, wall segment
 *    m   80-180   — table, sofa, bed, small room
 *    l   180-340  — large bed, medium room, banquet table
 *    xl  >= 340   — big rooms
 */
export function classifyDetection(s: DetectedShape): ClassifiedType {
  const { kind, sizeClass, aspectRatio: a, fillDensity: d } = s;
  // Normalize aspect so 0.5 (portrait 2:1) and 2.0 (landscape 2:1) collapse
  // to the same bucket. Classifier doesn't care about orientation.
  const ar = a >= 1 ? a : 1 / a;

  if (kind === "circle") {
    if (sizeClass === "xs" || sizeClass === "s") return "chair";
    // Everything bigger is a round table. Exact size cue preserved via
    // width/height on the committed item.
    return "table-round";
  }

  // Rectangles below — `a` was normalized into `ar` (>= 1).
  // Very thin strokes are walls regardless of size.
  if (ar >= 6) return "wall";

  switch (sizeClass) {
    case "xs":
      // xs + square → tiny nightstand/detail. xs + elongated → short wall.
      if (ar >= 3) return "wall";
      return "nightstand";

    case "s":
      if (ar >= 3) return "wall";
      if (ar >= 1.6) return "bench";
      return "chair"; // roughly square, small → probably a chair top-down

    case "m":
      if (ar >= 3) return "wall";
      if (ar >= 2) {
        // Wide-rectangle at mid size: filled/hatched → sofa, empty → bed.
        return d > 0.18 ? "sofa" : "bed";
      }
      if (ar >= 1.3) {
        // Slightly-wide mid rect: coffee table if low-density, desk if denser.
        return d > 0.18 ? "desk" : "coffee-table";
      }
      // Near-square mid rect → small square room.
      return "room-square";

    case "l":
      if (ar >= 2.5) return "room-rect"; // long room / zone
      if (ar >= 1.25 && ar < 1.7) return "bed"; // king/queen proportions
      if (ar < 1.25) return "room-square";
      return "room-rect";

    case "xl":
      return ar < 1.25 ? "room-square" : "room-rect";
  }

  return "room-rect";
}

/** Human-readable explanation for the preview UI. Optional, but helpful when
 *  the user wonders why something was tagged a given way. */
export function explainClassification(s: DetectedShape): string {
  const ar = s.aspectRatio >= 1 ? s.aspectRatio : 1 / s.aspectRatio;
  const arTxt = ar.toFixed(1);
  const dim = `${Math.round(s.width)}×${Math.round(s.height)}`;
  return `${s.kind}, ${dim}, aspect ${arTxt}:1`;
}
