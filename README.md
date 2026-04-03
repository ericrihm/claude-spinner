# Claude Code Spinner

> **[Live Demo →](https://ericrihm.github.io/claude-spinner/)**

A fun, interactive web app that replicates the Claude Code CLI loading/spinner experience. Watch 187 real spinner verbs cycle through a terminal UI with ASCII buddies, interactive controls, stats tracking, and hidden easter eggs.

## Features

### Terminal Spinner
- **187 Spinner Verbs** — the exact verb list from Claude Code v2.1.88, Fisher-Yates shuffled to guarantee all appear before repeats
- **Organic Timing** — weighted timing buckets (fast/normal/hang/stutter) simulate real Claude Code's irregular rhythm
- **ASCII Buddies** — 6 animated companions (Capybara, Cat, Duck, Robot, Chonk, Ghost) with typewriter intro and idle animation
- **Braille Spinner** — animated Unicode braille characters cycle alongside the active verb
- **Speed Modes** — Chill / Normal / Hyperspeed, each scaling the organic timing differently
- **CRT Effect** — optional scanline overlay for retro terminal vibes
- **Verb Tooltips** — click any verb for a humorous definition (~82% coverage, 153 definitions)
- **Welcome Screen** — Ignignokt pixel sprite greets you before scrolling into the spinner

### Stats Panel
- Session timer, total verbs seen, unique verb count with progress ring
- Verb category donut chart (hand-rolled SVG, no chart libraries)
- Most/least seen verbs, no-repeat streak tracker
- Confetti celebration at 100% completion

### Verb Surf Mini-Game
- Endless runner where you jump over incoming verbs — longer words need higher jumps
- Charge-based jump + double jump physics
- Difficulty phases with escalating speed and hazard rates
- 5 lives per run (7 on reset), high score tracking
- Parallax scrolling background with code snippets
- Soundtrack from *Severance* (`spatial_audio.mp3`)

### Easter Eggs
- "Clauding" flashes text in Anthropic orange
- "Propagating" shows a coral emoji
- "Gitifying" shows a git branch icon
- Konami code (↑↑↓↓←→←→BA) unlocks **Turbo Mode** with screen shake
- Click the title bar 5× to toggle "Cobalt Systems Terminal" branding

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173/claude-spinner/](http://localhost:5173/claude-spinner/)

## Build & Deploy

```bash
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
```

Deployed to GitHub Pages via Actions workflow on push to `main`.

## Tech Stack

- React 18 + Vite
- Tailwind CSS v3 via PostCSS
- Framer Motion for animations
- canvas-confetti for celebration effect
- JetBrains Mono font (Google Fonts CDN)

## Project Structure

```
src/
├── data/
│   ├── spinnerVerbs.js     # 187 verbs
│   ├── verbCategories.js   # 8 category groupings
│   ├── verbDefinitions.js  # 153 humorous definitions
│   ├── buddies.js          # 6 ASCII buddy sprites (3 frames each)
│   ├── mooninite.js        # Ignignokt pixel sprite
│   ├── phases.js           # Verb Surf difficulty phases
│   └── commentary.js       # Game event commentary
├── hooks/
│   ├── useSpinner.js       # Verb cycling, shuffle, timing, buddy assignment
│   ├── useVerbTracker.js   # Stats, streaks, seen tracking
│   ├── useKonamiCode.js    # Keypress sequence detector
│   ├── useJumpPhysics.js   # Charge jump + double jump
│   └── useScoreTracker.js  # Game scoring, lives, high score
├── components/
│   ├── SpinnerTerminal.jsx # Main terminal display
│   ├── SpinnerControls.jsx # Speed, pause, CRT controls
│   ├── VerbTooltip.jsx     # Click-to-define tooltip
│   ├── StatsPanel.jsx      # Stats + donut chart
│   ├── EasterEggs.jsx      # useEasterEggs hook
│   └── game/
│       ├── GameCanvas.jsx       # Verb Surf game loop
│       ├── GameOverScreen.jsx   # End-game stats
│       ├── PlayerCharacter.jsx  # Buddy player sprite
│       └── ParallaxBackground.jsx
└── App.jsx
```

## Attribution

- Inspired by the 187 spinner verbs in [Claude Code](https://docs.anthropic.com/en/docs/claude-code) v2.1.88
- Source: Anthropic's accidental npm source map leak, March 31, 2026
- Built by Eric Rihm — [rihm.io](https://rihm.io)
