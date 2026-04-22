import type { CanvasSettings, ReferenceImage } from "./types";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const PDF_TYPE = "application/pdf";

/** Read any File as a base64 data URL. */
function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

/** Get natural pixel dimensions of an image data URL. */
function probeDims(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = dataUrl;
  });
}

/** Rasterize page 1 of a PDF to a PNG data URL at ~2x for clarity. */
async function pdfToPng(file: File): Promise<{ dataUrl: string; width: number; height: number }> {
  // Lazy-load pdfjs. Its worker is also loaded from the same ESM entry.
  const pdfjs = await import("pdfjs-dist");
  // pdf.js needs its worker. Vite serves the worker URL statically via the ?url import.
  // We resolve the worker URL at runtime so the main bundle stays small.
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D not available");
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return {
    dataUrl: canvas.toDataURL("image/png"),
    width: canvas.width,
    height: canvas.height,
  };
}

/** Given the natural image size and the target canvas, compute a centered
 *  placement that fills ~70% of the canvas width (or height, whichever binds). */
function fitPlacement(
  naturalW: number,
  naturalH: number,
  canvas: CanvasSettings,
): { x: number; y: number; width: number; height: number } {
  const targetW = canvas.width * 0.7;
  const targetH = canvas.height * 0.7;
  const scale = Math.min(targetW / naturalW, targetH / naturalH);
  const width = naturalW * scale;
  const height = naturalH * scale;
  return {
    x: (canvas.width - width) / 2,
    y: (canvas.height - height) / 2,
    width,
    height,
  };
}

/** Turn an imported file into a ReferenceImage positioned on the given canvas.
 *  Supports PNG, JPG, WebP, and PDF (page 1, rasterized). Throws on unsupported
 *  file types or on decode failures. */
export async function fileToReference(
  file: File,
  canvas: CanvasSettings,
): Promise<ReferenceImage> {
  let dataUrl: string;
  let naturalW: number;
  let naturalH: number;

  if (file.type === PDF_TYPE || file.name.toLowerCase().endsWith(".pdf")) {
    const rendered = await pdfToPng(file);
    dataUrl = rendered.dataUrl;
    naturalW = rendered.width;
    naturalH = rendered.height;
  } else if (IMAGE_TYPES.includes(file.type) || /\.(png|jpe?g|webp)$/i.test(file.name)) {
    dataUrl = await readAsDataUrl(file);
    const dims = await probeDims(dataUrl);
    naturalW = dims.width;
    naturalH = dims.height;
  } else {
    throw new Error("Unsupported file type. Use PNG, JPG, or PDF.");
  }

  const placement = fitPlacement(naturalW, naturalH, canvas);
  return {
    dataUrl,
    ...placement,
    opacity: 0.4,
    visible: true,
    locked: true,
  };
}

export const REFERENCE_ACCEPT =
  "image/png,image/jpeg,image/webp,application/pdf,.png,.jpg,.jpeg,.webp,.pdf";
