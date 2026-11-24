# Presentation screenshots

Captured from the local preview server (`http://localhost:8000`).
Desktop = 1280px wide, Mobile = 360px wide. Heights are fitted to the page content.

## Home page (`index.html`)

| File | URL | What it shows |
|---|---|---|
| `home-live-desktop.png` / `home-live-mobile.png` | `/index.html` | Real date (23 Nov): all 25 tiles locked, countdown to 1 Dec, saying card hidden. |
| `home-01-desktop.png` / `home-01-mobile.png` | `/index.html?preview=1` | Day 1 unlocked, day 1 Church Father saying. |
| `home-12-desktop.png` / `home-12-mobile.png` | `/index.html?preview=12` | Days 1–12 open, day 12 highlighted as "today", day 12 saying. |
| `home-25-desktop.png` / `home-25-mobile.png` | `/index.html?preview=25` | All 25 days open, day 25 saying. |
| `home-all-desktop.png` / `home-all-mobile.png` | `/index.html?preview=all` | All tiles open, no "today" highlight, day 1 saying. |

## Day page (`day.html`)

| File | URL | What it shows |
|---|---|---|
| `day-01-desktop.png` / `day-01-mobile.png` | `/day.html?day=1&preview=1` | Day 1 reading, Swedish left / Arabic right. |
| `day-12-desktop.png` / `day-12-mobile.png` | `/day.html?day=12&preview=12` | Day 12 reading. |
| `day-25-desktop.png` / `day-25-mobile.png` | `/day.html?day=25&preview=25` | Day 25 reading. |
| `day-locked-desktop.png` / `day-locked-mobile.png` | `/day.html?day=13&preview=12` | Locked future day: bilingual "not yet" message, no text. |
| `day-placeholder-desktop.png` / `day-placeholder-mobile.png` | `/day.html?day=2&preview=1` | Unfilled day: clearly marked `[MISSING ...]` placeholders. |

## Quiz (day page, days 1 / 12 / 25)

| File | URL | What it shows |
|---|---|---|
| `quiz-gate-desktop.png` / `quiz-gate-mobile.png` | `/day.html?day=1&preview=1` | "Jag har läst klart / أنهيت القراءة" button below the reading; quiz still hidden. |
| `quiz-wrong-desktop.png` | `/day.html?day=1&preview=1` (after a wrong click) | Wrong option soft red + ✗, disabled; gentle "Försök igen / حاول مرة أخرى" feedback. |
| `quiz-half-desktop.png` / `quiz-half-mobile.png` | (wrong, then correct) | Correct option green + ✓, explanation, half star, "Börja om / إعادة المحاولة" reset. |
| `quiz-full-desktop.png` | (correct on first try) | Full gold star for a first-try correct answer. |

## Reference-look restyle

| File | Width | What it shows |
|---|---|---|
| `restyled-home-360.png` | 360px | Mobile home: night background, gold divider, translucent cards, 5-column grid, today glow. |
| `restyled-home-768.png` | 768px | Tablet home: side-by-side header and quote columns. |
| `restyled-home-1280.png` | 1280px | Desktop home: full layout. |
| `restyled-day-360.png` | 360px | Mobile day page with darker overlay and cream reading card. |
| `restyled-day-1280.png` | 1280px | Desktop day page: Swedish/Arabic columns with gold ✦ divider. |
| `restyled-quiz-1280.png` | 1280px | Quiz restyled to the dark card theme (wrong → correct, half star). |
| `bright-day-1280.png` / `bright-day-360.png` | `?day=1&preview=1` | Day page after the brightness fix — background identical to the home page. (Older `restyled-day-*` shots show the darker version.) |
| `header-centered-1280.png` | `?preview=12` | Header with the three text lines centred in the page (logo still left), 1.15rem bilingual subtitles and centred ★ divider. |

## Notes for colleagues

- Days 1, 12 and 25 contain real sample content; the other 22 days are still placeholders.
- Quiz questions on days 1, 12 and 25 are clearly marked `[PLACEHOLDER]` samples — real questions are still to be supplied. Days without a quiz show no quiz section.
- The saying card appears on the home page only, and only during 1–25 December (or via `?preview=N`).
- Day 25 currently has reference "Psalm 25" but the supplied text is Psalm 2:1–3; this is pending confirmation.
- The fixed Arabic title is unchanged; the new bilingual subtitle sits below it.
- "SOUF S:t Jacob" appears under the logo; footer reads "För Mor Ignatius gruppen" / "لصف مور اغناطيوس".
