# Spider Solitaire 🕷️

A modern, juicy, open-source Spider Solitaire built with **React 18 + TypeScript + Vite + Tailwind**, designed to be GitHub-friendly and a joy to play. 1-suit, 2-suit and 4-suit modes, daily challenges, XP progression, achievements, unlockable themes — and an opt-in **God Mode** power-up panel.

> 🎴 Live: [spidersolitaire.xyz](https://spidersolitaire.xyz)

---

## Features

### Core game
- Authentic Spider Solitaire engine — 104-card deck, 10 columns, deal-from-stock, foundation completion.
- Three difficulties — **1 Suit**, **2 Suits**, **4 Suits** (and a Scorpio variant).
- Seeded shuffles — share a seed string to replay an exact deal.
- Hints, undo, auto-complete, lose detection.

### Engagement layer
- **Daily Challenge** — one seeded board per day, streak tracker baked in.
- **XP + Levels** — gain XP from wins, completed suits, no-undo runs, fast finishes.
- **Achievements** — 20+ unlockable badges (First Win, Perfectionist, Speedrunner, Spider King, etc.).
- **Unlockables** — extra card backs and table themes gated behind your level.
- **Stats per difficulty** — win rate, best time, best score, current/best streak.

### God Mode 🪄
Opt-in cheat panel for when you just want to chill. Toggling it on **disables stats and achievements for that game** to keep the leaderboard honest.
- **Peek** — flash all face-down cards face-up.
- **Magic Deal** — deal from stock even when columns are empty.
- **Shuffle Column** — reshuffle the face-up portion of one column.
- **Unlimited Undo** — undo all the way back to deal one.
- **Hint+** — auto-applies the recommended move.

### Juice & polish
- Confetti burst on every suit completion 🎉
- Screen shake on win
- Smooth Framer-Motion card transitions
- Double-click any card to auto-move it to the best target
- Drag preview with `@dnd-kit`
- Mobile-tuned touch (short long-press, swipe-scrollable tableau)
- Keyboard shortcuts (see below)
- Installable PWA with offline cache

### Keyboard shortcuts
| Key | Action |
| --- | --- |
| `H` | Hint |
| `D` | Deal from stock |
| `N` | New game |
| `A` | Auto-complete |
| `P` | Peek (god mode) |
| `G` | Open god-mode panel |
| `Ctrl/Cmd + Z` | Undo |
| `Esc` | Close overlay / clear selection |

---

## Getting started

```bash
# install
npm install

# dev server (Vite, hot reload)
npm run dev

# typecheck
npm run typecheck

# production build
npm run build

# preview the built bundle
npm run preview
```

The dev server runs on http://localhost:5173 by default.

### Project structure

```
src/
├── components/        # Game, Card, Column, Stock, Toolbar, modals
│   ├── GodModePanel.tsx
│   ├── AchievementsPanel.tsx
│   └── ...
├── engine/            # Pure game logic (zero React)
│   ├── deck.ts        # Seeded deck creation
│   ├── deal.ts        # Initial deal + stock deal
│   ├── moves.ts       # Move validation
│   ├── sequences.ts   # Completed-suit removal + win/lose
│   ├── hints.ts       # Best-move suggester
│   ├── solver.ts      # Auto-complete planner
│   ├── powerups.ts    # God-mode operations
│   ├── autoMove.ts    # Best target for double-click
│   ├── dailySeed.ts   # Date-derived seed for daily challenge
│   ├── achievements.ts# Achievement definitions and checkers
│   └── progression.ts # XP curve and level calculation
├── store/
│   └── gameStore.ts   # Zustand store with persistence
├── hooks/             # useTimer, useKeyboard, useLocalStorage
├── utils/             # cn, format, sound, confetti
├── types/game.ts
├── i18n.ts
└── main.tsx
```

The engine is intentionally pure — no React, no DOM, no `window` — so it's easy to unit-test or port. All state lives in a single Zustand store with immer.

---

## Deploying

### Vercel
The repo includes [`vercel.json`](./vercel.json). Push to GitHub and import in Vercel — that's it.

### Any static host (Netlify, Cloudflare Pages, GitHub Pages…)
```bash
npm run build
# upload dist/ to your host
```

### GitHub Pages
```bash
npm run build
# push the dist/ folder to the gh-pages branch, or use a workflow
```

---

## Contributing

Issues and PRs welcome! Some good first issues:
- Add new achievements
- Add new card-back / table-theme designs
- Write Vitest unit tests for `engine/`
- Improve solver heuristics

Run `npm run typecheck && npm run lint` before submitting.

---

## License

MIT © yosin — see [LICENSE](./LICENSE).
