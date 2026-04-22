/** Hand-rolled rectangle + circle detection over an image data URL.
 *
 *  Pipeline:
 *    1. Load image into an offscreen canvas, scaled so the long edge is
 *       SAMPLE_MAX px (faster + more uniform across input sizes).
 *    2. Grayscale → box blur (3×3, 2 passes) → Sobel gradient magnitude →
 *       threshold → binary edge image.
 *    3. Moore-neighbor contour trace collects all outer boundaries.
 *    4. Classify each contour as "rect" or "circle" based on shape heuristics.
 *    5. Map detections back to original image pixels, and then into canvas
 *       space using the ReferenceImage's current placement.
 *
 *  This is intentionally simple. It gets the skeleton of a floor plan in
 *  place; the user refines from there. See README / CLAUDE.md for the
 *  "rough by design" contract.
 */

import type { ReferenceImage } from "./types";

export interface DetectedShape {
  kind: "rect" | "circle";
  /** Canvas-space top-left + size (already mapped via the reference placement). */
  x: number;
  y: number;
  width: number;
  height: number;
  /** width / height in canvas units. 1 = square. > 1 = wider than tall. */
  aspectRatio: number;
  /** Fraction of pixels inside the bbox that were "on" in the binary edge
   *  image. Low (~0.05) = empty outline. High (~0.3) = densely drawn / filled /
   *  hatched. Used for semantic hints (beds have stripes, rugs are empty). */
  fillDensity: number;
  /** Rough size bucket in CANVAS units, for classifier use. */
  sizeClass: "xs" | "s" | "m" | "l" | "xl";
}

export interface DetectionResult {
  shapes: DetectedShape[];
  rectCount: number;
  circleCount: number;
}

const SAMPLE_MAX = 900; // px — downscale so detection runs fast on large PDFs

/** Scale-down an image and return its ImageData + the downscale factor so we
 *  can map detections back to the original coordinate space. */
async function loadSampled(
  dataUrl: string,
): Promise<{ data: ImageData; scale: number; origW: number; origH: number }> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Failed to load image"));
    el.src = dataUrl;
  });
  const origW = img.naturalWidth;
  const origH = img.naturalHeight;
  const scale = Math.min(1, SAMPLE_MAX / Math.max(origW, origH));
  const w = Math.max(1, Math.round(origW * scale));
  const h = Math.max(1, Math.round(origH * scale));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2D canvas not available");
  ctx.drawImage(img, 0, 0, w, h);
  return { data: ctx.getImageData(0, 0, w, h), scale, origW, origH };
}

/** RGBA ImageData → Uint8ClampedArray of grayscale (one byte per pixel). */
function toGray(data: ImageData): Uint8ClampedArray {
  const { width: w, height: h, data: src } = data;
  const out = new Uint8ClampedArray(w * h);
  for (let i = 0, j = 0; i < src.length; i += 4, j++) {
    // Rec. 601 luma
    out[j] = (src[i] * 299 + src[i + 1] * 587 + src[i + 2] * 114) / 1000;
  }
  return out;
}

/** In-place 3×3 box blur (separable, two 1D passes). Cheap approximation of
 *  Gaussian that's plenty for edge detection. */
function boxBlur(src: Uint8ClampedArray, w: number, h: number): Uint8ClampedArray {
  const tmp = new Uint8ClampedArray(src.length);
  // Horizontal pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - 1);
      const x1 = Math.min(w - 1, x + 1);
      tmp[y * w + x] = (src[y * w + x0] + src[y * w + x] + src[y * w + x1]) / 3;
    }
  }
  // Vertical pass
  const out = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const y0 = Math.max(0, y - 1);
      const y1 = Math.min(h - 1, y + 1);
      out[y * w + x] = (tmp[y0 * w + x] + tmp[y * w + x] + tmp[y1 * w + x]) / 3;
    }
  }
  return out;
}

/** Sobel gradient magnitude, then threshold → binary edges. Adaptive
 *  threshold is the mean magnitude × `k` so scans/photos with different
 *  contrast profiles all produce a sensible edge density. */
function sobelEdges(
  src: Uint8ClampedArray,
  w: number,
  h: number,
  k = 1.6,
): Uint8Array {
  const mag = new Float32Array(w * h);
  let sum = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const tl = src[(y - 1) * w + (x - 1)];
      const t = src[(y - 1) * w + x];
      const tr = src[(y - 1) * w + (x + 1)];
      const l = src[y * w + (x - 1)];
      const r = src[y * w + (x + 1)];
      const bl = src[(y + 1) * w + (x - 1)];
      const b = src[(y + 1) * w + x];
      const br = src[(y + 1) * w + (x + 1)];
      const gx = -tl - 2 * l - bl + tr + 2 * r + br;
      const gy = -tl - 2 * t - tr + bl + 2 * b + br;
      const m = Math.hypot(gx, gy);
      mag[y * w + x] = m;
      sum += m;
    }
  }
  const mean = sum / (w * h);
  const threshold = mean * k;
  const out = new Uint8Array(w * h);
  for (let i = 0; i < mag.length; i++) out[i] = mag[i] > threshold ? 1 : 0;
  return out;
}

/** Moore-neighbor contour trace. Walks the binary edge image and collects
 *  closed contours as polygon vertex arrays. We trace the *outline* of every
 *  connected edge blob we meet, in reading order, and mark traced pixels as
 *  visited so we don't double-count.
 *
 *  This isn't the absolute textbook Moore-neighbor algorithm — it's a
 *  simplified variant that works well enough on clean edge images. */
function traceContours(
  edges: Uint8Array,
  w: number,
  h: number,
): Array<Array<{ x: number; y: number }>> {
  const visited = new Uint8Array(edges.length);
  const contours: Array<Array<{ x: number; y: number }>> = [];
  // 8-neighbour offsets clockwise starting from east
  const NBR = [
    [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1],
  ];

  const at = (x: number, y: number) =>
    x >= 0 && x < w && y >= 0 && y < h ? edges[y * w + x] : 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (!edges[idx] || visited[idx]) continue;
      // Flood the blob to collect all its pixels (for size pre-filter + visited mark)
      const stack = [idx];
      const blobPts: Array<{ x: number; y: number }> = [];
      visited[idx] = 1;
      while (stack.length) {
        const p = stack.pop()!;
        const px = p % w;
        const py = (p - px) / w;
        blobPts.push({ x: px, y: py });
        for (let k = 0; k < 8; k++) {
          const nx = px + NBR[k][0];
          const ny = py + NBR[k][1];
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          const ni = ny * w + nx;
          if (!edges[ni] || visited[ni]) continue;
          visited[ni] = 1;
          stack.push(ni);
        }
      }
      // The "contour" for classification is the convex hull of the blob points.
      // For rect/circle detection this is enough: a true rectangle's edge
      // blob's hull *is* the rectangle, and a circle's hull approximates it.
      if (blobPts.length < 20) continue;
      contours.push(convexHull(blobPts));
    }
  }
  // Silence unused-variable warning for `at` — kept for future hole walking.
  void at;
  return contours;
}

/** Andrew's monotone chain convex hull. O(n log n). Returns counter-clockwise. */
function convexHull(
  pts: Array<{ x: number; y: number }>,
): Array<{ x: number; y: number }> {
  if (pts.length <= 2) return pts.slice();
  const sorted = pts.slice().sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (
    o: { x: number; y: number },
    a: { x: number; y: number },
    b: { x: number; y: number },
  ) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: typeof pts = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }
  const upper: typeof pts = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

interface Bbox { x: number; y: number; w: number; h: number }

function bbox(pts: Array<{ x: number; y: number }>): Bbox {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function polygonArea(pts: Array<{ x: number; y: number }>): number {
  let a = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    a += (pts[j].x + pts[i].x) * (pts[j].y - pts[i].y);
  }
  return Math.abs(a) / 2;
}

/** Classify a contour's convex hull as a rectangle, circle, or neither. */
function classify(
  hull: Array<{ x: number; y: number }>,
  bb: Bbox,
): "rect" | "circle" | null {
  const hullArea = polygonArea(hull);
  const bbArea = bb.w * bb.h;
  if (bbArea <= 0) return null;
  const fill = hullArea / bbArea; // how much of the bbox the hull fills
  const cx = bb.x + bb.w / 2;
  const cy = bb.y + bb.h / 2;
  // Rectangle: hull fills almost the whole bounding box (> ~0.9).
  if (fill > 0.9) return "rect";
  // Circle: hull fills ~π/4 ≈ 0.785 of bbox AND bbox is roughly square AND
  // points are roughly equidistant from the centroid.
  const aspect = bb.w / bb.h;
  if (fill > 0.7 && fill < 0.85 && aspect > 0.75 && aspect < 1.33) {
    const avgR = (bb.w + bb.h) / 4;
    let sumSqErr = 0;
    for (const p of hull) {
      const r = Math.hypot(p.x - cx, p.y - cy);
      sumSqErr += (r - avgR) ** 2;
    }
    const rmsErr = Math.sqrt(sumSqErr / hull.length) / avgR;
    if (rmsErr < 0.2) return "circle";
  }
  return null;
}

/** Fraction of "on" pixels inside a bbox in a binary image. */
function densityIn(
  edges: Uint8Array,
  w: number,
  bb: Bbox,
): number {
  const x0 = Math.max(0, Math.floor(bb.x));
  const y0 = Math.max(0, Math.floor(bb.y));
  const x1 = Math.floor(bb.x + bb.w);
  const y1 = Math.floor(bb.y + bb.h);
  const area = Math.max(1, (x1 - x0) * (y1 - y0));
  let on = 0;
  for (let y = y0; y < y1; y++) {
    const row = y * w;
    for (let x = x0; x < x1; x++) {
      if (edges[row + x]) on++;
    }
  }
  return on / area;
}

/** Map a bbox from sampled-image-space (SAMPLE_MAX dimension) to
 *  original-image-space, then into canvas space via the reference placement. */
function imageToCanvas(
  bb: Bbox,
  scale: number,
  ref: ReferenceImage,
  origW: number,
  origH: number,
): Bbox {
  // sampled → original
  const ox = bb.x / scale;
  const oy = bb.y / scale;
  const ow = bb.w / scale;
  const oh = bb.h / scale;
  // original-image pixel → canvas unit
  const kx = ref.width / origW;
  const ky = ref.height / origH;
  return {
    x: ref.x + ox * kx,
    y: ref.y + oy * ky,
    w: ow * kx,
    h: oh * ky,
  };
}

export async function detectShapes(
  ref: ReferenceImage,
): Promise<DetectionResult> {
  const { data, scale, origW, origH } = await loadSampled(ref.dataUrl);
  const w = data.width;
  const h = data.height;
  let gray = toGray(data);
  gray = boxBlur(gray, w, h);
  gray = boxBlur(gray, w, h);
  const edges = sobelEdges(gray, w, h);
  const contours = traceContours(edges, w, h);

  const shapes: DetectedShape[] = [];
  const imgArea = w * h;
  // Drop noise and the page-border blob. 0.2% catches slivers without killing
  // small legit shapes; 40% catches blobs that accidentally merged multiple
  // shapes into one via thin connecting strokes (common on floor plans).
  const minArea = imgArea * 0.002;
  const maxArea = imgArea * 0.4;

  for (const hull of contours) {
    const bb = bbox(hull);
    const bbArea = bb.w * bb.h;
    if (bbArea < minArea || bbArea > maxArea) continue;
    const kind = classify(hull, bb);
    if (!kind) continue;
    const density = densityIn(edges, w, bb);
    const mapped = imageToCanvas(bb, scale, ref, origW, origH);
    const aspect = mapped.w / Math.max(1, mapped.h);
    const longEdge = Math.max(mapped.w, mapped.h);
    const sizeClass: DetectedShape["sizeClass"] =
      longEdge < 40 ? "xs" :
      longEdge < 80 ? "s" :
      longEdge < 180 ? "m" :
      longEdge < 340 ? "l" : "xl";
    shapes.push({
      kind,
      x: mapped.x,
      y: mapped.y,
      width: mapped.w,
      height: mapped.h,
      aspectRatio: aspect,
      fillDensity: density,
      sizeClass,
    });
  }

  // De-duplicate near-identical detections (can happen when inner and outer
  // edges of a thick stroke both traced as separate blobs).
  const deduped: DetectedShape[] = [];
  for (const s of shapes) {
    const dup = deduped.find(
      (d) =>
        d.kind === s.kind &&
        Math.abs(d.x - s.x) < Math.max(d.width, s.width) * 0.15 &&
        Math.abs(d.y - s.y) < Math.max(d.height, s.height) * 0.15 &&
        Math.abs(d.width - s.width) < Math.max(d.width, s.width) * 0.2 &&
        Math.abs(d.height - s.height) < Math.max(d.height, s.height) * 0.2,
    );
    if (!dup) deduped.push(s);
  }

  return {
    shapes: deduped,
    rectCount: deduped.filter((s) => s.kind === "rect").length,
    circleCount: deduped.filter((s) => s.kind === "circle").length,
  };
}
