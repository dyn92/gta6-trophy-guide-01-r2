[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/dyn92/gta6-trophy-guide-01-r2/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/dyn92/gta6-trophy-guide-01-r2/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Platinum Atlas

A static, fully offline web guide and progress tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI — one platinum, two gold, six silver and forty-six bronze. Every trophy carries a guide written for this atlas in its own words: what the trophy actually asks for, when in the game it can be tackled, whether this atlas flags it as missable (judged from its official description), and which family of the hunt it belongs to.

Trophy names, descriptions and grades reproduce the official list published by Exophase. Progress targets and completion conventions follow PSNProfiles. No text is copied from any other guide.

## What it does

- **Atlas checklist** — all 55 trophies as cards with a tick box, the official description, an original walkthrough and a "when" line. Ticks persist in the browser via `localStorage`.
- **Export / import** — download your progress as a small JSON file and load it back on another browser or machine. A reset button clears the slate (with a confirmation).
- **Filters and search** — narrow the list by kind (story, side strand, crime, collectible, mastery and more), by grade, by earned state, or by free-text search across names, descriptions and guides.
- **Progress counters** — an overall count and percentage in the sidebar, plus a per-grade breakdown that updates as you tick.
- **Spoiler shield** — a toggle that blurs the names and descriptions of story trophies you have not earned yet, so the hunt does not spoil the campaign.
- **Platinum roadmap** — the hunt organised into six stages built from the official descriptions: story spine, stranger strands, skill and spectacle, collectibles and exploration, the crime-and-cash ledger, and the final road to 100 percent. Each stage shows its own completion bar and the trophies it covers.
- **Missables watch** — the seven trophies this atlas flags as missable, gathered on one page with the reasoning and the standing advice: keep rotating manual saves.

Everything runs offline. The app loads no external resource of any kind; its only data file is its own `app/data/trophies.json`.

## Running it

You need Node 22 (for the local server and the hand-in program; the site itself is plain static files).

```sh
node serve.ts            # serves app/ at http://localhost:8080
node serve.ts --port 9000   # or pick another port
```

Then open the printed address in a browser. Opening `app/index.html` through any static file server works too.

To produce the make.fun hand-in exactly as the scorer expects:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `app/` and `screenshots/` into `out/` and writes `out/dossier.json` with the vendored make.fun library in `vendor/makefun-frontend.ts` (left byte-for-byte untouched, as the bounty requires).

## Layout

- `app/index.html` — the page: sidebar, filters and the three views.
- `app/atlas.js` — all tracker logic: state, rendering, roadmap stages, import/export.
- `app/style.css` — the atlas styling, no frameworks.
- `app/data/trophies.json` — the 55 trophies with this atlas's own structure and guide text.
- `screenshots/` — four captures of the running app (checklist, roadmap, missables, spoiler shield), described by `shots.json`.
- `main.ts` — the hand-in program. `serve.ts` — the local development server.

## Licence

MIT — see `LICENSE`.

## Unofficial fan work

This is an unofficial fan-made guide. It is not affiliated with, endorsed by, or produced by Rockstar Games or Take-Two Interactive. Grand Theft Auto and GTA VI are trademarks of their respective owners. No official artwork or logos are included; the atlas is original text and styling only.
