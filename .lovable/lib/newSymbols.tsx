import * as React from "react";

export type SymbolProps = {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
};

export type SymbolCategory =
  // Interior
  | "Kitchen"
  | "Bathroom"
  | "Bedroom"
  | "Living Room"
  | "Office"
  | "Dining"
  | "Storage"
  // Landscape
  | "Plants"
  | "Hardscape"
  | "Water"
  | "Outdoor Living"
  | "Outdoor Structures"
  // Event
  | "Event Seating"
  | "Event Tables"
  | "Event Stage"
  | "Event Service"
  // Structural
  | "Walls"
  | "Doors"
  | "Windows";

export type SymbolEntry = {
  label: string;
  category: SymbolCategory;
  svg: React.FC<SymbolProps>;
};

const DEFAULTS = {
  fill: "#c8d3e0",
  stroke: "#5b6b80",
  strokeWidth: 1.5,
};

// Helper to build a base svg with consistent styling
const Svg: React.FC<React.PropsWithChildren<SymbolProps>> = ({
  fill = DEFAULTS.fill,
  stroke = DEFAULTS.stroke,
  strokeWidth = DEFAULTS.strokeWidth,
  children,
}) => (
  <svg
    viewBox="0 0 100 100"
    width="100"
    height="100"
    xmlns="http://www.w3.org/2000/svg"
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

// Build a chair circle ring around a table center
const chairRing = (cx: number, cy: number, r: number, count: number, chairR: number) => {
  const out: React.ReactElement[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    out.push(<circle key={i} cx={x} cy={y} r={chairR} />);
  }
  return out;
};

/* ---------------- KITCHEN ---------------- */

const Stove: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="15" y="15" width="70" height="70" rx="3" />
    <rect x="15" y="15" width="70" height="10" />
    <circle cx="35" cy="45" r="10" />
    <circle cx="65" cy="45" r="10" />
    <circle cx="35" cy="72" r="8" />
    <circle cx="65" cy="72" r="8" />
    <circle cx="22" cy="20" r="1.5" stroke="none" />
    <circle cx="32" cy="20" r="1.5" stroke="none" />
    <circle cx="68" cy="20" r="1.5" stroke="none" />
    <circle cx="78" cy="20" r="1.5" stroke="none" />
  </Svg>
);

const Refrigerator: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="20" y="10" width="60" height="80" rx="2" />
    <line x1="20" y1="35" x2="80" y2="35" />
    <rect x="72" y="18" width="3" height="10" />
    <rect x="72" y="50" width="3" height="14" />
  </Svg>
);

const KitchenSinkDouble: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="8" y="25" width="84" height="50" rx="2" />
    <rect x="14" y="32" width="33" height="36" rx="3" fill="#fff" />
    <rect x="53" y="32" width="33" height="36" rx="3" fill="#fff" />
    <circle cx="50" cy="29" r="2" stroke="none" />
  </Svg>
);

const KitchenSinkSingle: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="15" y="25" width="70" height="50" rx="2" />
    <rect x="22" y="32" width="56" height="36" rx="3" fill="#fff" />
    <circle cx="50" cy="29" r="2" stroke="none" />
  </Svg>
);

const KitchenIsland: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="10" y="35" width="80" height="30" rx="2" />
    <line x1="10" y1="50" x2="90" y2="50" />
    <circle cx="22" cy="78" r="5" fill="#fff" />
    <circle cx="42" cy="78" r="5" fill="#fff" />
    <circle cx="62" cy="78" r="5" fill="#fff" />
    <circle cx="82" cy="78" r="5" fill="#fff" />
  </Svg>
);

const KitchenCounterL: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <path d="M 10 20 L 90 20 L 90 50 L 40 50 L 40 90 L 10 90 Z" />
    <path d="M 16 26 L 84 26 L 84 44 L 34 44 L 34 84 L 16 84 Z" fill="none" />
  </Svg>
);

const KitchenCounterStraight: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="10" y="35" width="80" height="30" />
    <line x1="10" y1="42" x2="90" y2="42" />
    <line x1="10" y1="58" x2="90" y2="58" />
  </Svg>
);

const Dishwasher: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="18" y="15" width="64" height="70" rx="2" />
    <rect x="18" y="15" width="64" height="10" />
    <rect x="44" y="19" width="12" height="2" stroke="none" />
    <line x1="25" y1="35" x2="75" y2="35" />
    <rect x="28" y="42" width="44" height="38" rx="2" fill="#fff" />
  </Svg>
);

const Microwave: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="10" y="30" width="80" height="40" rx="2" />
    <rect x="14" y="34" width="55" height="32" rx="1" fill="#fff" />
    <line x1="74" y1="38" x2="86" y2="38" />
    <line x1="74" y1="44" x2="86" y2="44" />
    <circle cx="80" cy="58" r="3" fill="#fff" />
  </Svg>
);

const Oven: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="15" y="15" width="70" height="70" rx="2" />
    <rect x="15" y="15" width="70" height="12" />
    <circle cx="25" cy="21" r="1.5" stroke="none" />
    <circle cx="35" cy="21" r="1.5" stroke="none" />
    <circle cx="65" cy="21" r="1.5" stroke="none" />
    <circle cx="75" cy="21" r="1.5" stroke="none" />
    <rect x="22" y="34" width="56" height="46" rx="2" fill="#fff" />
    <line x1="30" y1="40" x2="70" y2="40" />
  </Svg>
);

/* ---------------- BATHROOM ---------------- */

const Toilet: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    {/* tank */}
    <rect x="32" y="10" width="36" height="22" rx="2" />
    {/* flush valve */}
    <circle cx="50" cy="21" r="2" stroke="none" />
    {/* connection */}
    <rect x="44" y="30" width="12" height="6" />
    {/* bowl */}
    <ellipse cx="50" cy="60" rx="22" ry="28" />
    <ellipse cx="50" cy="62" rx="16" ry="22" fill="#fff" />
  </Svg>
);

const WallSink: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    {/* flat edge against top wall, curve outward */}
    <path d="M 18 25 L 82 25 A 32 32 0 0 1 18 25 Z" />
    <path d="M 28 28 L 72 28 A 22 22 0 0 1 28 28 Z" fill="#fff" />
    <circle cx="50" cy="29" r="2" stroke="none" />
  </Svg>
);

const PedestalSink: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <ellipse cx="50" cy="50" rx="26" ry="32" />
    <ellipse cx="50" cy="52" rx="18" ry="22" fill="#fff" />
    <circle cx="50" cy="22" r="2" stroke="none" />
  </Svg>
);

const DoubleVanity: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="6" y="30" width="88" height="40" rx="2" />
    <ellipse cx="30" cy="50" rx="14" ry="11" fill="#fff" />
    <ellipse cx="70" cy="50" rx="14" ry="11" fill="#fff" />
    <circle cx="30" cy="34" r="1.5" stroke="none" />
    <circle cx="70" cy="34" r="1.5" stroke="none" />
  </Svg>
);

const Bathtub: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="14" y="22" width="72" height="56" rx="14" />
    <rect x="20" y="34" width="60" height="38" rx="10" fill="#fff" />
    {/* faucet end */}
    <circle cx="22" cy="28" r="2" stroke="none" />
    <circle cx="30" cy="28" r="1.5" stroke="none" />
    <circle cx="14" cy="50" r="1.5" stroke="none" />
    {/* drain */}
    <circle cx="26" cy="50" r="2" fill="#fff" />
  </Svg>
);

const WalkInShower: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="12" y="12" width="76" height="76" rx="2" />
    <line x1="12" y1="12" x2="88" y2="88" />
    <line x1="88" y1="12" x2="12" y2="88" />
    <circle cx="50" cy="50" r="5" fill="#fff" />
    <circle cx="50" cy="50" r="2" stroke="none" />
  </Svg>
);

const CornerShower: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <path d="M 12 12 L 88 12 A 76 76 0 0 1 12 88 Z" />
    <path d="M 12 22 L 78 22 A 56 56 0 0 1 22 78 L 12 78 Z" fill="#fff" />
    <circle cx="30" cy="30" r="3" fill={DEFAULTS.fill} />
    <circle cx="30" cy="30" r="1" stroke="none" />
  </Svg>
);

/* ---------------- BEDROOM ---------------- */

const bed = (w: number) => {
  const x = (100 - w) / 2;
  return (p: SymbolProps) => (
    <Svg {...p}>
      {/* headboard */}
      <rect x={x} y={8} width={w} height={6} />
      {/* mattress */}
      <rect x={x} y={14} width={w} height={70} rx={3} />
      {/* pillows */}
      <rect x={x + 4} y={18} width={(w - 12) / 2} height={14} rx={2} fill="#fff" />
      <rect x={x + 8 + (w - 12) / 2} y={18} width={(w - 12) / 2} height={14} rx={2} fill="#fff" />
      {/* comforter fold */}
      <line x1={x + 3} y1={64} x2={x + w - 3} y2={64} />
    </Svg>
  );
};

const KingBed = bed(80);
const QueenBed = bed(64);

const TwinBed: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="32" y="10" width="36" height="5" />
    <rect x="32" y="15" width="36" height="72" rx="3" />
    <rect x="36" y="19" width="28" height="13" rx="2" fill="#fff" />
    <line x1="34" y1="62" x2="66" y2="62" />
  </Svg>
);

const Nightstand: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="22" y="22" width="56" height="56" rx="2" />
    <line x1="22" y1="42" x2="78" y2="42" />
    <rect x="46" y="49" width="8" height="2" stroke="none" />
  </Svg>
);

const Dresser: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="8" y="28" width="84" height="44" rx="2" />
    <line x1="8" y1="50" x2="92" y2="50" />
    <line x1="36" y1="28" x2="36" y2="72" />
    <line x1="64" y1="28" x2="64" y2="72" />
    <rect x="20" y="38" width="6" height="2" stroke="none" />
    <rect x="48" y="38" width="6" height="2" stroke="none" />
    <rect x="76" y="38" width="6" height="2" stroke="none" />
    <rect x="20" y="60" width="6" height="2" stroke="none" />
    <rect x="48" y="60" width="6" height="2" stroke="none" />
    <rect x="76" y="60" width="6" height="2" stroke="none" />
  </Svg>
);

const Wardrobe: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="14" y="18" width="72" height="64" rx="2" />
    <line x1="50" y1="18" x2="50" y2="82" />
    <circle cx="46" cy="50" r="1.5" stroke="none" />
    <circle cx="54" cy="50" r="1.5" stroke="none" />
    <line x1="20" y1="28" x2="80" y2="28" strokeDasharray="2 2" />
  </Svg>
);

/* ---------------- LIVING ROOM ---------------- */

const Sofa: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    {/* back + arms outline */}
    <path d="M 8 32 L 92 32 L 92 70 L 8 70 Z" />
    {/* arms */}
    <rect x="8" y="38" width="10" height="32" />
    <rect x="82" y="38" width="10" height="32" />
    {/* cushions */}
    <rect x="20" y="44" width="20" height="24" rx="2" fill="#fff" />
    <rect x="40" y="44" width="20" height="24" rx="2" fill="#fff" />
    <rect x="60" y="44" width="20" height="24" rx="2" fill="#fff" />
    {/* arm pillows */}
    <rect x="10" y="42" width="6" height="6" fill="#fff" />
    <rect x="84" y="42" width="6" height="6" fill="#fff" />
  </Svg>
);

const Loveseat: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <path d="M 18 35 L 82 35 L 82 68 L 18 68 Z" />
    <rect x="18" y="40" width="8" height="28" />
    <rect x="74" y="40" width="8" height="28" />
    <rect x="28" y="44" width="20" height="20" rx="2" fill="#fff" />
    <rect x="52" y="44" width="20" height="20" rx="2" fill="#fff" />
  </Svg>
);

const Sectional: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <path d="M 8 22 L 60 22 L 60 60 L 92 60 L 92 88 L 8 88 Z" />
    <rect x="14" y="30" width="14" height="14" rx="2" fill="#fff" />
    <rect x="30" y="30" width="14" height="14" rx="2" fill="#fff" />
    <rect x="46" y="30" width="12" height="14" rx="2" fill="#fff" />
    <rect x="14" y="68" width="14" height="14" rx="2" fill="#fff" />
    <rect x="30" y="68" width="14" height="14" rx="2" fill="#fff" />
    <rect x="46" y="68" width="14" height="14" rx="2" fill="#fff" />
    <rect x="62" y="68" width="14" height="14" rx="2" fill="#fff" />
    <rect x="78" y="68" width="12" height="14" rx="2" fill="#fff" />
  </Svg>
);

const Armchair: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <path d="M 20 22 L 80 22 L 80 80 L 20 80 Z" />
    <rect x="20" y="30" width="10" height="50" />
    <rect x="70" y="30" width="10" height="50" />
    <rect x="32" y="34" width="36" height="42" rx="3" fill="#fff" />
  </Svg>
);

const CoffeeTable: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="14" y="34" width="72" height="32" rx="3" />
    <rect x="20" y="40" width="60" height="20" rx="2" fill="none" />
  </Svg>
);

const SideTable: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="28" y="28" width="44" height="44" rx="3" />
    <circle cx="50" cy="50" r="14" fill="none" />
  </Svg>
);

const TVStand: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="8" y="50" width="84" height="20" rx="2" />
    <rect x="22" y="32" width="56" height="14" rx="1" />
    <rect x="26" y="36" width="48" height="6" fill="#fff" />
    <line x1="8" y1="60" x2="92" y2="60" />
  </Svg>
);

const Bookshelf: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="18" y="10" width="64" height="80" rx="1" />
    <line x1="18" y1="30" x2="82" y2="30" />
    <line x1="18" y1="50" x2="82" y2="50" />
    <line x1="18" y1="70" x2="82" y2="70" />
    {[14, 22, 30, 38, 46, 54, 62, 70].map((x, i) => (
      <line key={`a-${i}`} x1={20 + (i % 8) * 8} y1="14" x2={20 + (i % 8) * 8} y2="28" />
    ))}
    {[14, 22, 30, 38, 46, 54, 62, 70].map((_, i) => (
      <line key={`b-${i}`} x1={20 + i * 8} y1="34" x2={20 + i * 8} y2="48" />
    ))}
  </Svg>
);

const Fireplace: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="6" y="30" width="88" height="32" />
    <rect x="22" y="38" width="56" height="18" fill="#fff" />
    <path d="M 36 56 L 42 46 L 48 54 L 54 44 L 60 54 L 64 48" fill="none" />
  </Svg>
);

/* ---------------- OFFICE ---------------- */

const Desk: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="10" y="28" width="80" height="32" rx="2" />
    {/* monitor */}
    <rect x="38" y="32" width="24" height="10" fill="#fff" />
    <line x1="50" y1="42" x2="50" y2="46" />
    {/* chair */}
    <path d="M 35 70 L 65 70 L 65 80 L 35 80 Z" fill="#fff" />
    <line x1="35" y1="73" x2="65" y2="73" />
  </Svg>
);

const LDesk: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <path d="M 10 20 L 90 20 L 90 50 L 50 50 L 50 90 L 10 90 Z" />
    <rect x="60" y="26" width="20" height="8" fill="#fff" />
    <circle cx="30" cy="70" r="8" fill="#fff" />
  </Svg>
);

const OfficeChair: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <path d="M 25 30 L 75 30 L 75 60 L 25 60 Z" />
    <circle cx="50" cy="50" r="14" fill="#fff" />
    <rect x="46" y="60" width="8" height="14" />
    <line x1="40" y1="78" x2="60" y2="78" />
  </Svg>
);

const FilingCabinet: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="28" y="12" width="44" height="76" rx="2" />
    <line x1="28" y1="33" x2="72" y2="33" />
    <line x1="28" y1="54" x2="72" y2="54" />
    <line x1="28" y1="75" x2="72" y2="75" />
    <rect x="46" y="20" width="8" height="3" stroke="none" />
    <rect x="46" y="41" width="8" height="3" stroke="none" />
    <rect x="46" y="62" width="8" height="3" stroke="none" />
    <rect x="46" y="80" width="8" height="3" stroke="none" />
  </Svg>
);

const ConferenceTableOval: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <ellipse cx="50" cy="50" rx="38" ry="22" />
    <ellipse cx="50" cy="50" rx="32" ry="16" fill="none" />
    <circle cx="14" cy="50" r="5" fill="#fff" />
    <circle cx="86" cy="50" r="5" fill="#fff" />
    <circle cx="32" cy="20" r="5" fill="#fff" />
    <circle cx="50" cy="18" r="5" fill="#fff" />
    <circle cx="68" cy="20" r="5" fill="#fff" />
    <circle cx="32" cy="80" r="5" fill="#fff" />
    <circle cx="50" cy="82" r="5" fill="#fff" />
    <circle cx="68" cy="80" r="5" fill="#fff" />
  </Svg>
);

const ConferenceTableRect: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="14" y="32" width="72" height="36" rx="2" />
    <circle cx="14" cy="50" r="5" fill="#fff" />
    <circle cx="86" cy="50" r="5" fill="#fff" />
    {[26, 42, 58, 74].map((x) => (
      <React.Fragment key={x}>
        <circle cx={x} cy="24" r="5" fill="#fff" />
        <circle cx={x} cy="76" r="5" fill="#fff" />
      </React.Fragment>
    ))}
  </Svg>
);

/* ---------------- DINING ---------------- */

const DiningRound4: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <circle cx="50" cy="50" r="22" />
    {chairRing(50, 50, 36, 4, 6)}
  </Svg>
);

const DiningRect6: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="22" y="22" width="56" height="56" rx="2" />
    <circle cx="14" cy="50" r="5" fill="#fff" />
    <circle cx="86" cy="50" r="5" fill="#fff" />
    <circle cx="34" cy="14" r="5" fill="#fff" />
    <circle cx="50" cy="14" r="5" fill="#fff" />
    <circle cx="66" cy="14" r="5" fill="#fff" />
    <circle cx="34" cy="86" r="5" fill="#fff" />
    <circle cx="50" cy="86" r="5" fill="#fff" />
    <circle cx="66" cy="86" r="5" fill="#fff" />
  </Svg>
);

const DiningChair: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="32" y="32" width="36" height="36" rx="3" />
    <rect x="32" y="32" width="36" height="6" />
  </Svg>
);

const BarStool: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <circle cx="50" cy="50" r="20" />
    <circle cx="50" cy="50" r="14" fill="#fff" />
    <circle cx="50" cy="50" r="3" stroke="none" />
  </Svg>
);

const BarCounter: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="6" y="30" width="88" height="20" />
    <line x1="6" y1="40" x2="94" y2="40" />
    <circle cx="20" cy="68" r="6" fill="#fff" />
    <circle cx="40" cy="68" r="6" fill="#fff" />
    <circle cx="60" cy="68" r="6" fill="#fff" />
    <circle cx="80" cy="68" r="6" fill="#fff" />
  </Svg>
);

/* ---------------- STORAGE ---------------- */

const Credenza: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="6" y="35" width="88" height="30" rx="1" />
    <line x1="32" y1="35" x2="32" y2="65" />
    <line x1="68" y1="35" x2="68" y2="65" />
    <circle cx="19" cy="50" r="1.5" stroke="none" />
    <circle cx="50" cy="50" r="1.5" stroke="none" />
    <circle cx="81" cy="50" r="1.5" stroke="none" />
  </Svg>
);

const Cabinet: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="22" y="14" width="56" height="72" rx="1" />
    <line x1="50" y1="14" x2="50" y2="86" />
    <circle cx="46" cy="50" r="1.5" stroke="none" />
    <circle cx="54" cy="50" r="1.5" stroke="none" />
  </Svg>
);

const Closet: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="10" y="28" width="80" height="44" rx="1" />
    <line x1="10" y1="36" x2="90" y2="36" strokeDasharray="3 2" />
    {/* hangers */}
    {[20, 30, 40, 50, 60, 70, 80].map((x) => (
      <line key={x} x1={x} y1="40" x2={x} y2="68" />
    ))}
  </Svg>
);

/* ---------------- PLANTS ---------------- */

const Tree: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <path d="M 50 10
      C 70 10 86 22 84 40
      C 92 50 86 70 70 72
      C 66 86 40 88 32 76
      C 16 78 8 60 18 48
      C 14 30 30 14 50 10 Z" />
    <circle cx="50" cy="50" r="5" fill={DEFAULTS.fill} />
    <circle cx="50" cy="50" r="2" stroke="none" />
  </Svg>
);

const Shrub: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <path d="M 50 18 C 64 18 76 28 74 42 C 84 50 78 68 64 70 C 60 80 40 80 34 70 C 20 70 14 54 22 44 C 18 30 36 18 50 18 Z" />
  </Svg>
);

const Hedge: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="6" y="38" width="88" height="24" rx="10" />
    <path d="M 14 50 q 4 -8 8 0 q 4 -8 8 0 q 4 -8 8 0 q 4 -8 8 0 q 4 -8 8 0 q 4 -8 8 0 q 4 -8 8 0 q 4 -8 8 0" fill="none" />
  </Svg>
);

const PottedPlant: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <circle cx="50" cy="50" r="32" />
    <circle cx="50" cy="50" r="22" fill="none" />
    <path d="M 50 50 L 38 32 M 50 50 L 50 28 M 50 50 L 62 32 M 50 50 L 30 50 M 50 50 L 70 50 M 50 50 L 38 68 M 50 50 L 62 68" fill="none" />
  </Svg>
);

const GardenBed: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="10" y="20" width="80" height="60" rx="2" />
    <circle cx="25" cy="35" r="5" fill="#fff" />
    <circle cx="45" cy="35" r="5" fill="#fff" />
    <circle cx="65" cy="35" r="5" fill="#fff" />
    <circle cx="85" cy="35" r="5" fill="#fff" />
    <circle cx="25" cy="55" r="5" fill="#fff" />
    <circle cx="45" cy="55" r="5" fill="#fff" />
    <circle cx="65" cy="55" r="5" fill="#fff" />
    <circle cx="85" cy="55" r="5" fill="#fff" />
    <circle cx="25" cy="72" r="5" fill="#fff" />
    <circle cx="45" cy="72" r="5" fill="#fff" />
    <circle cx="65" cy="72" r="5" fill="#fff" />
    <circle cx="85" cy="72" r="5" fill="#fff" />
  </Svg>
);

/* ---------------- HARDSCAPE ---------------- */

const Patio: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="8" y="20" width="84" height="60" />
    {[20, 32, 44, 56, 68].map((y) => (
      <line key={y} x1="8" y1={y} x2="92" y2={y} />
    ))}
    {[20, 32, 44, 56, 68, 80].map((x) => (
      <line key={x} x1={x} y1="20" x2={x} y2="80" />
    ))}
  </Svg>
);

const Walkway: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <path d="M 20 8 Q 60 30 40 60 T 80 92" stroke={DEFAULTS.stroke} fill="none" strokeWidth="14" />
    <path d="M 20 8 Q 60 30 40 60 T 80 92" stroke="#fff" fill="none" strokeWidth="11" />
    <path d="M 20 8 Q 60 30 40 60 T 80 92" stroke={DEFAULTS.stroke} fill="none" strokeWidth="1" strokeDasharray="3 3" />
  </Svg>
);

const Deck: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="8" y="14" width="84" height="72" />
    {[20, 28, 36, 44, 52, 60, 68, 76].map((y) => (
      <line key={y} x1="8" y1={y} x2="92" y2={y} />
    ))}
  </Svg>
);

const Driveway: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="20" y="6" width="60" height="88" />
    <line x1="50" y1="10" x2="50" y2="90" strokeDasharray="4 4" />
  </Svg>
);

const Fence: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <line x1="6" y1="50" x2="94" y2="50" strokeWidth="2" />
    {[10, 22, 34, 46, 58, 70, 82, 94].map((x) => (
      <line key={x} x1={x} y1="44" x2={x} y2="56" strokeWidth="2" />
    ))}
  </Svg>
);

const RetainingWall: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="6" y="40" width="88" height="20" />
    {[6, 18, 30, 42, 54, 66, 78].map((x, i) => (
      <line key={i} x1={x + (i % 2 === 0 ? 6 : 0)} y1="50" x2={x + (i % 2 === 0 ? 6 : 0)} y2="60" />
    ))}
    {[12, 24, 36, 48, 60, 72, 84].map((x) => (
      <line key={x} x1={x} y1="40" x2={x} y2="50" />
    ))}
  </Svg>
);

/* ---------------- WATER ---------------- */

const Pool: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="10" y="20" width="80" height="60" rx="6" />
    <rect x="16" y="26" width="68" height="48" rx="4" fill="#fff" />
    {/* coping reference */}
    <rect x="13" y="23" width="74" height="54" rx="5" fill="none" />
    {/* ladder rungs */}
    <rect x="78" y="32" width="6" height="2" stroke="none" />
    <rect x="78" y="38" width="6" height="2" stroke="none" />
    <rect x="78" y="44" width="6" height="2" stroke="none" />
  </Svg>
);

const HotTub: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="14" y="14" width="72" height="72" rx="10" />
    <circle cx="50" cy="50" r="26" fill="#fff" />
    <circle cx="34" cy="34" r="2" stroke="none" />
    <circle cx="66" cy="34" r="2" stroke="none" />
    <circle cx="34" cy="66" r="2" stroke="none" />
    <circle cx="66" cy="66" r="2" stroke="none" />
  </Svg>
);

const Pond: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <path d="M 18 50 C 18 28 38 18 56 22 C 78 24 88 42 82 60 C 78 78 56 84 38 78 C 22 74 18 64 18 50 Z" />
    <path d="M 26 50 C 28 38 42 32 56 36 C 70 38 76 50 70 60 C 64 70 48 72 38 66 C 28 62 26 56 26 50 Z" fill="#fff" />
  </Svg>
);

const Fountain: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <circle cx="50" cy="50" r="36" />
    <circle cx="50" cy="50" r="26" fill="#fff" />
    <circle cx="50" cy="50" r="14" />
    <circle cx="50" cy="50" r="6" fill="#fff" />
    <circle cx="50" cy="50" r="2" stroke="none" />
  </Svg>
);

const Stream: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <path d="M 8 30 Q 30 20 50 35 T 92 30 L 92 60 Q 70 50 50 65 T 8 60 Z" />
    <path d="M 14 40 Q 34 32 52 46 T 90 42" fill="none" />
  </Svg>
);

/* ---------------- OUTDOOR LIVING ---------------- */

const Grill: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="14" y="22" width="72" height="50" rx="6" />
    {[26, 34, 42, 50, 58, 66].map((y) => (
      <line key={y} x1="20" y1={y} x2="80" y2={y} />
    ))}
    <circle cx="28" cy="78" r="3" stroke="none" />
    <circle cx="50" cy="78" r="3" stroke="none" />
    <circle cx="72" cy="78" r="3" stroke="none" />
  </Svg>
);

const FirePit: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <circle cx="50" cy="50" r="36" />
    <circle cx="50" cy="50" r="22" fill="#fff" />
    {Array.from({ length: 10 }).map((_, i) => {
      const a = (i / 10) * Math.PI * 2;
      const x = 50 + Math.cos(a) * 29;
      const y = 50 + Math.sin(a) * 29;
      return <circle key={i} cx={x} cy={y} r="3" />;
    })}
    <circle cx="50" cy="50" r="3" fill={DEFAULTS.stroke} stroke="none" />
    <circle cx="42" cy="48" r="1.5" fill={DEFAULTS.stroke} stroke="none" />
    <circle cx="56" cy="52" r="1.5" fill={DEFAULTS.stroke} stroke="none" />
  </Svg>
);

const PatioUmbrella: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <circle cx="50" cy="50" r="38" />
    <line x1="50" y1="12" x2="50" y2="88" />
    <line x1="12" y1="50" x2="88" y2="50" />
    <line x1="23" y1="23" x2="77" y2="77" />
    <line x1="77" y1="23" x2="23" y2="77" />
    <circle cx="50" cy="50" r="3" fill={DEFAULTS.stroke} stroke="none" />
  </Svg>
);

const OutdoorDiningSet: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <circle cx="50" cy="50" r="20" />
    {chairRing(50, 50, 34, 4, 6)}
  </Svg>
);

const AdirondackChair: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <path d="M 30 16 L 70 16 L 68 70 L 32 70 Z" />
    <path d="M 36 22 L 64 22 L 62 64 L 38 64 Z" fill="#fff" />
    <rect x="28" y="70" width="44" height="6" />
  </Svg>
);

const Hammock: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <path d="M 12 30 Q 50 70 88 30 L 88 38 Q 50 78 12 38 Z" />
    {[20, 28, 36, 44, 52, 60, 68, 76].map((x) => (
      <line key={x} x1={x} y1={30 + Math.sin(((x - 12) / 76) * Math.PI) * 28} x2={x} y2={38 + Math.sin(((x - 12) / 76) * Math.PI) * 28} />
    ))}
    <circle cx="12" cy="30" r="2" stroke="none" />
    <circle cx="88" cy="30" r="2" stroke="none" />
  </Svg>
);

/* ---------------- OUTDOOR STRUCTURES ---------------- */

const Shed: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="16" y="20" width="68" height="60" />
    <rect x="42" y="56" width="16" height="24" fill="#fff" />
    <line x1="42" y1="68" x2="58" y2="68" />
  </Svg>
);

const Gazebo: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <polygon points="50,10 86,32 86,72 50,90 14,72 14,32" />
    <polygon points="50,22 76,38 76,68 50,82 24,68 24,38" fill="#fff" />
    <line x1="50" y1="10" x2="50" y2="90" />
    <line x1="14" y1="32" x2="86" y2="72" />
    <line x1="86" y1="32" x2="14" y2="72" />
  </Svg>
);

const Pergola: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="14" y="14" width="72" height="72" fill="none" strokeWidth="2" />
    {[22, 30, 38, 46, 54, 62, 70, 78].map((y) => (
      <line key={y} x1="14" y1={y} x2="86" y2={y} />
    ))}
    <rect x="14" y="14" width="6" height="6" />
    <rect x="80" y="14" width="6" height="6" />
    <rect x="14" y="80" width="6" height="6" />
    <rect x="80" y="80" width="6" height="6" />
  </Svg>
);

const Mailbox: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="30" y="38" width="40" height="24" rx="12" />
    <rect x="30" y="38" width="6" height="24" />
    <rect x="48" y="62" width="4" height="20" />
    <rect x="64" y="40" width="6" height="6" stroke="none" fill={DEFAULTS.stroke} />
  </Svg>
);

const Bench: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="10" y="38" width="80" height="14" rx="2" />
    <rect x="10" y="34" width="80" height="4" />
    <line x1="14" y1="52" x2="14" y2="62" />
    <line x1="86" y1="52" x2="86" y2="62" />
  </Svg>
);

/* ---------------- EVENT SEATING ---------------- */

const banquet = (count: number): React.FC<SymbolProps> => (p) => (
  <Svg {...p}>
    <circle cx="50" cy="50" r="22" />
    {chairRing(50, 50, 36, count, 6)}
  </Svg>
);

const BanquetRound8 = banquet(8);
const BanquetRound10 = banquet(10);

const LongTableSeating: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="14" y="40" width="72" height="20" />
    {[22, 34, 46, 58, 70, 82].map((x) => (
      <React.Fragment key={x}>
        <circle cx={x} cy="30" r="5" fill="#fff" />
        <circle cx={x} cy="70" r="5" fill="#fff" />
      </React.Fragment>
    ))}
  </Svg>
);

const TheaterChair: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="30" y="34" width="40" height="32" rx="4" />
    <rect x="30" y="34" width="40" height="6" />
    <rect x="30" y="40" width="6" height="26" />
    <rect x="64" y="40" width="6" height="26" />
  </Svg>
);

const CeremonyChair: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="34" y="32" width="32" height="36" rx="2" />
    <rect x="34" y="32" width="32" height="5" />
    <line x1="40" y1="68" x2="40" y2="76" />
    <line x1="60" y1="68" x2="60" y2="76" />
  </Svg>
);

/* ---------------- EVENT TABLES ---------------- */

const CocktailRound: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <circle cx="50" cy="50" r="30" />
    <circle cx="50" cy="50" r="22" fill="#fff" />
    <circle cx="50" cy="50" r="3" stroke="none" />
  </Svg>
);

const BuffetTable: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="6" y="32" width="88" height="36" />
    <line x1="34" y1="32" x2="34" y2="68" />
    <line x1="62" y1="32" x2="62" y2="68" />
    <ellipse cx="20" cy="50" rx="8" ry="6" fill="#fff" />
    <ellipse cx="48" cy="50" rx="8" ry="6" fill="#fff" />
    <ellipse cx="76" cy="50" rx="8" ry="6" fill="#fff" />
  </Svg>
);

const EventBar: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="10" y="36" width="80" height="14" />
    <rect x="10" y="50" width="80" height="14" fill="#fff" />
    <line x1="10" y1="50" x2="90" y2="50" />
    <circle cx="22" cy="76" r="5" fill="#fff" />
    <circle cx="42" cy="76" r="5" fill="#fff" />
    <circle cx="58" cy="76" r="5" fill="#fff" />
    <circle cx="78" cy="76" r="5" fill="#fff" />
  </Svg>
);

/* ---------------- EVENT STAGE ---------------- */

const Stage: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="10" y="22" width="80" height="56" />
    <rect x="14" y="26" width="72" height="48" fill="none" />
    <line x1="10" y1="78" x2="14" y2="82" />
    <line x1="90" y1="78" x2="86" y2="82" />
    <line x1="10" y1="22" x2="14" y2="18" />
    <line x1="90" y1="22" x2="86" y2="18" />
  </Svg>
);

const Podium: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <path d="M 36 30 L 64 30 L 70 80 L 30 80 Z" />
    <rect x="38" y="36" width="24" height="6" fill="#fff" />
  </Svg>
);

const DJBooth: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="14" y="34" width="72" height="32" rx="2" />
    <circle cx="32" cy="50" r="9" fill="#fff" />
    <circle cx="68" cy="50" r="9" fill="#fff" />
    <circle cx="32" cy="50" r="2" stroke="none" />
    <circle cx="68" cy="50" r="2" stroke="none" />
    <rect x="46" y="44" width="8" height="12" stroke="none" fill={DEFAULTS.stroke} />
  </Svg>
);

const DanceFloor: React.FC<SymbolProps> = (p) => {
  const tiles: React.ReactElement[] = [];
  const size = 70;
  const cells = 6;
  const cell = size / cells;
  const ox = (100 - size) / 2;
  const oy = (100 - size) / 2;
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const filled = (r + c) % 2 === 0;
      tiles.push(
        <rect
          key={`${r}-${c}`}
          x={ox + c * cell}
          y={oy + r * cell}
          width={cell}
          height={cell}
          fill={filled ? DEFAULTS.fill : "#fff"}
        />,
      );
    }
  }
  return (
    <Svg {...p}>
      {tiles}
      <rect x={ox} y={oy} width={size} height={size} fill="none" />
    </Svg>
  );
};

/* ---------------- EVENT SERVICE ---------------- */

const RegistrationDesk: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="10" y="36" width="80" height="20" />
    <line x1="10" y1="46" x2="90" y2="46" />
    <rect x="44" y="56" width="12" height="12" fill="#fff" />
    <line x1="40" y1="68" x2="60" y2="68" />
  </Svg>
);

const BoothExhibit: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <path d="M 14 30 L 86 30 L 86 36 L 20 36 L 20 78 L 14 78 Z" />
    <rect x="26" y="58" width="56" height="14" fill="#fff" stroke={DEFAULTS.stroke} />
  </Svg>
);

const CoatCheck: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="10" y="42" width="80" height="20" />
    <line x1="10" y1="38" x2="90" y2="38" strokeDasharray="3 2" />
    {[18, 26, 34, 42, 50, 58, 66, 74, 82].map((x) => (
      <line key={x} x1={x} y1="42" x2={x} y2="62" />
    ))}
  </Svg>
);

/* ---------------- STRUCTURAL ---------------- */

const Wall: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="6" y="46" width="88" height="8" fill={DEFAULTS.stroke} stroke="none" />
  </Svg>
);

const Door: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    {/* wall stubs */}
    <rect x="6" y="68" width="22" height="6" fill={DEFAULTS.stroke} stroke="none" />
    <rect x="72" y="68" width="22" height="6" fill={DEFAULTS.stroke} stroke="none" />
    {/* door leaf */}
    <line x1="28" y1="71" x2="28" y2="28" strokeWidth="2" />
    {/* swing arc */}
    <path d="M 28 28 A 43 43 0 0 1 71 71" fill="none" />
  </Svg>
);

const DoubleDoor: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="6" y="68" width="14" height="6" fill={DEFAULTS.stroke} stroke="none" />
    <rect x="80" y="68" width="14" height="6" fill={DEFAULTS.stroke} stroke="none" />
    <line x1="20" y1="71" x2="20" y2="38" strokeWidth="2" />
    <path d="M 20 38 A 30 30 0 0 1 50 68" fill="none" />
    <line x1="80" y1="71" x2="80" y2="38" strokeWidth="2" />
    <path d="M 80 38 A 30 30 0 0 0 50 68" fill="none" />
  </Svg>
);

const Window: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="6" y="44" width="88" height="12" fill="#fff" stroke={DEFAULTS.stroke} />
    <line x1="6" y1="50" x2="94" y2="50" />
  </Svg>
);

const SlidingDoor: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="6" y="46" width="14" height="8" fill={DEFAULTS.stroke} stroke="none" />
    <rect x="80" y="46" width="14" height="8" fill={DEFAULTS.stroke} stroke="none" />
    <rect x="20" y="48" width="32" height="4" />
    <rect x="48" y="48" width="32" height="4" />
    <line x1="20" y1="50" x2="80" y2="50" />
  </Svg>
);

const Opening: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="6" y="46" width="22" height="8" fill={DEFAULTS.stroke} stroke="none" />
    <rect x="72" y="46" width="22" height="8" fill={DEFAULTS.stroke} stroke="none" />
    <line x1="28" y1="46" x2="28" y2="54" strokeDasharray="2 2" />
    <line x1="72" y1="46" x2="72" y2="54" strokeDasharray="2 2" />
  </Svg>
);

const Stairs: React.FC<SymbolProps> = (p) => (
  <Svg {...p}>
    <rect x="20" y="14" width="60" height="72" fill="#fff" stroke={DEFAULTS.stroke} />
    {[22, 30, 38, 46, 54, 62, 70, 78].map((y) => (
      <line key={y} x1="20" y1={y} x2="80" y2={y} />
    ))}
    {/* direction arrow */}
    <line x1="50" y1="80" x2="50" y2="22" />
    <polyline points="44,30 50,22 56,30" fill="none" />
  </Svg>
);

/* ---------------- CUSTOM-ASPECT (HORIZONTAL) SYMBOLS ---------------- */

// Helper for symbols whose real footprint is non-square. Renders at the given
// viewBox dimensions; preserveAspectRatio keeps proportions when scaled into
// the card slot.
const SvgVB: React.FC<
  React.PropsWithChildren<SymbolProps & { vbW: number; vbH: number }>
> = ({
  fill = DEFAULTS.fill,
  stroke = DEFAULTS.stroke,
  strokeWidth = DEFAULTS.strokeWidth,
  vbW,
  vbH,
  children,
}) => (
  <svg
    viewBox={`0 0 ${vbW} ${vbH}`}
    width="100%"
    height="100%"
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg"
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

// Bookshelf (horizontal) — long row of shelving viewed top-down, with book-spine ticks
const BookshelfHorizontal: React.FC<SymbolProps> = (p) => {
  const ticks: React.ReactElement[] = [];
  // Spines along the length: 24 vertical short ticks
  for (let i = 1; i < 25; i++) {
    const x = 4 + (i * 192) / 25;
    ticks.push(<line key={i} x1={x} y1={6} x2={x} y2={30} />);
  }
  return (
    <SvgVB {...p} vbW={200} vbH={36}>
      <rect x="2" y="2" width="196" height="32" rx="1" />
      {/* Two thin horizontal divider lines (back wall + front edge of shelf) */}
      <line x1="2" y1="8" x2="198" y2="8" />
      <line x1="2" y1="28" x2="198" y2="28" />
      {ticks}
    </SvgVB>
  );
};

// Credenza — long low cabinet
const CredenzaHorizontal: React.FC<SymbolProps> = (p) => {
  const divs = [50, 100, 150];
  return (
    <SvgVB {...p} vbW={200} vbH={50}>
      <rect x="2" y="2" width="196" height="46" rx="1.5" />
      {/* Top cap line */}
      <line x1="2" y1="8" x2="198" y2="8" />
      {divs.map((x) => (
        <line key={x} x1={x} y1="8" x2={x} y2="48" />
      ))}
      {/* Knob dots — one per door, near top of door panel */}
      {[25, 75, 125, 175].map((x) => (
        <circle key={x} cx={x} cy="36" r="1.6" stroke="none" />
      ))}
    </SvgVB>
  );
};

// TV Stand — horizontal console with a screen on top + cabinets below
const TVStandHorizontal: React.FC<SymbolProps> = (p) => (
  <SvgVB {...p} vbW={140} vbH={40}>
    <rect x="2" y="2" width="136" height="36" rx="1.5" />
    {/* Screen — darkened, ~60% width centered along top */}
    <rect x="28" y="5" width="84" height="14" fill={p.stroke ?? DEFAULTS.stroke} />
    {/* Cabinet division line below */}
    <line x1="2" y1="22" x2="138" y2="22" />
    <line x1="70" y1="22" x2="70" y2="38" />
    {/* Knob dots */}
    <circle cx="48" cy="30" r="1.4" stroke="none" />
    <circle cx="92" cy="30" r="1.4" stroke="none" />
  </SvgVB>
);

// Dresser — long horizontal chest, 3 cols x 2 rows of drawers
const DresserHorizontal: React.FC<SymbolProps> = (p) => {
  const colXs = [55, 107];
  const rowY = 27;
  return (
    <SvgVB {...p} vbW={160} vbH={50}>
      <rect x="2" y="2" width="156" height="46" rx="1.5" />
      {colXs.map((x) => (
        <line key={x} x1={x} y1="2" x2={x} y2="48" />
      ))}
      <line x1="2" y1={rowY} x2="158" y2={rowY} />
      {/* Drawer pulls (small dots) — center of each drawer */}
      {[28, 81, 133].map((cx) => (
        <React.Fragment key={cx}>
          <circle cx={cx} cy="14" r="1.4" stroke="none" />
          <circle cx={cx} cy="38" r="1.4" stroke="none" />
        </React.Fragment>
      ))}
    </SvgVB>
  );
};

// Buffet Table (event) — long serving table with station dividers + circular platters
const BuffetTableHorizontal: React.FC<SymbolProps> = (p) => {
  const stations = [60, 108, 156, 204];
  const platters = [36, 84, 132, 180, 228];
  return (
    <SvgVB {...p} vbW={240} vbH={60}>
      <rect x="2" y="10" width="236" height="44" rx="2" />
      {stations.map((x) => (
        <line key={x} x1={x} y1="10" x2={x} y2="54" />
      ))}
      {platters.map((cx) => (
        <circle key={cx} cx={cx} cy="32" r="9" fill="none" />
      ))}
    </SvgVB>
  );
};

// Registration Desk — counter with signage strip across the back + 2 stack markers
const RegistrationDeskHorizontal: React.FC<SymbolProps> = (p) => (
  <SvgVB {...p} vbW={140} vbH={50}>
    {/* Signage strip across the back */}
    <rect x="2" y="2" width="136" height="8" fill={p.stroke ?? DEFAULTS.stroke} />
    {/* Counter body */}
    <rect x="2" y="12" width="136" height="36" rx="1.5" />
    {/* Stack markers (pamphlets / sign-in sheets) */}
    <rect x="30" y="22" width="22" height="16" fill="none" />
    <rect x="88" y="22" width="22" height="16" fill="none" />
  </SvgVB>
);

// Kitchen Counter (horizontal long) — long counter with cabinet doors + top edge line
const KitchenCounterHorizontal: React.FC<SymbolProps> = (p) => {
  const divs = [37, 70, 103];
  return (
    <SvgVB {...p} vbW={140} vbH={50}>
      <rect x="2" y="2" width="136" height="46" rx="1.5" />
      {/* Back-wall / counter top edge */}
      <line x1="2" y1="10" x2="138" y2="10" />
      {divs.map((x) => (
        <line key={x} x1={x} y1="10" x2={x} y2="48" />
      ))}
      {/* Knob dots */}
      {[19, 53, 86, 120].map((cx) => (
        <circle key={cx} cx={cx} cy="40" r="1.4" stroke="none" />
      ))}
    </SvgVB>
  );
};

// Sofa — 2-seat
const Sofa2Seat: React.FC<SymbolProps> = (p) => (
  <SvgVB {...p} vbW={120} vbH={60}>
    {/* Outer arm/back outline */}
    <rect x="2" y="6" width="116" height="48" rx="6" />
    {/* Seat area inset — front edge */}
    <rect x="10" y="18" width="100" height="32" rx="4" />
    {/* Cushion division (1 line for 2 seats) */}
    <line x1="60" y1="18" x2="60" y2="50" />
    {/* Arm caps */}
    <line x1="10" y1="18" x2="10" y2="50" />
    <line x1="110" y1="18" x2="110" y2="50" />
  </SvgVB>
);

// Sofa — 3-seat (horizontal-aspect variant)
const Sofa3Seat: React.FC<SymbolProps> = (p) => (
  <SvgVB {...p} vbW={180} vbH={70}>
    <rect x="2" y="6" width="176" height="58" rx="7" />
    <rect x="12" y="20" width="156" height="40" rx="4" />
    {/* 3 cushions => 2 division lines */}
    <line x1="64" y1="20" x2="64" y2="60" />
    <line x1="116" y1="20" x2="116" y2="60" />
    {/* Arm caps */}
    <line x1="12" y1="20" x2="12" y2="60" />
    <line x1="168" y1="20" x2="168" y2="60" />
    {/* Small arm pillows */}
    <rect x="16" y="26" width="10" height="10" rx="2" fill="none" />
    <rect x="154" y="26" width="10" height="10" rx="2" fill="none" />
  </SvgVB>
);

// Sofa — Sectional (L-shape, larger footprint)
const SofaSectional: React.FC<SymbolProps> = (p) => (
  <SvgVB {...p} vbW={220} vbH={180}>
    {/* L-shape composed of two rectangles */}
    {/* Long horizontal segment */}
    <path
      d="M4 4 H216 V70 H80 V176 H4 Z"
      strokeLinejoin="miter"
    />
    {/* Inner seat outline (inset) */}
    <path
      d="M14 14 H206 V60 H70 V166 H14 Z"
      fill="none"
      strokeLinejoin="miter"
    />
    {/* Cushion divisions on horizontal arm (3 cushions) */}
    <line x1="78" y1="14" x2="78" y2="60" />
    <line x1="142" y1="14" x2="142" y2="60" />
    {/* Cushion divisions on vertical arm (2 cushions below corner) */}
    <line x1="14" y1="100" x2="70" y2="100" />
    <line x1="14" y1="135" x2="70" y2="135" />
    {/* Corner cushion suggestion */}
    <line x1="70" y1="60" x2="14" y2="60" />
  </SvgVB>
);

// Copier / Printer — small office appliance, top-down
const Copier: React.FC<SymbolProps> = (p) => (
  <SvgVB {...p} vbW={70} vbH={50}>
    <rect x="2" y="2" width="66" height="46" rx="3" />
    {/* Control panel strip across the top */}
    <line x1="2" y1="12" x2="68" y2="12" />
    {/* Buttons on control panel */}
    <circle cx="14" cy="7" r="1.4" stroke="none" />
    <circle cx="22" cy="7" r="1.4" stroke="none" />
    <circle cx="30" cy="7" r="1.4" stroke="none" />
    {/* Paper tray strip on the right side */}
    <line x1="58" y1="12" x2="58" y2="48" />
    {/* Output tray hint */}
    <rect x="14" y="22" width="38" height="18" rx="1" fill="none" />
  </SvgVB>
);

// Office Booth / Phone Pod — small enclosed booth with door opening at bottom
const OfficeBooth: React.FC<SymbolProps> = (p) => (
  <SvgVB {...p} vbW={90} vbH={100}>
    {/* Walls drawn as thick outline with a gap at the bottom for the doorway */}
    {/* Top + sides */}
    <path
      d="M4 96 V4 H86 V96"
      fill="none"
      strokeLinejoin="miter"
    />
    {/* Bottom wall split into two segments leaving a doorway gap (approx 30-60) */}
    <line x1="4" y1="96" x2="32" y2="96" />
    <line x1="58" y1="96" x2="86" y2="96" />
    {/* Inner floor fill */}
    <rect x="6" y="6" width="78" height="88" stroke="none" />
    {/* Seat / bench inside (along top wall) */}
    <rect x="16" y="14" width="58" height="14" rx="2" fill="none" />
    {/* Door swing arc from left side of opening */}
    <path d="M32 96 A26 26 0 0 1 32 70" fill="none" />
  </SvgVB>
);

/* ---------------- REGISTRY ---------------- */

export const SYMBOLS: Record<string, SymbolEntry> = {
  // Kitchen
  "stove": { label: "Stove / Range", category: "Kitchen", svg: Stove },
  "refrigerator": { label: "Refrigerator", category: "Kitchen", svg: Refrigerator },
  "kitchen-sink-double": { label: "Double Sink", category: "Kitchen", svg: KitchenSinkDouble },
  "kitchen-sink-single": { label: "Single Sink", category: "Kitchen", svg: KitchenSinkSingle },
  "kitchen-island": { label: "Kitchen Island", category: "Kitchen", svg: KitchenIsland },
  "kitchen-counter-l": { label: "Counter (L-shape)", category: "Kitchen", svg: KitchenCounterL },
  "kitchen-counter-straight": { label: "Counter (Straight)", category: "Kitchen", svg: KitchenCounterStraight },
  "dishwasher": { label: "Dishwasher", category: "Kitchen", svg: Dishwasher },
  "microwave": { label: "Microwave", category: "Kitchen", svg: Microwave },
  "oven": { label: "Oven", category: "Kitchen", svg: Oven },

  // Bathroom
  "toilet": { label: "Toilet", category: "Bathroom", svg: Toilet },
  "wall-sink": { label: "Wall-mounted Sink", category: "Bathroom", svg: WallSink },
  "pedestal-sink": { label: "Pedestal Sink", category: "Bathroom", svg: PedestalSink },
  "double-vanity": { label: "Double Vanity", category: "Bathroom", svg: DoubleVanity },
  "bathtub": { label: "Bathtub", category: "Bathroom", svg: Bathtub },
  "walk-in-shower": { label: "Walk-in Shower", category: "Bathroom", svg: WalkInShower },
  "corner-shower": { label: "Corner Shower", category: "Bathroom", svg: CornerShower },

  // Bedroom
  "king-bed": { label: "King Bed", category: "Bedroom", svg: KingBed },
  "queen-bed": { label: "Queen Bed", category: "Bedroom", svg: QueenBed },
  "twin-bed": { label: "Twin Bed", category: "Bedroom", svg: TwinBed },
  "nightstand": { label: "Nightstand", category: "Bedroom", svg: Nightstand },
  "dresser": { label: "Dresser", category: "Bedroom", svg: Dresser },
  "wardrobe": { label: "Wardrobe / Closet", category: "Bedroom", svg: Wardrobe },

  // Living Room
  "sofa": { label: "Sofa (3-seat)", category: "Living Room", svg: Sofa },
  "loveseat": { label: "Loveseat", category: "Living Room", svg: Loveseat },
  "sectional": { label: "Sectional", category: "Living Room", svg: Sectional },
  "armchair": { label: "Armchair", category: "Living Room", svg: Armchair },
  "coffee-table": { label: "Coffee Table", category: "Living Room", svg: CoffeeTable },
  "side-table": { label: "Side Table", category: "Living Room", svg: SideTable },
  "tv-stand": { label: "TV Stand", category: "Living Room", svg: TVStand },
  "bookshelf-living": { label: "Bookshelf", category: "Living Room", svg: Bookshelf },
  "fireplace": { label: "Fireplace", category: "Living Room", svg: Fireplace },

  // Office
  "desk": { label: "Desk", category: "Office", svg: Desk },
  "l-desk": { label: "L-Desk", category: "Office", svg: LDesk },
  "office-chair": { label: "Office Chair", category: "Office", svg: OfficeChair },
  "filing-cabinet": { label: "Filing Cabinet", category: "Office", svg: FilingCabinet },
  "conference-table-oval": { label: "Conference Table (Oval)", category: "Office", svg: ConferenceTableOval },
  "conference-table-rect": { label: "Conference Table (Rect)", category: "Office", svg: ConferenceTableRect },

  // Dining
  "dining-round-4": { label: "Round Dining (4)", category: "Dining", svg: DiningRound4 },
  "dining-rect-6": { label: "Rect Dining (6)", category: "Dining", svg: DiningRect6 },
  "dining-chair": { label: "Dining Chair", category: "Dining", svg: DiningChair },
  "bar-stool": { label: "Bar Stool", category: "Dining", svg: BarStool },
  "bar-counter": { label: "Bar Counter", category: "Dining", svg: BarCounter },

  // Storage
  "credenza": { label: "Credenza", category: "Storage", svg: Credenza },
  "bookshelf": { label: "Bookshelf", category: "Storage", svg: Bookshelf },
  "cabinet": { label: "Cabinet", category: "Storage", svg: Cabinet },
  "closet": { label: "Closet", category: "Storage", svg: Closet },

  // Plants
  "tree": { label: "Tree", category: "Plants", svg: Tree },
  "shrub": { label: "Shrub", category: "Plants", svg: Shrub },
  "hedge": { label: "Hedge", category: "Plants", svg: Hedge },
  "potted-plant": { label: "Potted Plant", category: "Plants", svg: PottedPlant },
  "garden-bed": { label: "Garden Bed", category: "Plants", svg: GardenBed },

  // Hardscape
  "patio": { label: "Patio", category: "Hardscape", svg: Patio },
  "walkway": { label: "Walkway / Path", category: "Hardscape", svg: Walkway },
  "deck": { label: "Deck", category: "Hardscape", svg: Deck },
  "driveway": { label: "Driveway", category: "Hardscape", svg: Driveway },
  "fence": { label: "Fence", category: "Hardscape", svg: Fence },
  "retaining-wall": { label: "Retaining Wall", category: "Hardscape", svg: RetainingWall },

  // Water
  "pool": { label: "Pool", category: "Water", svg: Pool },
  "hot-tub": { label: "Hot Tub", category: "Water", svg: HotTub },
  "pond": { label: "Pond", category: "Water", svg: Pond },
  "fountain": { label: "Fountain", category: "Water", svg: Fountain },
  "stream": { label: "Stream", category: "Water", svg: Stream },

  // Outdoor Living
  "grill": { label: "Grill", category: "Outdoor Living", svg: Grill },
  "fire-pit": { label: "Fire Pit", category: "Outdoor Living", svg: FirePit },
  "patio-umbrella": { label: "Patio Umbrella", category: "Outdoor Living", svg: PatioUmbrella },
  "outdoor-dining-set": { label: "Outdoor Dining Set", category: "Outdoor Living", svg: OutdoorDiningSet },
  "adirondack-chair": { label: "Adirondack Chair", category: "Outdoor Living", svg: AdirondackChair },
  "hammock": { label: "Hammock", category: "Outdoor Living", svg: Hammock },

  // Outdoor Structures
  "shed": { label: "Shed", category: "Outdoor Structures", svg: Shed },
  "gazebo": { label: "Gazebo", category: "Outdoor Structures", svg: Gazebo },
  "pergola": { label: "Pergola", category: "Outdoor Structures", svg: Pergola },
  "mailbox": { label: "Mailbox", category: "Outdoor Structures", svg: Mailbox },
  "bench": { label: "Bench", category: "Outdoor Structures", svg: Bench },

  // Event Seating
  "banquet-round-8": { label: "Banquet Round (8)", category: "Event Seating", svg: BanquetRound8 },
  "banquet-round-10": { label: "Banquet Round (10)", category: "Event Seating", svg: BanquetRound10 },
  "long-table-seating": { label: "Long Table Seating", category: "Event Seating", svg: LongTableSeating },
  "theater-chair": { label: "Theater-row Chair", category: "Event Seating", svg: TheaterChair },
  "ceremony-chair": { label: "Ceremony Chair", category: "Event Seating", svg: CeremonyChair },

  // Event Tables
  "cocktail-round": { label: "Cocktail Round", category: "Event Tables", svg: CocktailRound },
  "buffet-table": { label: "Buffet Line Table", category: "Event Tables", svg: BuffetTable },
  "event-bar": { label: "Bar", category: "Event Tables", svg: EventBar },

  // Event Stage
  "stage": { label: "Stage / Riser", category: "Event Stage", svg: Stage },
  "podium": { label: "Podium / Lectern", category: "Event Stage", svg: Podium },
  "dj-booth": { label: "DJ Booth", category: "Event Stage", svg: DJBooth },
  "dance-floor": { label: "Dance Floor", category: "Event Stage", svg: DanceFloor },

  // Event Service
  "registration-desk": { label: "Registration Desk", category: "Event Service", svg: RegistrationDesk },
  "booth-exhibit": { label: "Booth / Exhibit", category: "Event Service", svg: BoothExhibit },
  "coat-check": { label: "Coat Check", category: "Event Service", svg: CoatCheck },

  // Structural — Walls
  "wall": { label: "Wall", category: "Walls", svg: Wall },
  "opening": { label: "Opening", category: "Walls", svg: Opening },
  "stairs": { label: "Stairs", category: "Walls", svg: Stairs },

  // Structural — Doors
  "door": { label: "Door", category: "Doors", svg: Door },
  "double-door": { label: "Double Door", category: "Doors", svg: DoubleDoor },
  "sliding-door": { label: "Sliding Door", category: "Doors", svg: SlidingDoor },

  // Structural — Windows
  "window": { label: "Window", category: "Windows", svg: Window },

  /* ---- Horizontal-aspect (true footprint) variants ---- */
  "bookshelf-horizontal": { label: "Bookshelf (Horizontal)", category: "Storage", svg: BookshelfHorizontal },
  "credenza-horizontal": { label: "Credenza (Horizontal)", category: "Storage", svg: CredenzaHorizontal },
  "tv-stand-horizontal": { label: "TV Stand (Horizontal)", category: "Living Room", svg: TVStandHorizontal },
  "dresser-horizontal": { label: "Dresser (Horizontal)", category: "Bedroom", svg: DresserHorizontal },
  "buffet-table-horizontal": { label: "Buffet Table (Horizontal)", category: "Event Tables", svg: BuffetTableHorizontal },
  "registration-desk-horizontal": { label: "Registration Desk (Horizontal)", category: "Event Service", svg: RegistrationDeskHorizontal },
  "kitchen-counter-horizontal": { label: "Kitchen Counter (Horizontal)", category: "Kitchen", svg: KitchenCounterHorizontal },

  /* ---- Sofa multi-aspect variants ---- */
  "sofa-2seat": { label: "Sofa (2-seat)", category: "Living Room", svg: Sofa2Seat },
  "sofa-3seat": { label: "Sofa (3-seat, wide)", category: "Living Room", svg: Sofa3Seat },
  "sofa-sectional": { label: "Sofa (Sectional)", category: "Living Room", svg: SofaSectional },

  /* ---- New office symbols ---- */
  "copier": { label: "Copier / Printer", category: "Office", svg: Copier },
  "office-booth": { label: "Office Booth / Phone Pod", category: "Office", svg: OfficeBooth },
};
