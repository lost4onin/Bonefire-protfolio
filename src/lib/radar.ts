/**
 * Radar geometry, shared by Radar.astro (server render) and its client-side morph, so the two
 * always draw the same shape. Flat-top hexagon like docs/references/ref-hex-radar.png: axis 0 is
 * the top-left vertex, then clockwise. Units are the SVG viewBox's; the side margins leave room
 * for the HTML axis labels.
 */
export const RADAR = {
  r: 100, // outer ring radius
  width: 460,
  height: 266,
  cx: 230,
  cy: 133,
  rings: 5,
} as const;

/** Angle of axis `i` of `n`, in radians (axis 0 = top-left, clockwise). */
export const axisAngle = (i: number, n: number) => ((-120 + (360 / n) * i) * Math.PI) / 180;

/** Point at `fraction` (0..1, may overshoot) of the radius along axis `i`. */
export function radarPoint(i: number, n: number, fraction: number): [number, number] {
  const a = axisAngle(i, n);
  const d = RADAR.r * fraction;
  return [RADAR.cx + d * Math.cos(a), RADAR.cy + d * Math.sin(a)];
}

/** SVG `points` for a polygon of values on a 0..max scale. */
export function radarPoints(values: readonly number[], max: number): string {
  return values
    .map((v, i) =>
      radarPoint(i, values.length, v / max)
        .map((c) => c.toFixed(2))
        .join(','),
    )
    .join(' ');
}
