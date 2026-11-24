# AGENTS.md

## Project
Static bilingual (Arabic RTL / Swedish LTR) Advent-style reading calendar for the Nativity Fast (Dec 1–25), for a Syriac Orthodox Sunday school class. Hosted on GitHub Pages. See PROJECT.md for full details.

## Stack & constraints
- Vanilla HTML/CSS/JS only. No frameworks, no bundlers, no npm dependencies.
- Must work when served as static files from a GitHub Pages subpath: use **relative paths** only.
- No external requests at runtime (fonts self-hosted, no CDN, no analytics). Audience includes children.
- Mobile first. Test at 360px width.

## Layout rules
- Page `<html lang="sv" dir="ltr">`. Swedish column on the left, Arabic column on the right.
- The Arabic column has its own `dir="rtl" lang="ar"`. Do not set `dir="rtl"` on the whole page.
- Below ~700px, stack columns vertically (Swedish first, then Arabic).

## Data
- All readings live in `data/readings.json` (25 entries, `day` 1–25). Never hardcode reading text in HTML/JS.
- Do not invent, paraphrase, or "fix" Bible text. If text is missing, leave a clearly marked placeholder and tell the user.
- Keep references (`ref_ar`, `ref_sv`) separate from the text.

## Date logic
- Use timezone `Europe/Stockholm` (via `Intl.DateTimeFormat`) for "today".
- Day N unlocks when current date >= Dec N of the current year.
- Support `?preview=all` and `?preview=N` for testing; never rely on these for security (client-side only).
- Countdown targets the next midnight in Europe/Stockholm; before Dec 1 it targets Dec 1.

## Design
- Palette: burgundy #7a1426, gold #d4af37, deep green #12372a, night #0f1535, warm white #fdf6e3. Define as CSS variables in `:root`.
- Christian Syriac Orthodox feel: Syriac cross, restrained ornament. Avoid secular Christmas clutter (Santa, etc.).
- Keep animations subtle; respect `prefers-reduced-motion`.
- Contrast must meet WCAG AA. Body text at least 18px for readings.

## Code style
- Small, readable functions with comments in English.
- Semantic HTML, accessible labels (`aria-label` on day tiles, `aria-disabled` for locked days).
- Locked tiles must not be keyboard-activatable.

## Language
- UI texts exist in both languages; keep them in one object in `js/app.js`.
- Chat with the user in Arabic unless they write otherwise. Code and comments in English.

## Do / Don't
- DO make minimal, targeted edits; explain changes briefly.
- DO ask before adding new dependencies or changing the folder structure.
- DON'T add a backend, database, or tracking.
- DON'T change the title: "قراءات صوم الميلاد المقدس، صف مور اغناطيوس".
- DON'T alter or remove the logo; place it at `assets/logo.png`.

## Definition of done
- Works offline-after-load, on mobile and desktop
- Locked/unlocked/today states verified using `?preview=N`
- Arabic and Swedish columns display correctly, no mixed-direction glitches
- All paths work under `/REPO/` on GitHub Pages