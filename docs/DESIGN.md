# Design system: "Ash and Ember"

Source of truth for values: `src/styles/tokens.css`. This doc explains **how to use them**.
Live specimens: `npm run dev` → `/lab`.

## 1. Colour (Palette A, locked)

| Token            | Hex       | Role                                                                | Contrast on void |
| ---------------- | --------- | ------------------------------------------------------------------- | ---------------- |
| `--c-void`       | `#060505` | Page ground. Darkest.                                               | n/a              |
| `--c-ash`        | `#16110D` | Raised surfaces, panels                                             | n/a              |
| `--c-stone`      | `#2A221C` | Hairlines, dividers, frame strokes                                  | n/a              |
| `--c-muted`      | `#A9A196` | Secondary text, labels, footer                                      | 8.0:1 ✅         |
| `--c-bone`       | `#F2EDE4` | Primary text                                                        | 17.5:1 ✅        |
| `--c-ember`      | `#E8A866` | **The one accent**: fire, focus ring, active/selected, key headings | 9.9:1 ✅         |
| `--c-text-faint` | `#7A7369` | Decorative or ≥18px only                                            | 4.35:1 ⚠         |
| `--c-ember-deep` | `#C4651F` | Fire core, pressed states, decoration only                          | 5.1:1            |

Rules:

- **One accent.** Ember is the only colour. No blues, greens or reds in UI (fire art may use its own reds and oranges).
- Ember marks _where the player's attention should go_: selected item, focus, primary action, active tab. If everything is ember, nothing is.
- Text is bone or muted. Never pure white (`#fff`) or pure grey.
- Light comes from a source. Glows (`--c-ember-glow`) appear only near a fire or a selected element.

## 2. Typography (locked)

| Use                         | Font               | Size                  | Notes                                                       |
| --------------------------- | ------------------ | --------------------- | ----------------------------------------------------------- |
| Hero / location title cards | IM Fell English SC | `--fs-hero` (40–72px) | `--tracking-display`, ember or bone                         |
| Page and section titles     | IM Fell English SC | 24–40px               |                                                             |
| Labels, tabs, key headings  | IM Fell English SC | **16px minimum**      | `--tracking-label`. Below 16px the rough ink turns to mush. |
| Body, lore, descriptions    | Crimson Pro        | 18–20px               | line-height 1.55, max 64ch                                  |
| Stats, numbers              | Crimson Pro        | 16–20px               | `.num` → tabular lining numerals                            |
| Footnotes, kbd              | Crimson Pro        | 14–16px               |                                                             |

- Italics (Crimson Pro italic) for roles, asides and in-world quotations.
- IM Fell English SC is small caps by design: write titles in normal case ("Hall of Works") and the font handles the caps. Never `text-transform: uppercase` on it.
- Lies of P reference look: section title in display font, thin rule under it, rows of `label …… value` in body font.

## 3. Space and layout

- 4px base scale `--sp-1 … --sp-9`. Page gutter `--gutter` (16px on phones, up to 40px).
- `--maxw: 1280px` for content, `--maxw-text: 64ch` for prose.
- **No rounded corners** (`--radius: 0`). The world is carved stone and iron.
- Hairline frames (`Frame.astro`) with small ember corner marks are the standard panel.
- Layouts must work at **360px** wide. Side-by-side panels stack on mobile.

## 4. Components (in `src/components/ui`)

| Component     | Use                                             | Notes                                                     |
| ------------- | ----------------------------------------------- | --------------------------------------------------------- |
| `TextBox`     | Dialogue, intro text, notifications, menus      | Black 94%, 1px light edge, inner double edge, 20px text   |
| `RuneButton`  | Actions                                         | `rune` = framed ember (max one per view), `ghost` = quiet |
| `KeyPrompt`   | `[ESC] Back`, `[Q][E] Switch tab`, `[M] Travel` | Hidden on touch devices                                   |
| `Frame`       | Panels: stats, item descriptions, cards         | Optional title rule, Lies of P style                      |
| `Bonfire2D`   | Loader (≈72px), fallback (240px)                | The 3D fire must match its silhouette                     |
| `Fog`         | Behind every world page                         | `light` / `normal` / `thick`                              |
| `SwordCursor` | Desktop only                                    | Hotspot = blade tip                                       |

Planned (see MILESTONES.md): `Loader`, `TravelMenu`, `TitleCard`, `Radar`, `Tabs`, `RelicSlot`, `ItemPanel`, `BossCard`, `SkillTile`, `AudioDirector`, `Bard`.

## 5. Motion

| Moment                  | Duration                  | Easing                                             |
| ----------------------- | ------------------------- | -------------------------------------------------- |
| Hover, tick             | `--dur-fast` 120ms        | `--ease-out`                                       |
| Panels, tabs, selection | `--dur-base` 240ms        | `--ease-out` / `--ease-ember` (tiny overshoot)     |
| Fade to black           | `--dur-fade` 600ms        | `--ease-in-out`                                    |
| Location title card     | `--dur-title` 1000ms      | fade in, letter-spacing breathes out slightly      |
| Whole warp              | **≤ `--dur-warp` 1200ms** | The first warp is magic. The tenth must not annoy. |

- Ambient motion (fog drift, flicker, embers) is slow and continuous. UI motion is quick and purposeful.
- `prefers-reduced-motion`: the tokens already shrink durations. Also replace the warp with a 150ms cross-fade, stop camera drift and particles, and use `Bonfire2D` instead of the 3D scene.

## 6. Atmosphere recipe (the "vibe")

1. Ground `--c-void`, radial warm falloff around the light source.
2. 2–3 fog layers drifting at different speeds (CSS here, `FogExp2` in 3D).
3. Film grain at ~7% opacity, stepped animation.
4. Vignette to near-black at the edges.
5. **One** warm light per screen (fire, lantern, a relic's glow). Everything else is silhouette.
6. Engraved details: hairlines, ember corner marks, small ornaments. Never drop shadows or gradients on UI chrome.

## 7. Iconography and illustration

- **Style:** etched / woodcut / engraving line art, single colour (`currentColor`), 64×64 viewBox, 1.5px strokes, hatching for shade.
- Used for Armoury icons, relic pedestals and boss cards. One style across all three.
- No emoji. No stock icon sets in the world UI (a few utility icons in the footer are OK if drawn in the same stroke style).

## 8. Voice and lore

| Register | Example                                                                   | Where                                                         |
| -------- | ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| In-world | "A lone flame burns at the edge of the ruins. Rest here, traveller."      | Text boxes, lore, tips, title cards                           |
| Plain    | "Projects", "Python", "1st place, Sight Day Congress Technical Challenge" | Labels, facts, CV, buttons that leave the world (Download CV) |

- Short sentences. Archaic flavour (traveller, keeper, relic, vanquished) but always readable. No "thee/thou".
- Second person for invitations, third person ("the keeper") for Akrem in lore. First person only on `/cv` and contact.
- Every in-world label has its plain label beside it.
- **Banned (too close to the games):** "YOU DIED", "Bonfire Lit", "Victory Achieved", "Enemy Felled", "Great Enemy Felled", "Hollow", "Estus", "Ergo", "Praise the Sun", Firelink, Lothric and other proper nouns.
