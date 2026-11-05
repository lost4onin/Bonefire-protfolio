/**
 * Hall of Works (/works): the labels and lore lines around the relics. The relics themselves
 * (each project's facts, lore, skill and scaling) live in src/content/relics/*.md.
 * Every block has an in-world `name` and the `plain` label recruiters read beside it.
 * Rename freely here; slugs, routes and the #hash links don't change.
 */
export const works = {
  /** the item panel's blocks */
  skill: { name: 'Skill', plain: 'Key feature' },
  scaling: {
    name: 'Scaling',
    plain: 'Skills it draws on',
    note: 'Self-assessed: how much this work leans on each discipline, from S (most) down to E.',
  },
  stack: { name: 'Forged with', plain: 'Tech stack' },
  links: {
    name: 'Waymarks',
    plain: 'Links',
    labels: { live: 'Live site', repo: 'Source code', demo: 'Demo' },
  },
  /** the case study at /works/<slug> ("The Trial") and the way into it from a /works card */
  trial: {
    open: true, // false: the cards show "The trial is sealed" instead of the button
    action: 'Enter the trial',
    plain: 'Read the case study',
    sealed: 'The trial is sealed',
    sealedPlain: 'Case study coming soon',
    name: 'The Trial',
    section: 'Case study',
    /** the Markdown body's H2s, in this order, each shown with its plain label */
    chapters: [
      { name: 'The Foe', plain: 'The problem' },
      { name: 'The Arms', plain: 'Approach and stack' },
      { name: 'The Battle', plain: 'Challenges and decisions' },
      { name: 'Victory', plain: 'Results' },
      { name: 'Spoils', plain: 'Lessons learned' },
    ],
    facts: { role: 'Role', team: 'Team', period: 'When', stack: 'Stack' },
    /** a hackathon this relic won (its `boss`): in-world label, then the boss and the plain result */
    vanquished: 'Vanquished',
    bossLink: false, // TODO(M7): true once /victories exists, to link the boss's card
    back: 'Back to the Hall',
    prev: 'Previous relic',
    next: 'Next relic',
  },
  /** faint "???" slots after the relics, hinting at more to come: up to `fill` slots, at most `max` empty */
  empty: { fill: 6, max: 3, name: '???', plain: 'Yet to be forged' },
} as const;
