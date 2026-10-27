---
description: Start a milestone from docs/MILESTONES.md (e.g. /start-milestone M2)
argument-hint: M<number>
---

Start milestone **$ARGUMENTS**.

1. Read `CLAUDE.md`, then the **$ARGUMENTS** section of `docs/MILESTONES.md`, then every doc and reference it links to (PLAN.md, DESIGN.md, CONTENT.md, ASSETS.md sections, `docs/references/*`).
2. Check the previous milestone is done (all boxes ticked). If not, tell me what's left and stop.
3. Check `docs/CONTENT.md` → "Open content" for anything this milestone needs from me (📄). List what's missing; we can use clearly marked placeholders, but tell me.
4. Create the branch `feat/<milestone-lowercase>-<short-slug>` (e.g. `feat/m2-travel-warp`).
5. Produce a **plan** and wait for my approval before writing code:
   - the acceptance criteria, restated
   - files to create or modify (reuse existing components/tokens first)
   - new `/lab` specimens you'll add
   - risks, open questions, and any dependency you want to add (with why)
6. After approval, build in small steps. After each step, tell me what to look at in `npm run dev` (route + what should happen).
7. Finish with `/verify`, tick the boxes in `docs/MILESTONES.md`, update CLAUDE.md "Status", append to `docs/DECISIONS.md` if needed, and propose a commit message. **No attribution of any kind** (no Co-Authored-By, no "Generated with", no links): I am the only author. Commit only after I approve; I push.
