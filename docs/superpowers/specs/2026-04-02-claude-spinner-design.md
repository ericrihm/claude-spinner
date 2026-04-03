# Claude Code Spinner Replica — Design Spec

## Overview

A standalone React (Vite) web app replicating the Claude Code CLI spinner UX with interactive controls, stats tracking, and easter eggs. Intended for portfolio deployment at rihm.io, with a portable `SpinnerEasterEgg` component extractable for reuse. Will later migrate to Next.js.

## Tech Stack

- **Vite + React 18** (functional components, hooks)
- **Tailwind CSS v3** via PostCSS (portable to Next.js)
- **Framer Motion** for mount/unmount animations and the Clauding flash
- **canvas-confetti** (~3KB) for the "catch 'em all" celebration
- **Google Fonts**: JetBrains Mono
- No chart library — SVG donut rendered manually

## Architecture

### Data Layer (`src/data/`)

| File | Contents |
|---|---|
| `spinnerVerbs.js` | Exports `SPINNER_VERBS` — the 187-verb array |
| `verbCategories.js` | Exports category map: `{ name, emoji, verbs[] }[]` with 8 categories |
| `verbDefinitions.js` | Exports `VERB_DEFINITIONS` — 20 humorous definitions, keyed by verb |

### Hooks (`src/hooks/`)

| Hook | Responsibility |
|---|---|
| `useSpinner(speed)` | Fisher-Yates shuffle of all 187 verbs, cycles through array, reshuffles on exhaustion. Returns `{ currentVerb, verbIndex, isPaused, togglePause, history[] }`. Interval varies by speed preset: Chill (2.5-3.5s), Normal (1.5-2.5s), Hyperspeed (0.4-0.8s). Turbo override: 100ms fixed. |
| `useVerbTracker()` | Tracks `Set<seen verbs>`, computes stats: total seen, unique count, percentage, current no-repeat streak, most/least seen verb. Persists nothing (session only). |
| `useKonamiCode(callback)` | Listens for arrow/key sequence, fires callback on match. Cleans up listener on unmount. |

### Components (`src/components/`)

| Component | Role |
|---|---|
| `SpinnerTerminal` | Main terminal window: title bar (traffic lights or Windows controls, toggleable), Braille spinner animation (`/[chars]/` cycling at 80ms), active verb line, ghost history (last 6 verbs fading via CSS opacity + translateY), optional CRT scanline overlay. |
| `SpinnerControls` | Speed segmented control (Chill/Normal/Hyperspeed), Pause button (also spacebar), CRT toggle. |
| `VerbTooltip` | Click a verb -> popover with definition from `verbDefinitions.js` or fallback "We're not sure either." Uses Framer Motion for enter/exit. |
| `StatsPanel` | Collapsible bottom drawer (mobile) / right sidebar (desktop). Session stats, SVG donut chart of verb categories, rarest/most-seen verb. |
| `CatchEmAll` | Progress ring showing unique-verb percentage. At 100%, fires `canvas-confetti` and shows congratulatory message. |
| `EasterEggs` | Manages: Clauding orange flash, Propagating coral emoji, Gitifying git icon, Konami turbo mode (100ms + CSS screen shake), title bar 5-click toggle. |
| `SpinnerEasterEgg` | Self-contained overlay component. Props: `duration`, `onComplete`, `theme` ("dark"/"light"/"terminal"), `showStats`. Auto-dismisses after duration with fade-out. Target: <15KB gzipped. |

### Layout (`App.jsx`)

CSS Grid: `grid-cols-1 lg:grid-cols-[1fr_320px]`. Terminal + controls stack in main column, stats panel in sidebar (desktop) or collapsible drawer (mobile). Footer with attribution.

## Visual Design

| Token | Value |
|---|---|
| Background | `#0D1117` |
| Active verb text | `#4ADE80` (green-400) |
| Ghost history text | `#6B7280` (gray-500) |
| Accent / Clauding flash | `#D97706` (amber-600) |
| Terminal border | `#30363D` with `border-radius: 8px`, `box-shadow: 0 8px 32px rgba(0,0,0,0.4)` |
| Title bar | Frosted glass: `backdrop-blur-md bg-white/5` |
| Font | JetBrains Mono, 14px terminal, 12px stats |

## Spinner Mechanics

1. On mount, Fisher-Yates shuffle the 187-verb array
2. Pop verbs one at a time at randomized intervals (within speed preset range)
3. When array exhausted, reshuffle and continue
4. Braille chars `["\u280B","\u2819","\u2839","\u2838","\u283C","\u2834","\u2826","\u2827","\u2807","\u280F"]` cycle at 80ms independent of verb interval
5. Each verb push adds to ghost history (max 6, FIFO), and updates tracker

## Easter Egg Details

- **Clauding**: `AnimatePresence` flash — text color transitions to `#D97706` for 1 cycle, then back
- **Propagating**: Append ` \ud83e\udeb8` to verb line
- **Gitifying**: Append inline SVG git-branch icon (16px)
- **Konami**: Sets speed to `turbo` (100ms fixed), adds `animate-shake` CSS keyframe to terminal
- **Title toggle**: Counter in component state, on 5th click swap title string

## Migration Notes (Vite -> Next.js)

- All components are pure React — no `import.meta.env` or Vite-specific APIs
- Tailwind config is standard PostCSS — drops into `next.config.js` unchanged
- `SpinnerEasterEgg` can be published as an npm package or copied as a directory
- Google Font loaded via `<link>` in `index.html` — move to `next/font` on migration

## Stopping Points

Each tier produces a deployable app:

1. **Tier 1 — MVP**: Scaffold + data + hooks + SpinnerTerminal + App (spinning verbs in a terminal)
2. **Tier 2 — Interactive**: + Controls + EasterEggs (speed, pause, konami, special verbs)
3. **Tier 3 — Complete**: + StatsPanel + CatchEmAll + VerbTooltip (full feature set)
4. **Tier 4 — Extractable**: + SpinnerEasterEgg component + README

## Attribution Footer

- "Inspired by the 187 spinner verbs in Claude Code v2.1.88"
- "Source: Anthropic's accidental npm source map leak, March 31, 2026"
- Link to Wes Bos X post
- "Built by Eric Rihm — rihm.io"
