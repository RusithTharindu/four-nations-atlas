import type { Nation } from "@/types/atlas";

/**
 * Original, simple doodle symbols for each nation (not the official emblems):
 * water = rolling waves, earth = a stacked boulder, fire = a curling flame,
 * air = a breezy swirl.
 */
const PATHS: Record<Nation, string[]> = {
  water: [
    "M3 9 C 6 6, 9 6, 12 9 S 18 12, 21 9",
    "M3 15 C 6 12, 9 12, 12 15 S 18 18, 21 15",
    "M6 20.5 C 8.5 18.5, 11 18.5, 13.5 20.5",
  ],
  earth: ["M3 19 L 8.5 8 L 12 13 L 15 6.5 L 21 19 Z", "M9.5 19 L 12 15 L 14.5 19"],
  fire: [
    "M12 21 C 6.5 21, 5 16.5, 7 13 C 8 15, 9.5 15.5, 10 14.5 C 9 10.5, 11 6.5, 14 3.5 C 13.5 7.5, 18.5 10, 18 15.5 C 17.7 18.8, 15.5 21, 12 21 Z",
    "M12 21 C 10.5 19.5, 10.8 17.6, 12.5 16 C 13 17.8, 14.4 18.4, 13.8 20.2",
  ],
  air: [
    "M12.5 12.5 C 12.5 11, 14.5 11, 14.5 12.8 C 14.5 15, 11 15.5, 10 13.2 C 8.8 10.5, 11.5 8, 14.5 8.5 C 18.5 9.2, 19.5 14, 17 17",
    "M3 16 C 6 16, 7 15.5, 8.5 14",
    "M3 11 C 4.5 11, 5.5 10.5, 6.5 9.5",
  ],
};

interface NationIconProps {
  nation: Nation;
  className?: string;
  color?: string;
  /** For nesting inside another SVG: explicit size and offset in its units. */
  size?: number;
  x?: number;
  y?: number;
}

export function NationIcon({
  nation,
  className = "h-5 w-5",
  color = "currentColor",
  size,
  x,
  y,
}: NationIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={size ? undefined : className}
      width={size}
      height={size}
      x={x}
      y={y}
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[nation].map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
