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

## Key Files

- `src/data/spinnerVerbs.js` — the 187 verbs (do not modify without verifying against source)
- `src/data/verbCategories.js` — 8 category groupings + `getCategoryForVerb()` helper
- `src/data/verbDefinitions.js` — 20 humorous definitions keyed by verb string
- `src/hooks/useSpinner.js` — Fisher-Yates shuffle, verb cycling, braille animation, pause
- `src/hooks/useVerbTracker.js` — tracks seen verbs, stats, streaks
- `src/hooks/useKonamiCode.js` — keypress sequence detector
- `src/components/EasterEggs.jsx` — exports `useEasterEggs` hook (not a visual component)

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
- Tooltip positioning uses fixed coordinates from click target bounding rect — may clip on very small viewports
- The donut chart segments use stroke-dasharray math that can have tiny visual gaps at small counts
