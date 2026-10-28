/**
 * Read a duration token (e.g. --dur-warp-in) in milliseconds, for client scripts that time
 * things in JS. Handles both units: the production CSS minifier rewrites `300ms` as `.3s`.
 * Reduced-motion overrides in tokens.css apply automatically (it reads the computed value).
 */
export function durationMs(token: string): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  const value = parseFloat(raw);
  if (Number.isNaN(value)) return 0;
  return raw.endsWith('ms') ? value : raw.endsWith('s') ? value * 1000 : value;
}
