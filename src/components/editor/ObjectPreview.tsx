import type { LibraryDef } from "@/lib/objectLibrary";
import { getPictogram } from "@/lib/pictograms";

export function ObjectPreview({ def, size = 44 }: { def: LibraryDef; size?: number }) {
  const ratio = def.width / def.height;
  const w = ratio >= 1 ? size : size * ratio;
  const h = ratio >= 1 ? size / ratio : size;
  const pictogram = getPictogram(def.type);

  if (pictogram) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={w}
          height={h}
          viewBox={`0 0 ${def.width} ${def.height}`}
          style={{ display: "block", overflow: "visible" }}
          preserveAspectRatio="xMidYMid meet"
        >
          {pictogram({
            w: def.width,
            h: def.height,
            fill: def.fill,
            stroke: def.stroke,
            strokeWidth: 1.5,
          })}
        </svg>
      </div>
    );
  }

  const r =
    def.shape === "circle" || def.shape === "marker"
      ? "50%"
      : def.shape === "rounded" || def.shape === "label"
        ? 8
        : 3;
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
