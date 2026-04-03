# Claude Code Spinner

## Project Overview

Interactive web app replicating the Claude Code CLI spinner UX with 187 real spinner verbs, interactive controls, stats tracking, and easter eggs. Portfolio project for rihm.io, with plans to migrate to Next.js.

## Tech Stack

- React 18 + Vite (will migrate to Next.js later)
- Tailwind CSS v3 via PostCSS
- Framer Motion for animations
- canvas-confetti for celebration effect
- JetBrains Mono font (Google Fonts CDN)

## Architecture

- **No Vite-specific APIs** — components are framework-agnostic for Next.js portability
- All state logic lives in custom hooks (`src/hooks/`), not React context
- `SpinnerEasterEgg.jsx` is a self-contained overlay component meant for extraction/reuse
- No chart libraries — SVG donut is hand-rolled
- No backend — fully client-side
- Terminal welcome section (Ignignokt sprite) scrolls off on load via rAF animation; Verb Surf button stays pinned
- History entries are objects `{ id, verb, buddyIdx }` with stable unique IDs for clean React keying
- Buddy sprites use character-by-character typewriter animation on first appearance, idle animation loop after
- Verb Surf game music (`/spatial_audio.mp3`) loops continuously through game over screen, only stops on exit

## Key Files

- `src/data/spinnerVerbs.js` — the 187 verbs (do not modify without verifying against source)
- `src/data/verbCategories.js` — 8 category groupings + `getCategoryForVerb()` helper
- `src/data/verbDefinitions.js` — 153 humorous definitions keyed by verb string (~82% coverage)
- `src/data/buddies.js` — 6 ASCII art buddy sprites (Capybara, Cat, Duck, Robot, Chonk, Ghost) with 3 animation frames each + idle animation sequence
- `src/data/mooninite.js` — Ignignokt pixel sprite (30x23 grid, `G`/`B` color keys)
- `src/data/phases.js` — Verb Surf game difficulty phases with hazard rates and speed scaling
- `src/data/commentary.js` — Game commentary strings for events (hits, streaks, game over, etc.)
- `src/hooks/useSpinner.js` — Fisher-Yates shuffle, verb cycling, braille animation, pause, buddy assignment (no consecutive duplicates), stable history entry IDs
- `src/hooks/useVerbTracker.js` — tracks seen verbs, stats, streaks
- `src/hooks/useKonamiCode.js` — keypress sequence detector
- `src/hooks/useJumpPhysics.js` — charge-based jump + double jump physics for Verb Surf game
- `src/hooks/useScoreTracker.js` — game scoring, lives (5 initial / 7 on reset), streaks, high score
- `src/components/EasterEggs.jsx` — exports `useEasterEggs` hook (not a visual component)
- `src/components/game/GameCanvas.jsx` — Verb Surf mini-game canvas with music, hazards, phase progression
- `src/components/game/GameOverScreen.jsx` — end-game stats overlay with usage bar

## Commands

```bash
npm run dev      # Start dev server on :5173
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

## Design Tokens

| Token | Value |
|---|---|
| Background | `#0D1117` |
| Active verb | `#4ADE80` (green) |
| Ghost text | `#6B7280` (gray) |
| Accent | `#D97706` (amber, used for Clauding flash) |
| Terminal border | `#30363D` |

## Conventions

- Functional components with hooks only
- Tailwind for all styling — no CSS modules, no styled-components
- Custom CSS only in `src/index.css` for things Tailwind can't do (CRT overlay, scrollbar)
- No TypeScript (yet) — plain JSX
- Attribution footer must always credit Eric Rihm / rihm.io and cite the source

## Known Limitations

- `useEasterEggs` is called as a hook but exported from `components/EasterEggs.jsx` — this is intentional since it manages both state and the Konami code listener
- Tooltip positioning uses click target bounding rect — may clip on very small viewports
- The donut chart segments use stroke-dasharray math that can have tiny visual gaps at small counts
- Ignignokt sprite rows must all be exactly 30 characters — shorter rows cause CSS grid skew
- Terminal scroll has three phases (waiting → animated scroll past welcome → verb-driven smooth scroll) — the rAF and smooth scroll must not fight each other
- ~35 verbs still lack tooltip definitions in `verbDefinitions.js`
