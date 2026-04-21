interface Props {
  size?: number;
  color?: string;
}

// Floor-plan mark. Uses currentColor by default so it adapts to header text
// color. The favicon (public/favicon.svg) renders the same strokes on a
// rounded-square tile.
export function Logo({ size = 28, color = "currentColor" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g
        stroke={color}
        strokeWidth={2.2}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <rect x="12" y="16" width="40" height="32" rx="4" />
        <line x1="36" y1="16" x2="36" y2="48" />
        <rect x="16" y="20" width="16" height="10" />
        <rect x="16" y="34" width="16" height="10" />
        <rect x="40" y="26" width="8" height="8" />
      </g>
    </svg>
  );
}
