import type { ReactNode } from "react";

export interface PictoCtx {
  w: number;
  h: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  dash?: string;
}

export type Pictogram = (ctx: PictoCtx) => ReactNode;

const lighten = (hex: string, amt = 0.12): string => {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = Math.min(255, Math.round(((n >> 16) & 255) + 255 * amt));
  const g = Math.min(255, Math.round(((n >> 8) & 255) + 255 * amt));
  const b = Math.min(255, Math.round((n & 255) + 255 * amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

const darken = (hex: string, amt = 0.15): string => {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = Math.max(0, Math.round(((n >> 16) & 255) * (1 - amt)));
  const g = Math.max(0, Math.round(((n >> 8) & 255) * (1 - amt)));
  const b = Math.max(0, Math.round((n & 255) * (1 - amt)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

// ---------- Furniture ----------

const chair: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Backrest: strip along the "top" edge (short side toward top). Seat: inset body.
  const back = Math.max(3, Math.min(h * 0.22, 8));
  const pad = Math.max(1.5, Math.min(w, h) * 0.06);
  return (
    <>
      {/* Seat */}
      <rect
        x={pad}
        y={back + pad * 0.5}
        width={w - pad * 2}
        height={h - back - pad * 1.5}
        rx={Math.min(4, (h - back) / 4)}
        ry={Math.min(4, (h - back) / 4)}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {/* Backrest */}
      <rect
        x={pad}
        y={pad * 0.5}
        width={w - pad * 2}
        height={back}
        rx={Math.min(2, back / 2)}
        ry={Math.min(2, back / 2)}
        fill={darken(fill, 0.12)}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
    </>
  );
};

const tableRound: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  const cx = w / 2;
  const cy = h / 2;
  const rx = w / 2 - 1;
  const ry = h / 2 - 1;
  const innerRx = Math.max(2, rx * 0.55);
  const innerRy = Math.max(2, ry * 0.55);
  return (
    <>
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {/* Inner ring to suggest tabletop */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={innerRx}
        ry={innerRy}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth * 0.7}
        opacity={0.5}
      />
    </>
  );
};

const tableRect: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Rectangular dining/work table: outer rect + inset rect to suggest tabletop edge.
  const inset = Math.max(2, Math.min(w, h) * 0.08);
  return (
    <>
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={3}
        ry={3}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      <rect
        x={inset}
        y={inset}
        width={w - inset * 2}
        height={h - inset * 2}
        rx={2}
        ry={2}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth * 0.7}
        opacity={0.45}
      />
    </>
  );
};

const desk: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Work surface with a drawer strip on the bottom and a monitor hint on top-left.
  const drawer = Math.max(4, h * 0.22);
  const monitorW = Math.min(w * 0.28, 36);
  const monitorH = Math.max(3, h * 0.1);
  return (
    <>
      {/* Desk body */}
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={2}
        ry={2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {/* Drawer strip along the bottom */}
      <line
        x1={2}
        y1={h - drawer}
        x2={w - 2}
        y2={h - drawer}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.8}
        opacity={0.55}
      />
      {/* Drawer pull */}
      <rect
        x={w / 2 - Math.min(10, w * 0.08)}
        y={h - drawer / 2 - 1}
        width={Math.min(20, w * 0.16)}
        height={2}
        fill={stroke}
        opacity={0.55}
      />
      {/* Monitor/keyboard hint */}
      <rect
        x={Math.max(3, w * 0.08)}
        y={Math.max(3, h * 0.2)}
        width={monitorW}
        height={monitorH}
        rx={1}
        ry={1}
        fill={darken(fill, 0.18)}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.6}
        opacity={0.75}
      />
    </>
  );
};

const sofa: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Sofa: rounded body, two armrests at ends, a backrest strip along the top,
  // and two seat cushion divisions.
  const arm = Math.max(5, Math.min(w * 0.1, 18));
  const back = Math.max(5, h * 0.28);
  const radius = Math.min(10, h / 3);
  return (
    <>
      {/* Body */}
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={radius}
        ry={radius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {/* Backrest strip */}
      <rect
        x={arm}
        y={1.5}
        width={w - arm * 2}
        height={back}
        rx={radius * 0.6}
        ry={radius * 0.6}
        fill={darken(fill, 0.1)}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.7}
        opacity={0.85}
      />
      {/* Seat cushion divider(s) - two cushions for most widths, three for very wide */}
      {w >= 180 ? (
        <>
          <line
            x1={arm + (w - arm * 2) / 3}
            y1={back + 2}
            x2={arm + (w - arm * 2) / 3}
            y2={h - 2}
            stroke={stroke}
            strokeWidth={strokeWidth * 0.6}
            opacity={0.5}
          />
          <line
            x1={arm + ((w - arm * 2) * 2) / 3}
            y1={back + 2}
            x2={arm + ((w - arm * 2) * 2) / 3}
            y2={h - 2}
            stroke={stroke}
            strokeWidth={strokeWidth * 0.6}
            opacity={0.5}
          />
        </>
      ) : (
        <line
          x1={w / 2}
          y1={back + 2}
          x2={w / 2}
          y2={h - 2}
          stroke={stroke}
          strokeWidth={strokeWidth * 0.6}
          opacity={0.5}
        />
      )}
    </>
  );
};

const bench: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Bench: long slat body + 3-5 vertical slat lines suggesting wood planks.
  const plankCount = Math.max(3, Math.min(7, Math.round(w / 30)));
  const planks: number[] = [];
  for (let i = 1; i < plankCount; i++) {
    planks.push((w * i) / plankCount);
  }
  return (
    <>
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={2}
        ry={2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {planks.map((x) => (
        <line
          key={x}
          x1={x}
          y1={2}
          x2={x}
          y2={h - 2}
          stroke={stroke}
          strokeWidth={strokeWidth * 0.6}
          opacity={0.4}
        />
      ))}
    </>
  );
};

const armchair: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Armchair: thicker arms on both sides, backrest strip at top, seat cushion.
  const arm = Math.max(4, Math.min(w * 0.18, 12));
  const back = Math.max(4, h * 0.22);
  const radius = Math.min(8, h / 4);
  return (
    <>
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={radius}
        ry={radius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {/* Backrest strip */}
      <rect
        x={arm}
        y={1.5}
        width={w - arm * 2}
        height={back}
        rx={radius * 0.5}
        ry={radius * 0.5}
        fill={darken(fill, 0.12)}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.7}
        opacity={0.85}
      />
      {/* Arm dividers */}
      <line
        x1={arm}
        y1={back + 2}
        x2={arm}
        y2={h - 2}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.6}
        opacity={0.5}
      />
      <line
        x1={w - arm}
        y1={back + 2}
        x2={w - arm}
        y2={h - 2}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.6}
        opacity={0.5}
      />
    </>
  );
};

const coffeeTable: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Rounded low table with a faint inner rounded-rect to suggest lower shelf.
  const radius = Math.min(10, h / 2.5);
  const inset = Math.max(3, Math.min(w, h) * 0.1);
  return (
    <>
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={radius}
        ry={radius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      <rect
        x={inset}
        y={inset}
        width={w - inset * 2}
        height={h - inset * 2}
        rx={radius * 0.6}
        ry={radius * 0.6}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth * 0.6}
        opacity={0.4}
      />
    </>
  );
};

const dresser: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Wide low chest with 3×2 drawer grid + small drawer pulls.
  const cols = 3;
  const rows = 2;
  return (
    <>
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={2}
        ry={2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {/* Horizontal divider */}
      <line
        x1={2}
        y1={h / 2}
        x2={w - 2}
        y2={h / 2}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.6}
        opacity={0.55}
      />
      {/* Vertical dividers */}
      {Array.from({ length: cols - 1 }, (_, i) => (
        <line
          key={i}
          x1={(w * (i + 1)) / cols}
          y1={2}
          x2={(w * (i + 1)) / cols}
          y2={h - 2}
          stroke={stroke}
          strokeWidth={strokeWidth * 0.6}
          opacity={0.55}
        />
      ))}
      {/* Drawer pulls */}
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const cx = (w * (c + 0.5)) / cols;
          const cy = (h * (r + 0.5)) / rows;
          const pullW = Math.min(12, w / cols / 3);
          return (
            <rect
              key={`${r}-${c}`}
              x={cx - pullW / 2}
              y={cy - 1}
              width={pullW}
              height={2}
              fill={stroke}
              opacity={0.5}
            />
          );
        }),
      )}
    </>
  );
};

const credenza: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Long low cabinet: 3 or 4 cabinet-door divisions with thin vertical divider lines,
  // no horizontal split (contrasts dresser).
  const panels = w >= 220 ? 4 : 3;
  return (
    <>
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={2}
        ry={2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {/* Thin decorative line near the top (credenza cap/lip) */}
      <line
        x1={2}
        y1={Math.max(3, h * 0.14)}
        x2={w - 2}
        y2={Math.max(3, h * 0.14)}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.5}
        opacity={0.4}
      />
      {/* Cabinet door dividers */}
      {Array.from({ length: panels - 1 }, (_, i) => (
        <line
          key={i}
          x1={(w * (i + 1)) / panels}
          y1={Math.max(4, h * 0.18)}
          x2={(w * (i + 1)) / panels}
          y2={h - 2}
          stroke={stroke}
          strokeWidth={strokeWidth * 0.6}
          opacity={0.5}
        />
      ))}
      {/* Small door-knob dots */}
      {Array.from({ length: panels }, (_, i) => {
        const cx = (w * (i + 0.5)) / panels;
        return (
          <circle
            key={i}
            cx={cx}
            cy={h * 0.6}
            r={Math.min(1.5, h / 20)}
            fill={stroke}
            opacity={0.55}
          />
        );
      })}
    </>
  );
};

const bookshelf: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Narrow or wide shelf with 3-5 horizontal shelf lines + some vertical "book" ticks.
  const shelves = Math.max(3, Math.min(6, Math.round(h / 18)));
  return (
    <>
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={1.5}
        ry={1.5}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {Array.from({ length: shelves - 1 }, (_, i) => {
        const y = (h * (i + 1)) / shelves;
        return (
          <line
            key={i}
            x1={2}
            y1={y}
            x2={w - 2}
            y2={y}
            stroke={stroke}
            strokeWidth={strokeWidth * 0.7}
            opacity={0.55}
          />
        );
      })}
      {/* Book ticks on every other shelf */}
      {Array.from({ length: shelves }, (_, i) => {
        if (i % 2 !== 0) return null;
        const rowTop = (h * i) / shelves + 2;
        const rowBot = (h * (i + 1)) / shelves - 2;
        const bookCount = Math.max(3, Math.floor(w / 12));
        return (
          <g key={i}>
            {Array.from({ length: bookCount - 1 }, (_, b) => (
              <line
                key={b}
                x1={(w * (b + 1)) / bookCount}
                y1={rowTop}
                x2={(w * (b + 1)) / bookCount}
                y2={rowBot}
                stroke={stroke}
                strokeWidth={strokeWidth * 0.5}
                opacity={0.35}
              />
            ))}
          </g>
        );
      })}
    </>
  );
};

const tvStand: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Low stand with a dark screen rectangle centered on top + a cabinet line.
  const screenW = w * 0.7;
  const screenH = h * 0.4;
  const screenX = (w - screenW) / 2;
  const screenY = h * 0.12;
  return (
    <>
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={2}
        ry={2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {/* TV screen */}
      <rect
        x={screenX}
        y={screenY}
        width={screenW}
        height={screenH}
        rx={1}
        ry={1}
        fill={darken(fill, 0.45)}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.6}
        opacity={0.85}
      />
      {/* Cabinet line below screen */}
      <line
        x1={2}
        y1={h * 0.68}
        x2={w - 2}
        y2={h * 0.68}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.6}
        opacity={0.5}
      />
      {/* Two cabinet door divisions below */}
      <line
        x1={w / 2}
        y1={h * 0.68}
        x2={w / 2}
        y2={h - 2}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.6}
        opacity={0.5}
      />
    </>
  );
};

const bed: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Bed oriented with headboard along the "top" (shorter side if portrait).
  // Headboard strip + mattress body + 2 pillows + comforter fold line.
  const headboard = Math.max(6, h * 0.08);
  const pillowGap = Math.max(2, w * 0.03);
  const pillowW = (w - pillowGap * 3) / 2;
  const pillowH = Math.max(6, h * 0.12);
  const pillowY = headboard + pillowGap;
  const foldY = headboard + pillowH + pillowGap * 2 + Math.max(8, h * 0.18);
  return (
    <>
      {/* Mattress body */}
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={4}
        ry={4}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {/* Headboard */}
      <rect
        x={1}
        y={1}
        width={w - 2}
        height={headboard}
        rx={2}
        ry={2}
        fill={darken(fill, 0.18)}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.7}
      />
      {/* Pillows */}
      <rect
        x={pillowGap}
        y={pillowY}
        width={pillowW}
        height={pillowH}
        rx={3}
        ry={3}
        fill={lighten(fill, 0.15)}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.6}
        opacity={0.9}
      />
      <rect
        x={pillowGap * 2 + pillowW}
        y={pillowY}
        width={pillowW}
        height={pillowH}
        rx={3}
        ry={3}
        fill={lighten(fill, 0.15)}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.6}
        opacity={0.9}
      />
      {/* Comforter fold line */}
      {foldY < h - 6 && (
        <line
          x1={3}
          y1={foldY}
          x2={w - 3}
          y2={foldY}
          stroke={stroke}
          strokeWidth={strokeWidth * 0.6}
          opacity={0.45}
        />
      )}
    </>
  );
};

const nightstand: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Small square with a single drawer line + pull.
  return (
    <>
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={2}
        ry={2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      <line
        x1={2}
        y1={h * 0.4}
        x2={w - 2}
        y2={h * 0.4}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.6}
        opacity={0.55}
      />
      <rect
        x={w / 2 - Math.min(6, w * 0.15)}
        y={h * 0.58}
        width={Math.min(12, w * 0.3)}
        height={1.5}
        fill={stroke}
        opacity={0.55}
      />
    </>
  );
};

// ---------- Event ----------

const stage: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Raised platform: outer rect + a "rise" line along the front edge (bottom)
  // indicating a step up. Subtle diagonal hatching suggests floor boards.
  const rise = Math.max(4, h * 0.08);
  return (
    <>
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={2}
        ry={2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {/* Front rise / step line */}
      <line
        x1={2}
        y1={h - rise}
        x2={w - 2}
        y2={h - rise}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.9}
        opacity={0.6}
      />
      {/* Plank suggestion lines */}
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={w * t}
          y1={2}
          x2={w * t}
          y2={h - rise - 1}
          stroke={stroke}
          strokeWidth={strokeWidth * 0.5}
          opacity={0.3}
        />
      ))}
    </>
  );
};

const booth: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Exhibit booth: back wall strip + counter strip at front + side walls.
  const back = Math.max(4, h * 0.14);
  const counter = Math.max(4, h * 0.18);
  const side = Math.max(3, w * 0.08);
  return (
    <>
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={2}
        ry={2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {/* Back wall */}
      <rect
        x={1}
        y={1}
        width={w - 2}
        height={back}
        fill={darken(fill, 0.18)}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.6}
        opacity={0.85}
      />
      {/* Side walls */}
      <rect
        x={1}
        y={back}
        width={side}
        height={h - back - counter}
        fill={darken(fill, 0.1)}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.5}
        opacity={0.65}
      />
      <rect
        x={w - 1 - side}
        y={back}
        width={side}
        height={h - back - counter}
        fill={darken(fill, 0.1)}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.5}
        opacity={0.65}
      />
      {/* Counter at front */}
      <rect
        x={1}
        y={h - 1 - counter}
        width={w - 2}
        height={counter}
        fill={darken(fill, 0.14)}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.6}
        opacity={0.8}
      />
    </>
  );
};

const podium: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Lectern viewed from above: a trapezoidal angled top surface + base rectangle.
  // The slanted line suggests the angled reading surface.
  const baseInset = Math.max(2, Math.min(w, h) * 0.12);
  return (
    <>
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={2}
        ry={2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {/* Angled top surface: a trapezoid narrower at top, wider at bottom */}
      <polygon
        points={`${baseInset * 1.4},${baseInset} ${w - baseInset * 1.4},${baseInset} ${w - baseInset},${h - baseInset} ${baseInset},${h - baseInset}`}
        fill={darken(fill, 0.15)}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.6}
        opacity={0.85}
      />
      {/* Slanted reading-surface line */}
      <line
        x1={baseInset * 1.4}
        y1={baseInset}
        x2={w - baseInset * 1.4}
        y2={baseInset}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={0.7}
      />
    </>
  );
};

const buffet: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Long serving table: divided into 3-5 "stations" with small circular platters/chafers.
  const stations = Math.max(3, Math.min(6, Math.round(w / 50)));
  return (
    <>
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={2}
        ry={2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {/* Station dividers */}
      {Array.from({ length: stations - 1 }, (_, i) => (
        <line
          key={i}
          x1={(w * (i + 1)) / stations}
          y1={2}
          x2={(w * (i + 1)) / stations}
          y2={h - 2}
          stroke={stroke}
          strokeWidth={strokeWidth * 0.5}
          opacity={0.4}
        />
      ))}
      {/* Chafing dishes / platters — one per station */}
      {Array.from({ length: stations }, (_, i) => {
        const cx = (w * (i + 0.5)) / stations;
        const cy = h / 2;
        const r = Math.min(h * 0.3, (w / stations) * 0.25);
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill={darken(fill, 0.12)}
            stroke={stroke}
            strokeWidth={strokeWidth * 0.6}
            opacity={0.85}
          />
        );
      })}
    </>
  );
};

const registration: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Welcome / check-in counter: table body + a small signage strip along the back
  // and a couple of stacks (nameplates / badges).
  const sign = Math.max(3, h * 0.22);
  return (
    <>
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={2}
        ry={2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {/* Signage strip along the back */}
      <rect
        x={1}
        y={1}
        width={w - 2}
        height={sign}
        fill={darken(fill, 0.16)}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.6}
        opacity={0.85}
      />
      {/* Two badge/material stacks on the counter */}
      {[0.28, 0.72].map((t) => {
        const cx = w * t;
        const stackW = Math.min(16, w * 0.12);
        const stackH = Math.max(3, h * 0.22);
        return (
          <rect
            key={t}
            x={cx - stackW / 2}
            y={sign + (h - sign - stackH) / 2}
            width={stackW}
            height={stackH}
            rx={1}
            ry={1}
            fill={lighten(fill, 0.18)}
            stroke={stroke}
            strokeWidth={strokeWidth * 0.5}
            opacity={0.9}
          />
        );
      })}
    </>
  );
};

const danceFloor: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Classic dance floor: a square-tile checker pattern using the fill and a
  // darker variant. Works for any size because tile count derives from the
  // smaller dimension.
  const minDim = Math.min(w, h);
  const targetTile = minDim >= 180 ? minDim / 6 : minDim / 4;
  const cols = Math.max(3, Math.round(w / targetTile));
  const rows = Math.max(3, Math.round(h / targetTile));
  const tileW = w / cols;
  const tileH = h / rows;
  const alt = darken(fill, 0.22);
  const tiles: ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c) % 2 === 0) continue;
      tiles.push(
        <rect
          key={`${r}-${c}`}
          x={c * tileW}
          y={r * tileH}
          width={tileW}
          height={tileH}
          fill={alt}
          opacity={0.8}
        />,
      );
    }
  }
  return (
    <>
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {tiles}
      {/* Re-stroke the outer border above the tiles */}
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
    </>
  );
};

// ---------- Landscape ----------

const tree: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Canopy with small cloud-like lobes + a trunk stub peeking out the bottom.
  const cx = w / 2;
  const cy = h / 2;
  const mainR = Math.min(w, h) / 2 - 2;
  const trunkW = Math.max(3, mainR * 0.18);
  const trunkH = Math.max(3, mainR * 0.22);
  const lobeR = mainR * 0.35;
  // Four smaller lobes on the cardinal-ish points of the canopy to break the circle
  const lobes: [number, number][] = [
    [cx - mainR * 0.55, cy - mainR * 0.3],
    [cx + mainR * 0.55, cy - mainR * 0.25],
    [cx - mainR * 0.3, cy - mainR * 0.55],
    [cx + mainR * 0.25, cy + mainR * 0.2],
  ];
  return (
    <>
      {/* Trunk stub — drawn first so canopy overlaps it */}
      <rect
        x={cx - trunkW / 2}
        y={cy + mainR * 0.5}
        width={trunkW}
        height={trunkH}
        fill={darken(fill, 0.4)}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.6}
        opacity={0.85}
      />
      {/* Main canopy */}
      <circle
        cx={cx}
        cy={cy}
        r={mainR}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {/* Canopy lobes */}
      {lobes.map(([lx, ly], i) => (
        <circle
          key={i}
          cx={lx}
          cy={ly}
          r={lobeR}
          fill={lighten(fill, 0.08)}
          stroke={stroke}
          strokeWidth={strokeWidth * 0.5}
          opacity={0.7}
        />
      ))}
      {/* Center highlight */}
      <circle
        cx={cx - mainR * 0.15}
        cy={cy - mainR * 0.15}
        r={mainR * 0.28}
        fill={lighten(fill, 0.18)}
        opacity={0.55}
      />
    </>
  );
};

const shrub: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Three overlapping lobes (cloud-shape) — no trunk, fuller than a tree canopy.
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) / 2 - 2;
  const lobes: [number, number, number][] = [
    [cx - r * 0.35, cy + r * 0.1, r * 0.65],
    [cx + r * 0.35, cy + r * 0.1, r * 0.65],
    [cx, cy - r * 0.35, r * 0.6],
  ];
  return (
    <>
      {lobes.map(([lx, ly, lr], i) => (
        <circle
          key={i}
          cx={lx}
          cy={ly}
          r={lr}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={dash}
          opacity={0.95}
        />
      ))}
    </>
  );
};

const water: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Water feature — rounded blob with horizontal ripple/wave lines.
  const radius = Math.min(w, h) / 3;
  return (
    <>
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={radius}
        ry={radius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {/* Ripple lines — 3 wavy curves using quadratic paths */}
      {[0.35, 0.55, 0.75].map((t) => {
        const y = h * t;
        const amp = Math.min(3, h * 0.04);
        const wavelen = Math.max(20, w / 4);
        const pts: string[] = [];
        let toggle = 1;
        for (let x = w * 0.2; x <= w * 0.8; x += wavelen) {
          pts.push(`${x},${y + amp * toggle}`);
          toggle *= -1;
        }
        const d = `M ${w * 0.15} ${y} Q ` + pts.join(" ");
        return (
          <path
            key={t}
            d={d}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth * 0.6}
            opacity={0.5}
          />
        );
      })}
    </>
  );
};

const gardenBed: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Soil-textured bed with a scattering of small plant dots.
  const radius = Math.min(16, h / 3);
  // Deterministic pseudo-random scatter using indices
  const dots: [number, number, number][] = [];
  const count = Math.max(6, Math.floor((w * h) / 800));
  for (let i = 0; i < count; i++) {
    // Simple hash for deterministic spread
    const a = (i * 9301 + 49297) % 233280;
    const b = (i * 7919 + 10091) % 233280;
    const dx = (a / 233280) * (w - 12) + 6;
    const dy = (b / 233280) * (h - 12) + 6;
    const r = 1.5 + ((i * 31) % 5) * 0.4;
    dots.push([dx, dy, r]);
  }
  return (
    <>
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={radius}
        ry={radius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {dots.map(([dx, dy, r], i) => (
        <circle
          key={i}
          cx={dx}
          cy={dy}
          r={r}
          fill={darken(fill, 0.25)}
          opacity={0.5}
        />
      ))}
    </>
  );
};

const planter: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Pot opening viewed from above: outer rect + inner darker oval for soil surface.
  const padX = Math.max(3, w * 0.1);
  const padY = Math.max(3, h * 0.1);
  return (
    <>
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={Math.min(4, w * 0.1)}
        ry={Math.min(4, h * 0.1)}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      <ellipse
        cx={w / 2}
        cy={h / 2}
        rx={(w - padX * 2) / 2}
        ry={(h - padY * 2) / 2}
        fill={darken(fill, 0.28)}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.6}
        opacity={0.85}
      />
      {/* Small plant sprout — center tuft */}
      <circle
        cx={w / 2}
        cy={h / 2}
        r={Math.min(w, h) * 0.12}
        fill="#7a9a5a"
        opacity={0.7}
      />
    </>
  );
};

const patio: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Paver grid pattern — stone-like rectangles with a running-bond offset per row.
  const paverH = Math.max(16, h / 6);
  const paverW = Math.max(30, w / 6);
  const rows = Math.ceil(h / paverH);
  const lines: ReactNode[] = [];
  // Horizontal joint lines
  for (let r = 1; r < rows; r++) {
    const y = r * paverH;
    if (y >= h - 1) continue;
    lines.push(
      <line
        key={`h-${r}`}
        x1={1}
        y1={y}
        x2={w - 1}
        y2={y}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.5}
        opacity={0.35}
      />,
    );
  }
  // Vertical joints offset every other row (running bond)
  for (let r = 0; r < rows; r++) {
    const yTop = r * paverH;
    const yBot = Math.min((r + 1) * paverH, h - 1);
    const offset = r % 2 === 0 ? 0 : paverW / 2;
    for (let x = paverW + offset; x < w - 1; x += paverW) {
      lines.push(
        <line
          key={`v-${r}-${x}`}
          x1={x}
          y1={yTop + 1}
          x2={x}
          y2={yBot - 1}
          stroke={stroke}
          strokeWidth={strokeWidth * 0.5}
          opacity={0.35}
        />,
      );
    }
  }
  return (
    <>
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={2}
        ry={2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {lines}
    </>
  );
};

const path: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Walking path: horizontal rect with paver joint ticks across its length.
  const isHorizontal = w >= h;
  const longDim = isHorizontal ? w : h;
  const joints = Math.max(3, Math.round(longDim / 30));
  return (
    <>
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={1.5}
        ry={1.5}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {Array.from({ length: joints - 1 }, (_, i) => {
        const t = (i + 1) / joints;
        if (isHorizontal) {
          return (
            <line
              key={i}
              x1={w * t}
              y1={2}
              x2={w * t}
              y2={h - 2}
              stroke={stroke}
              strokeWidth={strokeWidth * 0.5}
              opacity={0.4}
            />
          );
        }
        return (
          <line
            key={i}
            x1={2}
            y1={h * t}
            x2={w - 2}
            y2={h * t}
            stroke={stroke}
            strokeWidth={strokeWidth * 0.5}
            opacity={0.4}
          />
        );
      })}
    </>
  );
};

const fence: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Thin horizontal strip with regular post ticks above/below the centerline.
  const isHorizontal = w >= h;
  const longDim = isHorizontal ? w : h;
  const posts = Math.max(4, Math.round(longDim / 18));
  return (
    <>
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {Array.from({ length: posts }, (_, i) => {
        const t = (i + 0.5) / posts;
        if (isHorizontal) {
          const x = w * t;
          return (
            <rect
              key={i}
              x={x - 0.6}
              y={-1}
              width={1.2}
              height={h + 2}
              fill={stroke}
              opacity={0.85}
            />
          );
        }
        const y = h * t;
        return (
          <rect
            key={i}
            x={-1}
            y={y - 0.6}
            width={w + 2}
            height={1.2}
            fill={stroke}
            opacity={0.85}
          />
        );
      })}
    </>
  );
};

// ---------- Structural ----------

const door: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Door shown as a thin leaf strip + a quarter-circle swing arc originating
  // at one hinge end. Arc radius equals the long side.
  const isHorizontal = w >= h;
  const leafT = Math.max(2, Math.min(w, h));
  const longDim = isHorizontal ? w : h;
  // Hinge at the origin corner (x=0, y=0 for horizontal; same for vertical).
  // Draw door leaf and arc swinging into the "interior" side (below for horizontal,
  // right for vertical).
  return (
    <>
      {/* Wall opening indicator — the door leaf along the wall */}
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {/* Swing arc */}
      {isHorizontal ? (
        <>
          <path
            d={`M 0 ${leafT / 2} A ${longDim} ${longDim} 0 0 1 ${longDim} ${leafT / 2}`}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth * 0.8}
            opacity={0.55}
            strokeDasharray="3 3"
          />
          {/* Door leaf swung open 90° — shown as a line perpendicular to the wall */}
          <line
            x1={0}
            y1={leafT / 2}
            x2={0}
            y2={longDim}
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={0.8}
          />
        </>
      ) : (
        <>
          <path
            d={`M ${leafT / 2} 0 A ${longDim} ${longDim} 0 0 0 ${leafT / 2} ${longDim}`}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth * 0.8}
            opacity={0.55}
            strokeDasharray="3 3"
          />
          <line
            x1={leafT / 2}
            y1={0}
            x2={longDim}
            y2={0}
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={0.8}
          />
        </>
      )}
    </>
  );
};

const windowPicto: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  // Window: wall-strip with a double line running along its length (indicating glazing).
  const isHorizontal = w >= h;
  return (
    <>
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {isHorizontal ? (
        <>
          <line
            x1={2}
            y1={h * 0.35}
            x2={w - 2}
            y2={h * 0.35}
            stroke={stroke}
            strokeWidth={strokeWidth * 0.8}
            opacity={0.75}
          />
          <line
            x1={2}
            y1={h * 0.65}
            x2={w - 2}
            y2={h * 0.65}
            stroke={stroke}
            strokeWidth={strokeWidth * 0.8}
            opacity={0.75}
          />
        </>
      ) : (
        <>
          <line
            x1={w * 0.35}
            y1={2}
            x2={w * 0.35}
            y2={h - 2}
            stroke={stroke}
            strokeWidth={strokeWidth * 0.8}
            opacity={0.75}
          />
          <line
            x1={w * 0.65}
            y1={2}
            x2={w * 0.65}
            y2={h - 2}
            stroke={stroke}
            strokeWidth={strokeWidth * 0.8}
            opacity={0.75}
          />
        </>
      )}
    </>
  );
};

// ---------- Registry ----------

export const PICTOGRAMS: Record<string, Pictogram> = {
  chair,
  armchair,
  "table-round": tableRound,
  "table-rect": tableRect,
  "coffee-table": coffeeTable,
  desk,
  sofa,
  bench,
  dresser,
  credenza,
  bookshelf,
  "tv-stand": tvStand,
  bed,
  nightstand,
  stage,
  booth,
  podium,
  buffet,
  registration,
  "dance-floor": danceFloor,
  tree,
  shrub,
  water,
  "garden-bed": gardenBed,
  planter,
  patio,
  path,
  fence,
  door,
  window: windowPicto,
};

export function getPictogram(type: string): Pictogram | undefined {
  return PICTOGRAMS[type];
}

// Exported for unit-like visual checks / reuse
export const _testing = { lighten, darken };
