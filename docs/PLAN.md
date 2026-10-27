# Product plan: "The First Flame"

Approved by Akrem on 2026-10-26. This is the **why** and the **what**; `MILESTONES.md` is the **order** and the **checklist**.

## 1. Concept

A developer portfolio that plays like the opening of a Souls-like game:
- **First screen:** a bonfire in a dark, foggy ruin.
- **Navigation:** sections are other bonfires, and moving between them is a short warp (fade to black, then a location title card).
- **Cursor:** a sword.
- **Text:** black boxes with white text.
- **Profile:** a Lies of P–style status screen.

Underneath it's a professional, fast, accessible portfolio: every fact a recruiter needs is one click (or "Skip the journey") away.

Why it works: the metaphor gives a built-in navigation model (bonfires), a signature moment (resting at the fire) and a natural way to tell case studies (boss fights). Akrem's own CV fits the theme without forcing it:
- 4 hackathon first places are bosses.
- A fire-detection AI fits a bonfire world.
- A camping platform fits a campfire.

## 2. Site map

| Route | In-world name | Plain label | Content | 3D |
|---|---|---|---|---|
| `/` | The First Flame | Home | Bonfire scene, loading screen, intro, Travel menu | **Yes** |
| `/about` | The Pilgrim | About | Lies of P status window: portrait, briefing, stats, Software/AI radar. Tabs: Status / Chronicle / Oaths | No |
| `/works` | Hall of Works | Projects | Inventory of **relics** (projects) + item description panel | Light (rotating relic) |
| `/works/[slug]` | The Trial | Case study | Case study as a boss fight: The Foe → The Arms → The Battle → Victory → Spoils | No |
| `/victories` | Bosses Vanquished | Hackathons | Deck of 4 boss cards (hackathon 1st places), flip for details | No |
| `/armoury` | The Armoury | Skills | Equipment grid: Weapons (languages), Catalysts (AI/data), Armour (frameworks), Rings (soft skills) | No |
| `/contact` | The Messenger's Post | Contact | Email, socials, form | No |
| `/cv` | Skip the journey | CV | Plain one-page recruiter view + PDF | No |
| `/404` | Lost in the Fog | Not found | Original wording | No |

### Items vs bosses: the reasoning
- **Projects = relics** (things he *made*). Shown in the Souls inventory pattern: list on the left, a big description panel on the right (lore, "Skill:", "Scaling:"). All 3 are visible at once. A carousel would hide 2 of 3 from a skimming recruiter.
- **Case study = the Trial.** The problem is the boss. Structuring a write-up as Foe / Arms / Battle / Victory / Spoils is just problem / stack / challenges / results / lessons in costume, and recruiters read it fine.
- **Hackathons = Bosses Vanquished.** They really were fights he won. Akrem's "sliding window of cards" idea fits best here.

## 3. The Pilgrim: the profile window
- Top bar counters: Level II (year), 4 Bosses Vanquished, 280+ Allies Led, 4 Tongues.
- Shadowed portrait on the left: graded from Akrem's studio photo, near-black with an ember rim light.
- Columns on the right:
  - Briefing
  - Attributes (soft skills, 1–20)
  - Combat Abilities (tech, 1–20)
  - Tongues (languages)
- Hex radar with tabs **Software** (Backend, Frontend, Databases, Architecture, Embedded, Tooling) and **AI** (Classical ML, Computer Vision, RAG/LLMs, Data Eng., Automation, Edge AI).
- Tabs Status / Chronicle (experience and education) / Oaths (IEEE, Enactus, Theatro INSAT as covenants), switched with `Q`/`E`.
- Numbers are self-assessed and labelled as such.

## 4. The Armoury
Every tile shows an **epic title + plain label + rank + "Proven in" links**, e.g. *Python Master · Python · Champion · Proven in: LUMIO, Ember Sentinel*. Titles are fun; the evidence link keeps them credible. Ranks: Initiate · Adept · Knight · Champion · Master (use the top ranks sparingly). Icons are custom etched SVGs in one consistent style.

## 5. Loading screen
- Built in pure HTML/CSS so it shows instantly.
- A **small bonfire burning in the bottom-left corner**, a thin ember progress line, and rotating tips that are **true facts** about Akrem. Recruiters learn something while assets load.
- Real progress from Three.js `LoadingManager`. Appears only after 400ms, hard cap 6s, skippable.

## 6. Sound
- **SFX:** fire crackle, warp whoosh, menu open/close, hover tick, select, tab switch, vanquished chime.
- **The Wandering Bard:** a medieval lofi / classical "anti-brainrot" playlist mixed with the crackling fire. It keeps playing across pages, with separate music and fire volumes.
- **Sources:** CC0 or public-domain only (Freesound CC0, Pixabay, Musopen), each listed in `public/audio/LICENSES.md`.
- **Autoplay:** browsers block it, so the first "Rest at the flame" asks "Rest with sound?". The choice is remembered.

## 7. Look
- **Palette:** A "Ash and Ember".
- **Fonts:** IM Fell English SC (titles) and Crimson Pro (body).
- **Atmosphere:** fog layers, film grain, vignette, one warm light per screen, engraved hairline frames with ember corners.
- The approved prototype (`docs/references/prototype-landing.dc.html`) shows the mood and flow of the landing; the real thing must look **richer** than it: depth, lighting, texture.
- Look-dev happens in code on the `/lab` route.

## 8. Stack
- Astro 5 (static) with TypeScript.
- Three.js islands only on `/` and `/works`.
- GSAP and View Transitions for page changes.
- Content Collections for content.
- `gltf-transform` pipeline for Akrem's 3D models.
- Vercel hosting, Web3Forms for the contact form.

## 9. Extras in scope
- Game key prompts (`ESC`, `M`, `Q/E`).
- "All flames lit" achievement.
- OG share card.
- Privacy-friendly analytics.
- EN/FR toggle.
- "Seeking a summer 2026 internship" status line.
- Optional build-time GitHub stats.

## 10. Success criteria
- A recruiter on a phone, with sound off, can find projects, contact and CV in under 10 seconds.
- Lighthouse Performance ≥ 85 on 3D pages, ≥ 95 elsewhere. Accessibility ≥ 95.
- Someone who has played a Souls-like smiles within 5 seconds. Someone who hasn't is never confused.
