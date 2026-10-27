/**
 * Data for /armoury. Skills as equipment.
 * Rule (locked): every tile shows the EPIC TITLE + the PLAIN LABEL + a RANK + "Proven in" links.
 * `provenIn` holds relic slugs (src/content/relics/*.md) or boss slugs (prefix "boss:").
 * ⚠ Ranks are PROPOSALS — Akrem must confirm (docs/MILESTONES.md, M8).
 *
 * Ranks (lowest → highest): Initiate · Adept · Knight · Champion · Master
 * Keep "Master" for at most 1–2 skills, or none. Recruiters notice inflation.
 */

export type Slot = 'weapon' | 'catalyst' | 'armour' | 'ring';
export type Rank = 'Initiate' | 'Adept' | 'Knight' | 'Champion' | 'Master';

export type Skill = {
  id: string;
  slot: Slot;
  label: string; // plain name, always visible
  title: string; // epic title
  rank: Rank;
  lore: string; // one or two lines, item-description voice
  provenIn: string[];
  icon: string; // file in src/components/armoury/icons/<icon>.svg (to be drawn in M8)
};

export const slots: Record<Slot, { name: string; plain: string }> = {
  weapon: { name: 'Weapons', plain: 'Programming languages' },
  catalyst: { name: 'Catalysts', plain: 'AI and data' },
  armour: { name: 'Armour', plain: 'Frameworks and platforms' },
  ring: { name: 'Rings', plain: 'Soft skills' },
};

export const skills: Skill[] = [
  // ── Weapons: languages ──
  {
    id: 'python',
    slot: 'weapon',
    label: 'Python',
    title: 'Python Master',
    rank: 'Champion',
    lore: 'A serpent-hilted blade, first drawn against data and never sheathed since.',
    provenIn: ['ember-sentinel', 'lumio'],
    icon: 'serpent-blade',
  },
  {
    id: 'java',
    slot: 'weapon',
    label: 'Java',
    title: 'Bearer of the Iron Cup',
    rank: 'Adept',
    lore: 'Heavy, dependable, built for long campaigns.',
    provenIn: [],
    icon: 'iron-cup',
  },
  {
    id: 'c-cpp',
    slot: 'weapon',
    label: 'C / C++',
    title: 'Forgewright of the Metal',
    rank: 'Adept',
    lore: 'Close to the iron. Every byte accounted for.',
    provenIn: ['ember-sentinel'],
    icon: 'hammer',
  },
  {
    id: 'javascript',
    slot: 'weapon',
    label: 'JavaScript',
    title: 'Swift Duellist',
    rank: 'Knight',
    lore: 'Light and quick. Strikes in every browser in the realm.',
    provenIn: ['lumio'],
    icon: 'rapier',
  },
  {
    id: 'php',
    slot: 'weapon',
    label: 'PHP',
    title: 'Warden of the Old Roads',
    rank: 'Adept',
    lore: 'An old weapon, still carried by many travellers.',
    provenIn: ['hiki'],
    icon: 'mace',
  },
  {
    id: 'sql',
    slot: 'weapon',
    label: 'SQL',
    title: 'Keeper of Ledgers',
    rank: 'Knight',
    lore: 'Asks the archive the right question and gets the right answer.',
    provenIn: ['hiki'],
    icon: 'ledger',
  },

  // ── Catalysts: AI & data ──
  {
    id: 'ml',
    slot: 'catalyst',
    label: 'Machine Learning (Scikit-learn, XGBoost)',
    title: 'AI Conqueror',
    rank: 'Champion',
    lore: 'Random forests and boosted trees, bent to the keeper’s will.',
    provenIn: ['ember-sentinel', 'lumio'],
    icon: 'crystal-staff',
  },
  {
    id: 'cv',
    slot: 'catalyst',
    label: 'Computer Vision (MediaPipe)',
    title: 'The All-Seeing Eye',
    rank: 'Knight',
    lore: 'Sees what the student does not say: where attention drifts.',
    provenIn: ['lumio', 'boss:gaica'],
    icon: 'eye-orb',
  },
  {
    id: 'rag',
    slot: 'catalyst',
    label: 'RAG (LangChain, FAISS)',
    title: 'Lorekeeper',
    rank: 'Knight',
    lore: 'Answers only from the scrolls it has read. Never invents.',
    provenIn: ['lumio'],
    icon: 'tome',
  },
  {
    id: 'n8n',
    slot: 'catalyst',
    label: 'Automation (n8n)',
    title: 'Weaver of Workflows',
    rank: 'Knight',
    lore: 'Threads many hands into one motion.',
    provenIn: ['lumio'],
    icon: 'loom',
  },
  {
    id: 'data',
    slot: 'catalyst',
    label: 'Data Manipulation',
    title: 'Alchemist of Data',
    rank: 'Knight',
    lore: 'Turns raw ore into something a model can drink.',
    provenIn: ['ember-sentinel'],
    icon: 'alembic',
  },

  // ── Armour: frameworks ──
  {
    id: 'react',
    slot: 'armour',
    label: 'React',
    title: 'Shield of Many Faces',
    rank: 'Adept',
    lore: 'Composed of small plates, each one reusable.',
    provenIn: [],
    icon: 'kite-shield',
  },
  {
    id: 'symfony',
    slot: 'armour',
    label: 'Symfony',
    title: 'Mail of the Wayfarer',
    rank: 'Knight',
    lore: 'Worn on the road to HIKI.',
    provenIn: ['hiki'],
    icon: 'chainmail',
  },
  {
    id: 'spring',
    slot: 'armour',
    label: 'Spring Boot',
    title: 'Plate of the Spring',
    rank: 'Adept',
    lore: 'Sturdy armour for enterprise campaigns.',
    provenIn: [],
    icon: 'breastplate',
  },
  {
    id: 'rest',
    slot: 'armour',
    label: 'REST APIs',
    title: 'Herald’s Tabard',
    rank: 'Knight',
    lore: 'Carries messages between kingdoms in a common tongue.',
    provenIn: ['hiki', 'lumio'],
    icon: 'tabard',
  },

  // ── Rings: soft skills ──
  {
    id: 'leadership',
    slot: 'ring',
    label: 'Leadership',
    title: 'Ring of the Chapter',
    rank: 'Champion',
    lore: 'Worn by the one who answers for 280 souls.',
    provenIn: [],
    icon: 'signet',
  },
  {
    id: 'coordination',
    slot: 'ring',
    label: 'Team Coordination',
    title: 'Band of Many Hands',
    rank: 'Knight',
    lore: 'Many hands, one rhythm.',
    provenIn: [],
    icon: 'band',
  },
  {
    id: 'analysis',
    slot: 'ring',
    label: 'Analytical Mindset',
    title: 'Ring of Clear Sight',
    rank: 'Knight',
    lore: 'Cuts through fog to the root of the problem.',
    provenIn: [],
    icon: 'gem-ring',
  },
];
