# 🔥 The First Flame: Akrem Medimagh's portfolio

A Souls-like developer portfolio. Rest at the bonfire, travel between flames, inspect relics, read the boss fights.
Built with Astro 5, Three.js, GSAP. Hosted on Vercel.

> **Recruiter?** The plain CV is at [`/cv`](/cv).

---

## Getting started (Akrem, read this first)

### 1. Prerequisites

- **Node.js 20.3+** (`node -v`). LTS 22 recommended.
- **Git** + **Git LFS** (`git lfs install` once per machine). Used for 3D models and audio. Optional but recommended.
- **VS Code** with the recommended extensions (VS Code will prompt you): Astro, Prettier, **Claude Code**.
- Python 3 + `numpy scipy pillow` only if you want to re-grade the portrait.

### 2. Put the starter into your repo, install and run

The repo is **https://github.com/lost4onin/Bonefire-protfolio**.

```bash
git clone https://github.com/lost4onin/Bonefire-protfolio.git
cd Bonefire-protfolio
# copy EVERYTHING from the unzipped bonfire-portfolio/ folder into here,
# including hidden folders (.claude, .githooks, .vscode) and dotfiles.
# If GitHub created a README/.gitignore, let the starter's versions overwrite them.
git lfs install
npm install          # also enables the commit-msg hook (git config core.hooksPath .githooks)
npm run dev          # → http://localhost:4321
```

Open these to check the starter:

- `/`: placeholder landing (2D bonfire, intro box, travel list)
- `/cv`: the complete recruiter page
- `/lab`: the style guide: palette, fonts, components, bonfire sizes
- `/anything`: the "Lost in the Fog" 404

> ⚠ This starter was written in an environment **without npm access**, so `npm install` / `npm run build` have **not been run yet**. If something fails, that's expected. The first Claude Code task (below) fixes it.

### 3. First push and Vercel (you do this, not Claude)

Best done **after** M1 makes the build green (step 4), so the first Vercel deploy succeeds:

```bash
git add -A
git commit -m "chore: project starter (M0)"
git push -u origin main
```

Then follow the checklist in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md): import the repo on Vercel, Node 22.x, Deployment Protection on until launch. From then on every push deploys by itself (branch → preview URL, `main` → production).

> **You are the only author.** Claude Code is configured never to add itself as a co-author: `.claude/settings.json` turns attribution off, CLAUDE.md forbids it, and the `.githooks/commit-msg` hook strips any `Co-Authored-By: Claude…` / "Generated with Claude Code" line that slips through. Commits use _your_ git identity (`git config user.name` / `user.email`).

### 4. Hand over to Claude Code

Open the folder in VS Code, open Claude Code, and paste this as your **first message**:

```
Read CLAUDE.md and everything in docs/. This repo is the starter from a planning session
with Claude; all decisions are recorded in those files. Note the git rules in CLAUDE.md:
I own the GitHub repo and Vercel, I push and deploy, and you never add yourself as a
co-author anywhere. Then do milestone M1 from docs/MILESTONES.md: run npm install and
npm run build, fix whatever fails (it was written without npm access, so expect a few
version or import-path issues), check /, /cv, /lab and the 404 in the dev server, confirm
the commit-msg hook is active, and update the M1 checkboxes. Start in plan mode and tell
me what you find before changing anything. When it's green, propose the first commit
message and walk me through the Vercel checklist in docs/DEPLOYMENT.md.
```

After M1, start each milestone with the custom command:

```
/start-milestone M2
```

---

## How we work

| Step | Who         | What                                                                                                                 |
| ---- | ----------- | -------------------------------------------------------------------------------------------------------------------- |
| 1    | Akrem       | Pick the next milestone in `docs/MILESTONES.md`. Fill in any 📄 content it needs (`docs/CONTENT.md` → Open content). |
| 2    | Claude Code | `/start-milestone M<n>` → branch, plan, wait for approval                                                            |
| 3    | Both        | Build in small steps; Akrem checks `npm run dev` after each                                                          |
| 4    | Claude Code | `/verify` → tick boxes, log decisions, propose a commit message                                                      |
| 5    | Akrem       | Approve the commit, push, check the Vercel preview on a phone, merge into `main`                                     |

### Custom Claude Code commands (`.claude/commands/`)

| Command                     | What it does                                                                           |
| --------------------------- | -------------------------------------------------------------------------------------- |
| `/start-milestone M<n>`     | Reads the docs, checks prerequisites and missing content, branches, plans, then builds |
| `/verify`                   | Definition-of-done checklist: build, recruiter rules, a11y, performance, sound         |
| `/add-model <name> [where]` | Takes a model from `assets-src/models/` through the pipeline into a scene              |
| `/log-decision <text>`      | Appends to `docs/DECISIONS.md`                                                         |

### Dropping in assets

- **3D models:** put them in `assets-src/models/`, then `/add-model <name>` (or `npm run models`). Details and budgets in `docs/ASSETS.md`.
- **Images:** `public/images/relics/<slug>.webp`, `public/images/bosses/<slug>.webp`.
- **Audio:** `assets-src/audio/` (raw) → trimmed files in `public/audio/`. Always note the licence.

---

## Docs

| File                 | What's inside                                                               |
| -------------------- | --------------------------------------------------------------------------- |
| `CLAUDE.md`          | Rules and context Claude Code reads every session                           |
| `docs/PLAN.md`       | The approved product plan                                                   |
| `docs/MILESTONES.md` | Build order and acceptance criteria (the progress tracker)                  |
| `docs/DESIGN.md`     | Palette, type, motion, components, voice and lore rules                     |
| `docs/CONTENT.md`    | Every CV fact, where it lives in code, and what's still missing             |
| `docs/ASSETS.md`     | 3D/image/audio pipeline, budgets, licence logs                              |
| `docs/DEPLOYMENT.md` | GitHub + Vercel setup (yours), how deploys work, what Claude may/may not do |
| `docs/DECISIONS.md`  | Why things are the way they are                                             |
| `docs/references/`   | Reference images and the approved landing prototype                         |

## Scripts

| Command                  |                                                                |
| ------------------------ | -------------------------------------------------------------- |
| `npm run dev`            | Dev server with hot reload                                     |
| `npm run build`          | Type-check + production build into `dist/`                     |
| `npm run preview`        | Serve `dist/`                                                  |
| `npm run format`         | Prettier                                                       |
| `npm run models`         | Optimise `assets-src/models` → `public/models` + budget report |
| `npm run models:inspect` | Budget report only                                             |

---

Fonts: IM Fell English SC and Crimson Pro (SIL Open Font License), via Fontsource.
All artwork, wording and sound are original or licence-cleared. This is a fan homage to the Souls-like genre, not affiliated with FromSoftware or Round8.
