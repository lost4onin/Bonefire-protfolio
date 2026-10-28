# Content map

Every fact comes from Akrem's CV (`public/cv/akrem-medimagh-cv.pdf`, autumn 2026) unless marked **ASSUMED** or **PROPOSAL**.
Each fact lives in **one** place in code. Pages read from there.

> **Expect changes.** Akrem will update the CV, and in-world names (sections, relics, bosses, covenants, skill titles) may be renamed.
>
> - **New CV:** replace `public/cv/akrem-medimagh-cv.pdf`, diff it against "CV facts" below, update this doc, then edit only the data files in the table. No template edits.
> - **Renames:** change the display name in data only. Routes and slugs stay stable; if one must change, add a redirect.

## Where each fact lives

| Fact                                                                          | Code location                                                | Shown on                                         |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------ |
| Name, role, school, email, GitHub, LinkedIn, CV path, "seeking" line, summary | `src/data/site.ts` → `site`                                  | Header/footer (all), `/cv`, `/about`, `/contact` |
| Section names, lore lines, routes                                             | `src/data/site.ts` → `bonfires`                              | Travel menu, title cards                         |
| Top bar, briefing, attributes, abilities, tongues, radar, chronicle, oaths    | `src/data/pilgrim.ts`                                        | `/about`, `/cv` (chronicle, tongues)             |
| `/about` block names + plain labels, lore lines, "self-assessed" note, scales | `src/data/pilgrim.ts` → `sections`, `selfAssessed`, `scales` | `/about`                                         |
| Skills, titles, ranks, slots                                                  | `src/data/armoury.ts`                                        | `/armoury`, `/cv`                                |
| Loading tips                                                                  | `src/data/tips.ts`                                           | Loader                                           |
| Projects + case studies                                                       | `src/content/relics/*.md`                                    | `/works`, `/works/[slug]`, `/cv`                 |
| Hackathons                                                                    | `src/content/bosses/*.md`                                    | `/victories`, `/cv`                              |

## CV facts (verbatim source)

**Identity:** Akrem Medimagh, Software Engineering Undergraduate. akrem.medimagh@gmail.com · LinkedIn `akrem-medimagh-96495a32a` · GitHub `lost4onin`.
Phone is in the CV but **deliberately not on the site** (spam).

**Summary:** Second-year engineering student with a multidisciplinary focus on AI, software development, and smart systems design. A multi-Hackathon winner recognized across various engineering disciplines.

**Professional skills:** Management, Critical thinking, Analytical mindset, Team Coordination.
**Technical skills:**

- Languages: SQL, Java, Python, C/C++, HTML, CSS, JavaScript, React, PHP, Symfony
- AI and data: n8n, RAG, data manipulation, Scikit-learn, computer vision, Spring Boot, REST API

**Education:**

- National Engineering Degree in Software Engineering, INSAT (Sep 2025 – present)
- English Certificate 4B, Amideast (2021–2023)

**Experience:**

- **President, IEEE INSAT Computer Society Chapter** (Aug 2025 – present). Full management of a chapter of 280+ members; coordination of task assignment among CS board members; crisis management and diplomacy with other clubs.
- **Intern, COFICAB** (Jul – Aug 2025). Front-end of a subnet management and request tracking page; professional immersion; enterprise web and network fundamentals.
- **CV & ML Instructor, National Academy of Robotics** (Jun 2025). A week-long youth outreach program across all states of Tunisia: Python, computer vision, ML for high schoolers.

**Projects:**

- **Real-time forest fire detection AI on Arduino:** Random Forest model on a curated tropical forest fire dataset, Arduino + PySerial, live temperature/humidity/smoke sensors, edge predictions. → relic `ember-sentinel`
- **HIKI:** Symfony platform for hikers and campers; real-time weather and moon-phase APIs, location detection, SQL database of curated campsites, personalised trip suggestions. → relic `hiki`
- **LUMIO:** AI early attention detection and learning support startup. MediaPipe WASM real-time focus tracking, XGBoost + ensemble distraction classification, three AI assistants on a LangChain + FAISS RAG engine, workflows on n8n. → relic `lumio`

**Hackathons (all 1st place):**

- GAICA, ANAVID Smart AI Camera Challenge → boss `gaica`
- National Re-Tech Fusion, KILANI Group Smart Green Energy Platform → boss `kilani`
- Sight Day Congress Technical Challenge: LUMIO and cognitive diseases → boss `sight-day` (linked to relic `lumio`)
- leanX: TERIAK smart desktop app for industrial management → boss `leanx`

**Languages:** English (fluent), French (fluent), Arabic (fluent; site says Native, **ASSUMED**, confirm), German (notions).
**Activities:** Social entrepreneurship with ENACTUS; theatre with THEATRO INSAT; IEEE INSAT SB.

## Assumptions to confirm

- Location "Tunis, Tunisia" (INSAT is in Tunis). **ASSUMED**
- Arabic level "Native". **ASSUMED** (CV says Fluent)
- "Level II" = second year of the engineering cycle. **ASSUMED**
- All numbers in `pilgrim.ts` and all ranks in `armoury.ts`. **PROPOSAL** by Claude
- Relic names (Lantern of Focus, Wayfarer's Compass, Ember Sentinel), boss names and covenant names. **PROPOSAL**. Akrem may rename.
- `provenIn` links in `armoury.ts` (e.g. computer vision → GAICA). **PROPOSAL**. Verify each is true.

## Open content: what Akrem needs to provide

Track here; tick when done.

### Projects (before M5/M6)

For **each** of LUMIO, HIKI, Ember Sentinel:

- [ ] Your exact role, team size, period
- [ ] 2–4 screenshots, or a short demo video/GIF (→ `public/images/relics/`)
- [ ] Live / repo / demo links (or "private")
- [ ] The hardest 2–3 problems and what you decided (The Battle)
- [ ] Results: metrics, awards, users, status (Victory). **Only real numbers.**
- [ ] One or two lessons (Spoils)

### Hackathons (before M7)

For **each** of GAICA, KILANI, Sight Day, leanX:

- [ ] Date, city, organiser
- [ ] Team (names optional) and your role
- [ ] The brief in one line
- [ ] What you built and why it won (2–4 lines)
- [ ] Photo (optional)

### Profile (before M4)

- [ ] Review every number in `src/data/pilgrim.ts` (attributes, abilities, radar)
- [ ] Rewrite or approve the briefing (2 short paragraphs, your voice)
- [ ] Confirm the assumptions above

### Armoury (before M8)

- [ ] Confirm ranks; at most 1–2 at Champion/Master
- [ ] Confirm or rename the titles you don't like

### Misc

- [ ] Final CV PDF (replace `public/cv/akrem-medimagh-cv.pdf`)
- [ ] Domain name choice (e.g. `akrem.dev`, `medimagh.dev`)
- [ ] Any 3D models (→ `assets-src/models/`)
