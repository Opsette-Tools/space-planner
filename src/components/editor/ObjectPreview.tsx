import type { LibraryDef } from "@/lib/objectLibrary";

export function ObjectPreview({ def, size = 44 }: { def: LibraryDef; size?: number }) {
  const ratio = def.width / def.height;
  const w = ratio >= 1 ? size : size * ratio;
  const h = ratio >= 1 ? size / ratio : size;
  const r = def.shape === "circle" || def.shape === "marker" ? "50%" : def.shape === "rounded" || def.shape === "label" ? 8 : 3;
  return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <div
        style={{
          width: w,
          height: h,
          background: def.fill,
          border: `1.5px solid ${def.stroke}`,
          borderRadius: r,
        }}
      />
    </div>
  );
}