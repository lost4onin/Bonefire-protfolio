/**
 * Content collections (Astro 5 Content Layer).
 *  - relics → Hall of Works items (/works) + their Trial case studies (/works/[slug])
 *  - bosses → Bosses Vanquished hackathon cards (/victories)
 * The Markdown BODY of a relic is the Trial case study. Its H2 headings MUST be, in order:
 *   ## The Foe · ## The Arms · ## The Battle · ## Victory · ## Spoils
 * Docs: https://docs.astro.build/en/guides/content-collections/
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const relics = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/relics' }),
  schema: z.object({
    // real-world facts (recruiter-facing, never hidden behind lore)
    project: z.string(), // "LUMIO"
    summary: z.string().max(200), // one plain sentence
    role: z.string(), // Akrem's role
    team: z.string().optional(), // "Team of 4"
    period: z.string().optional(), // "2025"
    stack: z.array(z.string()).min(1),
    links: z
      .object({
        live: z.string().url().optional(),
        repo: z.string().url().optional(),
        demo: z.string().url().optional(),
      })
      .default({}),
    // in-world presentation (the item description card)
    relicName: z.string(), // "Lantern of Focus"
    lore: z.string(), // 2–4 lines, item-description voice
    skill: z.object({ name: z.string(), text: z.string() }), // key feature, "Skill:" line
    scaling: z.array(z.object({ attr: z.string(), grade: z.enum(['S', 'A', 'B', 'C', 'D', 'E']) })),
    // media
    image: z.string().optional(), // /images/relics/<slug>.webp
    model: z.string().optional(), // /models/<slug>.glb (optional 3D relic)
    order: z.number().int(),
    featured: z.boolean().default(false),
    // links between collections
    boss: z.string().optional(), // slug in bosses/ if this relic won a hackathon
    draft: z.boolean().default(false),
  }),
});

const bosses = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/bosses' }),
  schema: z.object({
    event: z.string(), // "Sight Day Congress Technical Challenge"
    organiser: z.string().optional(),
    placement: z.string().default('1st place'),
    date: z.string().optional(), // TODO from Akrem
    challenge: z.string(), // one plain line
    bossName: z.string(), // in-world boss name
    bossEpithet: z.string(), // "Devourer of Attention"
    image: z.string().optional(), // boss illustration
    relic: z.string().optional(), // slug in relics/ when the winning build is a showcased project
    order: z.number().int(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { relics, bosses };
