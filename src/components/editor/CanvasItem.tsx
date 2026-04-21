import { memo } from "react";
import type { LayoutItem } from "@/lib/types";
import { findDef } from "@/lib/objectLibrary";
import { getPictogram } from "@/lib/pictograms";

interface Props {
  item: LayoutItem;
  selected?: boolean;
  preview?: boolean;
}

function CanvasItemImpl({ item, selected, preview }: Props) {
  const def = findDef(item.type);
  const shape = def?.shape ?? "rect";
  const pictogram = getPictogram(item.type);
  const dash =
    item.style.strokeStyle === "dashed"
      ? "6 4"
      : item.style.strokeStyle === "none"
        ? "0"
        : undefined;
  const strokeWidth = item.style.strokeStyle === "none" ? 0 : 1.5;
  const strokeColor = item.style.stroke;

  const bg = (
    <svg
      width={item.width}
      height={item.height}
      viewBox={`0 0 ${item.width} ${item.height}`}
      style={{ display: "block", overflow: "visible" }}
    >
      {pictogram
        ? pictogram({
            w: item.width,
            h: item.height,
            fill: item.style.fill,
            stroke: strokeColor,
            strokeWidth,
            dash,
          })
        : null}
      {!pictogram && shape === "circle" && (
        <ellipse
          cx={item.width / 2}
          cy={item.height / 2}
          rx={item.width / 2 - 1}
          ry={item.height / 2 - 1}
          fill={item.style.fill}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={dash}
        />
      )}
      {!pictogram && (shape === "rect" || shape === "line") && (
        <rect
          x={0.5}
          y={0.5}
          width={item.width - 1}
          height={item.height - 1}
          fill={item.style.fill}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={dash}
        />
      )}
      {!pictogram && (shape === "rounded" || shape === "label") && (
        <rect
          x={0.5}
          y={0.5}
          width={item.width - 1}
          height={item.height - 1}
          rx={Math.min(16, item.height / 3)}
          ry={Math.min(16, item.height / 3)}
          fill={item.style.fill}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={dash}
        />
      )}
      {!pictogram && shape === "marker" && (
        <>
          <circle
            cx={item.width / 2}
            cy={item.height / 2}
            r={item.width / 2 - 2}
            fill={item.style.fill}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={dash}
          />
        </>
      )}
    </svg>
  );

  const showLabel =
    !!item.label &&
    item.label.trim().length > 0 &&
    item.width >= 40 &&
    item.height >= 24;

  return (
    <div
      style={{
        position: "absolute",
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        transform: `rotate(${item.rotation}deg)`,
        transformOrigin: "center center",
        opacity: item.style.opacity,
        zIndex: item.zIndex,
        cursor: preview ? "grabbing" : item.locked ? "not-allowed" : "move",
        outline: selected ? `2px solid hsl(var(--selection))` : "none",
        outlineOffset: 2,
        borderRadius: shape === "circle" || shape === "marker" ? "50%" : 4,
        boxSizing: "border-box",
      }}
      data-item-id={item.id}
    >
      {bg}
      {showLabel && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#1a1a1a",
            fontSize: Math.max(10, Math.min(16, item.height / 4)),
            fontWeight: 500,
            pointerEvents: "none",
            padding: 4,
            textAlign: "center",
            textShadow: "0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          {item.label}
        </div>
      )}
      {item.locked && (
        <div
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            width: 14,
            height: 14,
            borderRadius: 4,
            background: "rgba(255,255,255,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            pointerEvents: "none",
          }}
        >
          🔒
        </div>
      )}
    </div>
  );
}

export const CanvasItem = memo(CanvasItemImpl);