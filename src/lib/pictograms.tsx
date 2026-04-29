import type { ReactNode } from "react";
import { SYMBOLS } from "./symbols";

export interface PictoCtx {
  w: number;
  h: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  dash?: string;
}

export type Pictogram = (ctx: PictoCtx) => ReactNode;

const darken = (hex: string, amt = 0.15): string => {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = Math.max(0, Math.round(((n >> 16) & 255) * (1 - amt)));
  const g = Math.max(0, Math.round(((n >> 8) & 255) * (1 - amt)));
  const b = Math.max(0, Math.round((n & 255) * (1 - amt)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

// Adapter: wrap a Lovable SymbolEntry into our Pictogram signature.
// Lovable's symbols render their own <svg viewBox="0 0 100 100">, so we nest it
// inside the outer layout svg at width/height = w/h with preserveAspectRatio="none"
// to allow free resize. Stroke-width is inversely scaled so lines don't fatten
// when the item grows.
const fromSymbol = (key: string, opts?: { preserve?: boolean }): Pictogram => {
  return ({ w, h, fill, stroke, strokeWidth }) => {
    const entry = SYMBOLS[key];
    if (!entry) return null;
    const SvgComp = entry.svg;
    // Rough compensation so strokes don't visually thicken too much on large items.
    const avg = (w + h) / 2;
    const scaledSw = Math.max(0.6, strokeWidth * (100 / Math.max(avg, 20)));
    return (
      <svg
        x={0}
        y={0}
        width={w}
        height={h}
        viewBox="0 0 100 100"
        preserveAspectRatio={opts?.preserve ? "xMidYMid meet" : "none"}
        overflow="visible"
      >
        <SvgComp fill={fill} stroke={stroke} strokeWidth={scaledSw} />
      </svg>
    );
  };
};

// ---------- Simple geometric pictograms (kept hand-drawn for arbitrary aspect) ----------

const chair: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  const back = Math.max(3, Math.min(h * 0.22, 8));
  const pad = Math.max(1.5, Math.min(w, h) * 0.06);
  return (
    <>
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
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
      <ellipse cx={cx} cy={cy} rx={innerRx} ry={innerRy} fill="none" stroke={stroke} strokeWidth={strokeWidth * 0.7} opacity={0.5} />
    </>
  );
};

const tableRect: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  const inset = Math.max(2, Math.min(w, h) * 0.08);
  return (
    <>
      <rect x={0.5} y={0.5} width={w - 1} height={h - 1} rx={3} ry={3} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
      <rect x={inset} y={inset} width={w - inset * 2} height={h - inset * 2} rx={2} ry={2} fill="none" stroke={stroke} strokeWidth={strokeWidth * 0.7} opacity={0.45} />
    </>
  );
};

const tableSquare: Pictogram = tableRect;

const bench: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  const plankCount = Math.max(3, Math.min(7, Math.round(w / 30)));
  const planks: number[] = [];
  for (let i = 1; i < plankCount; i++) planks.push((w * i) / plankCount);
  return (
    <>
      <rect x={0.5} y={0.5} width={w - 1} height={h - 1} rx={2} ry={2} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
      {planks.map((x) => (
        <line key={x} x1={x} y1={2} x2={x} y2={h - 2} stroke={stroke} strokeWidth={strokeWidth * 0.6} opacity={0.4} />
      ))}
    </>
  );
};

const water: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  const radius = Math.min(w, h) / 3;
  return (
    <>
      <rect x={0.5} y={0.5} width={w - 1} height={h - 1} rx={radius} ry={radius} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
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
        return <path key={t} d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth * 0.6} opacity={0.5} />;
      })}
    </>
  );
};

const planter: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  const padX = Math.max(3, w * 0.1);
  const padY = Math.max(3, h * 0.1);
  return (
    <>
      <rect x={0.5} y={0.5} width={w - 1} height={h - 1} rx={Math.min(4, w * 0.1)} ry={Math.min(4, h * 0.1)} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
      <ellipse cx={w / 2} cy={h / 2} rx={(w - padX * 2) / 2} ry={(h - padY * 2) / 2} fill={darken(fill, 0.28)} stroke={stroke} strokeWidth={strokeWidth * 0.6} opacity={0.85} />
      <circle cx={w / 2} cy={h / 2} r={Math.min(w, h) * 0.12} fill="#7a9a5a" opacity={0.7} />
    </>
  );
};

const patio: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  const paverH = Math.max(16, h / 6);
  const paverW = Math.max(30, w / 6);
  const rows = Math.ceil(h / paverH);
  const lines: ReactNode[] = [];
  for (let r = 1; r < rows; r++) {
    const y = r * paverH;
    if (y >= h - 1) continue;
    lines.push(<line key={`h-${r}`} x1={1} y1={y} x2={w - 1} y2={y} stroke={stroke} strokeWidth={strokeWidth * 0.5} opacity={0.35} />);
  }
  for (let r = 0; r < rows; r++) {
    const yTop = r * paverH;
    const yBot = Math.min((r + 1) * paverH, h - 1);
    const offset = r % 2 === 0 ? 0 : paverW / 2;
    for (let x = paverW + offset; x < w - 1; x += paverW) {
      lines.push(<line key={`v-${r}-${x}`} x1={x} y1={yTop + 1} x2={x} y2={yBot - 1} stroke={stroke} strokeWidth={strokeWidth * 0.5} opacity={0.35} />);
    }
  }
  return (
    <>
      <rect x={0.5} y={0.5} width={w - 1} height={h - 1} rx={2} ry={2} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
      {lines}
    </>
  );
};

const path: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  const isHorizontal = w >= h;
  const longDim = isHorizontal ? w : h;
  const joints = Math.max(3, Math.round(longDim / 30));
  return (
    <>
      <rect x={0.5} y={0.5} width={w - 1} height={h - 1} rx={1.5} ry={1.5} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
      {Array.from({ length: joints - 1 }, (_, i) => {
        const t = (i + 1) / joints;
        if (isHorizontal) return <line key={i} x1={w * t} y1={2} x2={w * t} y2={h - 2} stroke={stroke} strokeWidth={strokeWidth * 0.5} opacity={0.4} />;
        return <line key={i} x1={2} y1={h * t} x2={w - 2} y2={h * t} stroke={stroke} strokeWidth={strokeWidth * 0.5} opacity={0.4} />;
      })}
    </>
  );
};

// Simple horizontal desk pictogram — just the work surface with a drawer strip.
// Does NOT include a chair: templates place chairs separately. Lovable's desk
// symbol packs chair + monitor which double-draws when composed with deskSet.
const desk: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  const drawer = Math.max(4, h * 0.2);
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
        y1={h - drawer}
        x2={w - 2}
        y2={h - drawer}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.7}
        opacity={0.55}
      />
      <rect
        x={w / 2 - Math.min(10, w * 0.08)}
        y={h - drawer / 2 - 1}
        width={Math.min(20, w * 0.16)}
        height={2}
        fill={stroke}
        opacity={0.55}
      />
    </>
  );
};

const fence: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => {
  const isHorizontal = w >= h;
  const longDim = isHorizontal ? w : h;
  const posts = Math.max(4, Math.round(longDim / 18));
  return (
    <>
      <rect x={0.5} y={0.5} width={w - 1} height={h - 1} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
      {Array.from({ length: posts }, (_, i) => {
        const t = (i + 0.5) / posts;
        if (isHorizontal) return <rect key={i} x={w * t - 0.6} y={-1} width={1.2} height={h + 2} fill={stroke} opacity={0.85} />;
        return <rect key={i} x={-1} y={h * t - 0.6} width={w + 2} height={1.2} fill={stroke} opacity={0.85} />;
      })}
    </>
  );
};

// A door rendered as a thin wall-strip — used when the item's height is small
// (template usage at 50×8), so the Lovable swing-arc version doesn't get squished.
const thinStrip: Pictogram = ({ w, h, fill, stroke, strokeWidth, dash }) => (
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
);

// Door: thin-strip when the aspect ratio says "wall opening" (height < w/2),
// Lovable swing-arc version otherwise. Templates that place a 50×8 door get the
// strip; users who drag the door at its default square footprint get the arc.
const doorAdaptive: Pictogram = (ctx) => {
  if (ctx.h < ctx.w * 0.5) return thinStrip(ctx);
  return fromSymbol("door")(ctx);
};

const doubleDoorAdaptive: Pictogram = (ctx) => {
  if (ctx.h < ctx.w * 0.3) return thinStrip(ctx);
  return fromSymbol("double-door")(ctx);
};

// ---------- Registry ----------

export const PICTOGRAMS: Record<string, Pictogram> = {
  // Hand-drawn generic shapes (aspect-flexible, composable with other items)
  chair,
  "table-round": tableRound,
  "table-rect": tableRect,
  "table-square": tableSquare,
  bench,
  water,
  planter,
  patio,
  path,
  fence,

  // Furniture — Living Room
  armchair: fromSymbol("armchair", { preserve: true }),
  sofa: fromSymbol("sofa"),
  loveseat: fromSymbol("loveseat"),
  sectional: fromSymbol("sectional"),
  "coffee-table": fromSymbol("coffee-table"),
  "side-table": fromSymbol("side-table", { preserve: true }),
  "tv-stand": fromSymbol("tv-stand"),
  fireplace: fromSymbol("fireplace"),

  // Furniture — Storage
  dresser: fromSymbol("dresser"),
  credenza: fromSymbol("credenza"),
  bookshelf: fromSymbol("bookshelf-living"),
  cabinet: fromSymbol("cabinet", { preserve: true }),
  closet: fromSymbol("closet"),
  wardrobe: fromSymbol("wardrobe"),

  // Furniture — Bedroom
  bed: fromSymbol("king-bed"),
  "bed-king": fromSymbol("king-bed"),
  "bed-queen": fromSymbol("queen-bed"),
  "bed-twin": fromSymbol("twin-bed"),
  nightstand: fromSymbol("nightstand", { preserve: true }),

  // Furniture — Office
  desk,
  "l-desk": fromSymbol("l-desk", { preserve: true }),
  "office-chair": fromSymbol("office-chair", { preserve: true }),
  "filing-cabinet": fromSymbol("filing-cabinet"),
  "conference-table-oval": fromSymbol("conference-table-oval"),
  "conference-table-rect": fromSymbol("conference-table-rect"),

  // Furniture — Dining
  "dining-round-4": fromSymbol("dining-round-4"),
  "dining-rect-6": fromSymbol("dining-rect-6"),
  "dining-chair": fromSymbol("dining-chair"),
  "bar-stool": fromSymbol("bar-stool"),
  "bar-counter": fromSymbol("bar-counter"),

  // Furniture — Kitchen
  stove: fromSymbol("stove"),
  oven: fromSymbol("oven"),
  microwave: fromSymbol("microwave"),
  fridge: fromSymbol("refrigerator"),
  "kitchen-sink": fromSymbol("kitchen-sink-double"),
  "kitchen-sink-single": fromSymbol("kitchen-sink-single"),
  "kitchen-island": fromSymbol("kitchen-island"),
  "kitchen-counter": fromSymbol("kitchen-counter-straight"),
  "kitchen-counter-l": fromSymbol("kitchen-counter-l"),
  dishwasher: fromSymbol("dishwasher"),

  // Furniture — Bathroom
  toilet: fromSymbol("toilet"),
  sink: fromSymbol("wall-sink"),
  "pedestal-sink": fromSymbol("pedestal-sink"),
  vanity: fromSymbol("double-vanity"),
  bathtub: fromSymbol("bathtub"),
  shower: fromSymbol("walk-in-shower"),
  "corner-shower": fromSymbol("corner-shower"),

  // Landscape — Plants
  tree: fromSymbol("tree"),
  shrub: fromSymbol("shrub"),
  hedge: fromSymbol("hedge"),
  "potted-plant": fromSymbol("potted-plant"),
  "garden-bed": fromSymbol("garden-bed"),

  // Landscape — Hardscape
  walkway: fromSymbol("walkway"),
  deck: fromSymbol("deck"),
  driveway: fromSymbol("driveway"),
  "retaining-wall": fromSymbol("retaining-wall"),

  // Landscape — Water
  pool: fromSymbol("pool"),
  "hot-tub": fromSymbol("hot-tub"),
  pond: fromSymbol("pond"),
  fountain: fromSymbol("fountain"),
  stream: fromSymbol("stream"),

  // Landscape — Outdoor Living
  grill: fromSymbol("grill"),
  "fire-pit": fromSymbol("fire-pit"),
  umbrella: fromSymbol("patio-umbrella"),
  "outdoor-dining-set": fromSymbol("outdoor-dining-set"),
  "adirondack-chair": fromSymbol("adirondack-chair"),
  hammock: fromSymbol("hammock"),

  // Landscape — Structures
  shed: fromSymbol("shed"),
  gazebo: fromSymbol("gazebo"),
  pergola: fromSymbol("pergola"),
  mailbox: fromSymbol("mailbox"),
  "outdoor-bench": fromSymbol("bench"),

  // Event
  stage: fromSymbol("stage"),
  podium: fromSymbol("podium"),
  "dj-booth": fromSymbol("dj-booth"),
  "dance-floor": fromSymbol("dance-floor"),
  booth: fromSymbol("booth-exhibit"),
  buffet: fromSymbol("buffet-table"),
  registration: fromSymbol("registration-desk"),
  "coat-check": fromSymbol("coat-check"),
  "cocktail-round": fromSymbol("cocktail-round"),
  "event-bar": fromSymbol("event-bar"),
  "banquet-round-8": fromSymbol("banquet-round-8"),
  "banquet-round-10": fromSymbol("banquet-round-10"),
  "long-table-seating": fromSymbol("long-table-seating"),
  "theater-chair": fromSymbol("theater-chair"),
  "ceremony-chair": fromSymbol("ceremony-chair"),

  // Structural
  door: doorAdaptive,
  "double-door": doubleDoorAdaptive,
  "sliding-door": fromSymbol("sliding-door"),
  window: fromSymbol("window"),
  opening: fromSymbol("opening"),
  stairs: fromSymbol("stairs"),
};

export function getPictogram(type: string): Pictogram | undefined {
  return PICTOGRAMS[type];
}

export const _testing = { darken };
