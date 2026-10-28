/**
 * Data for /about — "The Pilgrim" (Lies of P–style status window).
 *
 * ⚠ ALL NUMERIC RATINGS BELOW ARE PROPOSALS by Claude, derived from the CV.
 *   Akrem must review and adjust them before launch (tracked in docs/MILESTONES.md, M4).
 *   Scale: 1–20 for attributes/abilities, 0–10 for radar axes.
 *   Rule: a rating must be defensible in an interview. When in doubt, go lower.
 */

/**
 * Display names for every block on /about: in-world `name` + plain `plain` label (shown together),
 * plus an optional in-world `lore` line. Rename freely here; ids and routes don't change.
 */
export const sections = {
  status: { name: 'Status', plain: 'Profile' },
  briefing: { name: 'Briefing', plain: 'Summary' },
  attributes: { name: 'Attributes', plain: 'Soft skills' },
  abilities: { name: 'Combat Abilities', plain: 'Technical skills' },
  tongues: { name: 'Tongues', plain: 'Languages' },
  radar: { name: 'Affinities', plain: 'Skill radar' },
  chronicle: {
    name: 'Chronicle',
    plain: 'Experience & education',
    lore: 'The road walked so far.',
  },
  oaths: { name: 'Oaths', plain: 'Communities', lore: 'Covenants sworn.' },
} as const;

/** Rating scales, and the honesty note shown behind the "?" on /about. */
export const scales = { stat: { min: 1, max: 20 }, radar: { min: 0, max: 10 } } as const;
export const selfAssessed = {
  short: 'Self-assessed',
  detail: `Every rating on this page is Akrem's own assessment, not a test score. Attributes and Combat Abilities run from ${scales.stat.min} to ${scales.stat.max}; the radar runs from ${scales.radar.min} to ${scales.radar.max}.`,
} as const;

/** Top bar — equivalent of Lies of P's Ergo / weight counters. Facts only. `icon` picks the glyph. */
export const topBar = [
  { label: 'Level', value: 'II', hint: 'Year of study at INSAT', icon: 'level' },
  { label: 'Bosses Vanquished', value: '4', hint: 'Hackathon first places', icon: 'bosses' },
  {
    label: 'Allies Led',
    value: '280+',
    hint: 'IEEE INSAT Computer Society members',
    icon: 'allies',
  },
  { label: 'Tongues', value: '4', hint: 'Arabic, English, French, German', icon: 'tongues' },
] as const;

export const briefing = [
  'A second-year software engineering student at INSAT who builds where AI meets the real world: sensors in a forest, a camera watching for focus, a map for wanderers.',
  'Four first places across hackathons. President of a 280-strong IEEE Computer Society chapter. Teacher of young apprentices in computer vision and machine learning.',
] as const;

export type Stat = { name: string; value: number; note?: string };

/** "Attributes" column — soft skills (CV: Professional Skills + leadership roles). */
export const attributes: Stat[] = [
  { name: 'Leadership', value: 15, note: 'IEEE CS chapter president, 280+ members' },
  { name: 'Analysis', value: 14 },
  { name: 'Critical Thinking', value: 14 },
  { name: 'Coordination', value: 15, note: 'Task distribution across the CS board' },
  { name: 'Diplomacy', value: 13, note: 'Conflict mediation between clubs' },
  { name: 'Teaching', value: 13, note: 'CV & ML instructor, National Academy of Robotics' },
];

/** "Combat Abilities" column — technical domains. */
export const abilities: Stat[] = [
  { name: 'Software Engineering', value: 13 },
  { name: 'Machine Learning', value: 14 },
  { name: 'Computer Vision', value: 13 },
  { name: 'Web Development', value: 12 },
  { name: 'Data', value: 12 },
  { name: 'Automation', value: 12 },
];

/** "Tongues" — replaces the resistances block. */
export const tongues = [
  { name: 'Arabic', level: 'Native' },
  { name: 'English', level: 'Fluent', note: 'Amideast English Certificate 4B' },
  { name: 'French', level: 'Fluent' },
  { name: 'German', level: 'Notions' },
] as const;

/** Hexagonal radar — two tabs. Values 0–10. Exactly 6 axes each. */
export const radar = {
  software: {
    label: 'Software',
    axes: [
      { name: 'Backend', value: 6 },
      { name: 'Frontend', value: 6 },
      { name: 'Databases', value: 6 },
      { name: 'Architecture', value: 5 },
      { name: 'Embedded', value: 5 },
      { name: 'Tooling', value: 5 },
    ],
  },
  ai: {
    label: 'AI',
    axes: [
      { name: 'Classical ML', value: 7 },
      { name: 'Computer Vision', value: 6 },
      { name: 'RAG / LLMs', value: 6 },
      { name: 'Data Engineering', value: 5 },
      { name: 'Automation', value: 6 },
      { name: 'Edge AI', value: 5 },
    ],
  },
} as const;

/** Chronicle tab — experience + education, newest first. */
export const chronicle = [
  {
    when: 'Aug 2025 — Present',
    title: 'President',
    where: 'IEEE INSAT Computer Society Chapter',
    points: [
      'Full management of a chapter of 280+ members.',
      'Coordination of task assignment and distribution among CS board members.',
      'Management of crises and diplomacy during conflicts of interest with other clubs.',
    ],
  },
  {
    when: 'Sep 2025 — Present',
    title: 'National Engineering Degree, Software Engineering',
    where: 'INSAT',
    points: ['Student at the National Institute of Applied Sciences and Technology.'],
  },
  {
    when: 'Jul 2025 — Aug 2025',
    title: 'Intern',
    where: 'COFICAB',
    points: [
      'Developed the front-end of a subnet management and request tracking page.',
      'Integration and immersion in a professional environment.',
      'Acquired fundamentals of enterprise-level web and network systems development.',
    ],
  },
  {
    when: 'Jun 2025',
    title: 'CV & ML Instructor',
    where: 'National Academy of Robotics',
    points: [
      'Guided high schoolers through their first steps in Python, Computer Vision and Machine Learning, in a week-long youth tech outreach program across all states of Tunisia.',
    ],
  },
  {
    when: '2021 — 2023',
    title: 'English Certificate 4B',
    where: 'Amideast',
    points: [],
  },
] as const;

/** Oaths tab — communities, framed as covenants. */
export const oaths = [
  {
    name: 'IEEE INSAT Student Branch',
    covenant: 'Oath of the Circuit',
    role: 'Computer Society Chapter President',
  },
  { name: 'ENACTUS', covenant: 'Oath of the Common Good', role: 'Social entrepreneurship' },
  { name: 'THEATRO INSAT', covenant: 'Oath of the Mask', role: 'Theatre' },
] as const;
