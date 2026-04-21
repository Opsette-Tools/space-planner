import { toPng } from "html-to-image";
import type { Layout } from "./types";

export function downloadJSON(layout: Layout) {
  const blob = new Blob([JSON.stringify(layout, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${layout.name.replace(/[^a-z0-9-_]+/gi, "_")}.layout.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function importJSON(file: File): Promise<Layout> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed.id || !Array.isArray(parsed.items)) {
          reject(new Error("Invalid layout file"));
          return;
        }
        resolve(parsed as Layout);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export async function nodeToPng(node: HTMLElement, opts?: { width?: number; height?: number; pixelRatio?: number }): Promise<string> {
  return toPng(node, {
    cacheBust: true,
    backgroundColor: "#f7f5f0",
    pixelRatio: opts?.pixelRatio ?? 1,
    width: opts?.width,
    height: opts?.height,
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}