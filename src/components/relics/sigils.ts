/**
 * Etched relic sigils (DESIGN.md §7): 64×64 viewBox, single colour (currentColor), 1.5px lines,
 * thinner hatching for shade. A relic picks one with `icon:` in its frontmatter (default `shard`).
 * Drawn by Sigil.astro: small on its /works slot, large on the pedestal until real art arrives.
 * New sigil = a new entry here; the content schema reads the names from `sigilNames`.
 */

export interface SigilArt {
  lines: string[]; // outline, 1.5px
  hatch?: string[]; // shading and rays, thinner and fainter
}

export const sigils = {
  // Lantern of Focus (LUMIO): a flame in a caged lantern, light radiating out
  lantern: {
    lines: [
      'M28 8a4 4 0 1 0 8 0a4 4 0 1 0-8 0',
      'M32 12v3',
      'M22 21l5-6h10l5 6z',
      'M24 21v24',
      'M40 21v24',
      'M21 45h22',
      'M22 45l-2 7h24l-2-7',
      'M32 26c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10z',
      'M32 33c1.2 1.6 2 2.8 2 4a2 2 0 0 1-4 0c0-1.2.8-2.4 2-4z',
    ],
    hatch: [
      'M27 20l2.5-4',
      'M31 20l2.5-4',
      'M35 20l2.5-4',
      'M23.5 51l1.5-5',
      'M28 51l1.5-5',
      'M32.5 51l1.5-5',
      'M37 51l1.5-5',
      'M12 33h5',
      'M47 33h5',
      'M14 24l4 2.5',
      'M50 24l-4 2.5',
      'M14 42l4-2.5',
      'M50 42l-4-2.5',
    ],
  },
  // Wayfarer's Compass (HIKI): a compass whose needle points to a small flame
  compass: {
    lines: [
      'M10 32a22 22 0 1 0 44 0a22 22 0 1 0-44 0',
      'M14 32a18 18 0 1 0 36 0a18 18 0 1 0-36 0',
      'M32 10v4',
      'M54 32h-4',
      'M32 54v-4',
      'M10 32h4',
      'M32 16l3.5 16-3.5 16-3.5-16z',
      'M30.5 32a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0',
      'M32 1.5c1.6 2 2.6 3.6 2.6 5.1a2.6 2.6 0 0 1-5.2 0c0-1.5 1-3.1 2.6-5.1z',
    ],
    hatch: [
      'M44.7 19.3l1.8-1.8',
      'M19.3 19.3l-1.8-1.8',
      'M44.7 44.7l1.8 1.8',
      'M19.3 44.7l-1.8 1.8',
      'M31.1 20h1.8',
      'M30.5 23h3',
      'M29.8 26h4.4',
      'M29.2 29h5.6',
    ],
  },
  // Ember Sentinel (fire detection): a watchtower with an open eye at the forest's edge
  sentinel: {
    lines: [
      'M8 56h48',
      'M25 56l3-28h8l3 28',
      'M24 28h16',
      'M25 28l7-9 7 9',
      'M27.5 38c2.8-3 6.2-3 9 0c-2.8 3-6.2 3-9 0z',
      'M31 38a1 1 0 1 0 2 0a1 1 0 1 0-2 0',
      'M9 56l6-11 6 11',
      'M11 48l4-7 4 7',
      'M43 56l6-11 6 11',
      'M45 48l4-7 4 7',
    ],
    hatch: [
      'M32 18c-2.5-2.5 2.5-4.5 0-7s2.5-4.5 0-7',
      'M27.5 33h9',
      'M26.1 46h11.8',
      'M25.5 51h13',
      'M32 46v5',
      'M29 51v5',
      'M35 51v5',
      'M29.5 27l2-2.6',
      'M33 27l2-2.6',
    ],
  },
  // any other relic: a cut shard
  shard: {
    lines: ['M32 8l11 16-11 32-11-32z', 'M21 24h22', 'M32 8l-4 16 4 32 4-32z'],
    hatch: ['M23.5 27l4.5 11', 'M25 33l3.5 9', 'M27 41l2 5'],
  },
} satisfies Record<string, SigilArt>;

export type SigilName = keyof typeof sigils;
export const sigilNames = Object.keys(sigils) as [SigilName, ...SigilName[]];
