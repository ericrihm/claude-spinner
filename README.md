# Claude Code Spinner

A fun, interactive web app that replicates the Claude Code CLI loading/spinner experience. Watch 187 real spinner verbs cycle through a terminal UI with interactive controls, stats tracking, and hidden easter eggs.

## Features

- **Terminal Replica** - Dark terminal window with Braille spinner animation, ghost history lines, and optional CRT scanline effect
- **187 Spinner Verbs** - The exact verb list from Claude Code v2.1.88, shuffled to guarantee all appear before repeats
- **Interactive Controls** - Speed dial (Chill / Normal / Hyperspeed), pause/resume (spacebar), CRT toggle
- **Verb Tooltips** - Click any verb for a humorous definition (20 hand-written definitions + fallback)
- **Stats Panel** - Session stats, verb category donut chart, most/least seen verbs, no-repeat streak
- **Catch 'Em All** - Track unique verbs seen with progress ring. Confetti at 100%!
- **Easter Eggs**:
  - "Clauding" flashes text in Anthropic orange
  - "Propagating" shows a coral emoji
  - "Gitifying" shows a git branch icon
  - Konami code (arrow arrow arrow arrow B A) unlocks Turbo Mode with screen shake
  - Click the title bar 5 times to toggle "Cobalt Systems Terminal" branding

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
```

Output goes to `dist/`.

## Embeddable Component

`SpinnerEasterEgg` is a self-contained overlay component for use in other React apps:

```jsx
import SpinnerEasterEgg from './components/SpinnerEasterEgg';

<SpinnerEasterEgg
  duration={5000}          // Auto-dismiss after 5s (omit for indefinite)
  onComplete={() => {}}    // Callback on dismiss
  theme="dark"             // "dark" | "light" | "terminal"
  showStats={true}         // Show verb counter
/>
```

## Tech Stack

- React 18 + Vite
- Tailwind CSS v3
- Framer Motion
- canvas-confetti
- JetBrains Mono (Google Fonts)

## Attribution

- Inspired by the 187 spinner verbs in Claude Code v2.1.88
- Source: Anthropic's accidental npm source map leak, March 31, 2026
- Built by Eric Rihm - [rihm.io](https://rihm.io)

## Screenshots

_Coming soon_
