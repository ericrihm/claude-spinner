# Claude Code Spinner Replica — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a portfolio-ready React web app that replicates the Claude Code CLI spinner with 187 verbs, interactive controls, stats tracking, and easter eggs.

**Architecture:** Vite + React 18 with custom hooks for all state logic, Tailwind CSS for styling, Framer Motion for animations. Components are framework-agnostic for future Next.js migration. No external chart libraries — SVG donut rendered manually.

**Tech Stack:** Vite, React 18, Tailwind CSS v3, Framer Motion, canvas-confetti, JetBrains Mono (Google Fonts)

**Spec:** `docs/superpowers/specs/2026-04-02-claude-spinner-design.md`

---

## File Structure

```
spinner/
├── index.html                    # Entry point, Google Fonts link
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── index.css                 # Tailwind directives + custom CSS (CRT, shake, scanlines)
│   ├── main.jsx                  # ReactDOM.createRoot
│   ├── App.jsx                   # Layout grid, assembles all components
│   ├── data/
│   │   ├── spinnerVerbs.js       # SPINNER_VERBS array (187 items)
│   │   ├── verbCategories.js     # 8 category objects with emoji + verb arrays
│   │   └── verbDefinitions.js    # 20 humorous definitions keyed by verb
│   ├── hooks/
│   │   ├── useSpinner.js         # Shuffle, cycle, pause, speed, history
│   │   ├── useVerbTracker.js     # Seen set, stats, streak, most/least seen
│   │   └── useKonamiCode.js      # Keypress sequence detector
│   └── components/
│       ├── SpinnerTerminal.jsx   # Terminal window with spinner + ghost lines
│       ├── SpinnerControls.jsx   # Speed, pause, CRT toggle
│       ├── VerbTooltip.jsx       # Click-for-definition popover
│       ├── StatsPanel.jsx        # Stats sidebar/drawer with SVG donut
│       ├── CatchEmAll.jsx        # Progress ring + confetti at 100%
│       ├── EasterEggs.jsx        # Special verb effects + konami + title toggle
│       └── SpinnerEasterEgg.jsx  # Standalone overlay component
```

---

## TIER 1 — MVP (Working spinner in a terminal)

### Task 1: Scaffold Vite + React + Tailwind

**Files:**
- Create: `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.jsx`, `src/index.css`, `src/App.jsx`

- [ ] **Step 1: Initialize Vite project**

```bash
npm create vite@latest . -- --template react
```

- [ ] **Step 2: Install dependencies**

```bash
npm install tailwindcss@3 postcss autoprefixer framer-motion canvas-confetti
npx tailwindcss init -p
```

- [ ] **Step 3: Configure Tailwind**

`tailwind.config.js`:
```js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { mono: ['"JetBrains Mono"', 'monospace'] },
      colors: {
        terminal: { bg: '#0D1117', border: '#30363D' },
        verb: { active: '#4ADE80', ghost: '#6B7280' },
        accent: '#D97706',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
      },
      animation: { shake: 'shake 0.5s ease-in-out infinite' },
    },
  },
  plugins: [],
};
```

- [ ] **Step 4: Add Google Font to index.html**

Add to `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
```

- [ ] **Step 5: Set up index.css with Tailwind directives + custom styles**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'JetBrains Mono', monospace;
  background-color: #0D1117;
  color: #e6edf3;
  margin: 0;
}

.crt-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15) 0px,
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 3px
  );
  pointer-events: none;
  border-radius: inherit;
}

.ghost-line {
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}
```

- [ ] **Step 6: Write placeholder App.jsx and verify dev server starts**

```jsx
export default function App() {
  return <div className="min-h-screen bg-terminal-bg text-white font-mono p-8">
    <h1 className="text-verb-active">Claude Spinner</h1>
  </div>;
}
```

Run: `npm run dev`
Expected: Green "Claude Spinner" text on dark background.

- [ ] **Step 7: Commit**

```bash
git init && git add -A && git commit -m "feat: scaffold Vite + React + Tailwind project"
```

---

### Task 2: Data Files

**Files:**
- Create: `src/data/spinnerVerbs.js`, `src/data/verbCategories.js`, `src/data/verbDefinitions.js`

- [ ] **Step 1: Create spinnerVerbs.js**

Export the exact 187-verb array from the spec.

- [ ] **Step 2: Create verbCategories.js**

```js
import { SPINNER_VERBS } from './spinnerVerbs';

const CATEGORIES = [
  { name: 'Cooking', emoji: '\ud83c\udf73', verbs: ['Blanching','Caramelizing','Flamb\u00e9ing','Julienning','Kneading','Saut\u00e9ing','Seasoning','Simmering','Stewing','Zesting','Garnishing','Frosting','Marinating','Fermenting','Leavening','Proofing','Tempering','Brewing','Baking','Cooking','Drizzling','Whisking'] },
  { name: 'Thinking', emoji: '\ud83e\udde0', verbs: ['Cogitating','Contemplating','Considering','Deliberating','Musing','Pondering','Ruminating','Mulling','Cerebrating','Philosophising','Ideating','Puzzling','Noodling'] },
  { name: 'Movement', emoji: '\ud83d\udc83', verbs: ['Boogieing','Frolicking','Gallivanting','Jitterbugging','Moonwalking','Scampering','Shimmying','Skedaddling','Sock-hopping','Waddling','Meandering','Moseying','Perambulating','Scurrying','Slithering'] },
  { name: 'Chaos', emoji: '\ud83c\udf00', verbs: ['Discombobulating','Flibbertigibbeting','Hullaballooing','Razzmatazzing','Shenaniganing','Tomfoolering','Topsy-turvying','Boondoggling','Flummoxing','Befuddling','Dilly-dallying','Lollygagging','Whatchamacalliting','Wibbling','Canoodling','Fiddle-faddling'] },
  { name: 'Science', emoji: '\ud83d\udd2c', verbs: ['Crystallizing','Ionizing','Nebulizing','Nucleating','Osmosing','Photosynthesizing','Precipitating','Sublimating','Symbioting','Germinating','Evaporating','Pollinating','Metamorphosing','Propagating','Quantumizing'] },
  { name: 'Tech', emoji: '\u2699\ufe0f', verbs: ['Bootstrapping','Computing','Hashing','Gitifying','Processing','Generating','Synthesizing','Reticulating','Calculating','Crunching','Architecting','Hyperspacing'] },
  { name: 'Vibes', emoji: '\u2728', verbs: ['Vibing','Grooving','Enchanting','Manifesting','Harmonizing','Flowing','Beaming','Levitating','Envisioning','Unfurling','Sprouting'] },
];

export function getCategoryForVerb(verb) {
  for (const cat of CATEGORIES) {
    if (cat.verbs.includes(verb)) return cat;
  }
  return { name: 'Miscellaneous', emoji: '\ud83c\udfb2' };
}

export { CATEGORIES };
```

- [ ] **Step 3: Create verbDefinitions.js**

Export the 20-definition map from the spec.

- [ ] **Step 4: Commit**

```bash
git add src/data && git commit -m "feat: add spinner data files (verbs, categories, definitions)"
```

---

### Task 3: Core Hooks

**Files:**
- Create: `src/hooks/useSpinner.js`, `src/hooks/useVerbTracker.js`, `src/hooks/useKonamiCode.js`

- [ ] **Step 1: Create useSpinner.js**

```js
import { useState, useEffect, useCallback, useRef } from 'react';
import { SPINNER_VERBS } from '../data/spinnerVerbs';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SPEED_PRESETS = {
  chill: [2500, 3500],
  normal: [1500, 2500],
  hyperspeed: [400, 800],
  turbo: [100, 100],
};

const BRAILLE_CHARS = ['\u280B','\u2819','\u2839','\u2838','\u283C','\u2834','\u2826','\u2827','\u2807','\u280F'];

export function useSpinner(speed = 'normal') {
  const [queue, setQueue] = useState(() => shuffle(SPINNER_VERBS));
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [history, setHistory] = useState([]);
  const [brailleIndex, setBrailleIndex] = useState(0);
  const intervalRef = useRef(null);

  const currentVerb = queue[index] || queue[0];

  // Braille spinner animation (80ms)
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => setBrailleIndex(i => (i + 1) % BRAILLE_CHARS.length), 80);
    return () => clearInterval(id);
  }, [isPaused]);

  // Verb cycling
  useEffect(() => {
    if (isPaused) return;
    const [min, max] = SPEED_PRESETS[speed] || SPEED_PRESETS.normal;
    const delay = min + Math.random() * (max - min);

    intervalRef.current = setTimeout(() => {
      setIndex(prev => {
        const next = prev + 1;
        if (next >= queue.length) {
          setQueue(shuffle(SPINNER_VERBS));
          return 0;
        }
        return next;
      });
      setHistory(prev => [currentVerb, ...prev].slice(0, 6));
    }, delay);

    return () => clearTimeout(intervalRef.current);
  }, [isPaused, speed, index, queue, currentVerb]);

  const togglePause = useCallback(() => setIsPaused(p => !p), []);

  return {
    currentVerb,
    brailleChar: BRAILLE_CHARS[brailleIndex],
    isPaused,
    togglePause,
    history,
    verbIndex: index,
  };
}
```

- [ ] **Step 2: Create useVerbTracker.js**

```js
import { useState, useCallback, useRef } from 'react';
import { SPINNER_VERBS } from '../data/spinnerVerbs';

export function useVerbTracker() {
  const [seen, setSeen] = useState(new Set());
  const [totalSeen, setTotalSeen] = useState(0);
  const [streak, setStreak] = useState(0);
  const countsRef = useRef({});
  const lastVerbRef = useRef(null);

  const trackVerb = useCallback((verb) => {
    setSeen(prev => new Set(prev).add(verb));
    setTotalSeen(prev => prev + 1);
    countsRef.current[verb] = (countsRef.current[verb] || 0) + 1;

    if (verb !== lastVerbRef.current) {
      setStreak(prev => prev + 1);
    } else {
      setStreak(1);
    }
    lastVerbRef.current = verb;
  }, []);

  const uniqueCount = seen.size;
  const percentage = Math.round((uniqueCount / SPINNER_VERBS.length) * 100);
  const isComplete = uniqueCount === SPINNER_VERBS.length;

  const getMostSeen = () => {
    let max = ['', 0];
    for (const [v, c] of Object.entries(countsRef.current)) {
      if (c > max[1]) max = [v, c];
    }
    return max[0];
  };

  const getLeastSeen = () => {
    const seenEntries = Object.entries(countsRef.current);
    if (!seenEntries.length) return '';
    let min = ['', Infinity];
    for (const [v, c] of seenEntries) {
      if (c < min[1]) min = [v, c];
    }
    return min[0];
  };

  return {
    trackVerb,
    seen,
    uniqueCount,
    totalSeen,
    percentage,
    isComplete,
    streak,
    getMostSeen,
    getLeastSeen,
  };
}
```

- [ ] **Step 3: Create useKonamiCode.js**

```js
import { useEffect, useRef } from 'react';

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

export function useKonamiCode(callback) {
  const indexRef = useRef(0);

  useEffect(() => {
    const handler = (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === KONAMI[indexRef.current]) {
        indexRef.current++;
        if (indexRef.current === KONAMI.length) {
          callback();
          indexRef.current = 0;
        }
      } else {
        indexRef.current = 0;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [callback]);
}
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks && git commit -m "feat: add core hooks (useSpinner, useVerbTracker, useKonamiCode)"
```

---

### Task 4: SpinnerTerminal Component

**Files:**
- Create: `src/components/SpinnerTerminal.jsx`

- [ ] **Step 1: Build SpinnerTerminal**

Terminal window with: title bar (traffic lights), braille spinner + active verb, ghost history lines, CRT overlay toggle. Accepts props: `currentVerb`, `brailleChar`, `history`, `isPaused`, `crtEnabled`, `titleText`, `specialEffect` (for easter egg styling).

Key elements:
- Title bar with 3 colored dots (red/yellow/green) and title text
- Active line: `{brailleChar} {currentVerb}...` in green with blinking cursor
- Ghost lines: map over history with decreasing opacity (1.0 -> 0.15)
- CRT overlay via conditional `crt-overlay` class
- Click handler on verb text for tooltip

- [ ] **Step 2: Wire into App.jsx**

Import hooks and SpinnerTerminal, render with real data.

- [ ] **Step 3: Verify in browser**

Run: `npm run dev`
Expected: Terminal window with cycling verbs, ghost history scrolling up, braille spinner animating.

- [ ] **Step 4: Commit**

```bash
git add src/components/SpinnerTerminal.jsx src/App.jsx && git commit -m "feat: add SpinnerTerminal component — working spinner MVP"
```

---

## TIER 2 — Interactive

### Task 5: SpinnerControls Component

**Files:**
- Create: `src/components/SpinnerControls.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Build SpinnerControls**

Segmented speed control (Chill/Normal/Hyperspeed), Pause/Resume button, CRT toggle switch. Also wire spacebar to togglePause via `useEffect` keydown listener in App.

- [ ] **Step 2: Wire into App.jsx, add speed state**

- [ ] **Step 3: Commit**

```bash
git add src/components/SpinnerControls.jsx src/App.jsx && git commit -m "feat: add SpinnerControls (speed, pause, CRT toggle)"
```

---

### Task 6: EasterEggs + VerbTooltip

**Files:**
- Create: `src/components/EasterEggs.jsx`, `src/components/VerbTooltip.jsx`
- Modify: `src/App.jsx`, `src/components/SpinnerTerminal.jsx`

- [ ] **Step 1: Build EasterEggs as a logic component**

Returns `specialEffect` object based on current verb: `{ isClauding, isPropagating, isGitifying, isTurbo, titleText }`. Manages konami state and title click counter.

- [ ] **Step 2: Build VerbTooltip**

Popover that appears on verb click. Looks up definition from `verbDefinitions.js`, falls back to "We're not sure either." Uses Framer Motion `AnimatePresence`.

- [ ] **Step 3: Integrate into App and SpinnerTerminal**

- [ ] **Step 4: Commit**

```bash
git add src/components/EasterEggs.jsx src/components/VerbTooltip.jsx src/App.jsx src/components/SpinnerTerminal.jsx && git commit -m "feat: add easter eggs and verb tooltip"
```

---

## TIER 3 — Complete

### Task 7: StatsPanel + CatchEmAll

**Files:**
- Create: `src/components/StatsPanel.jsx`, `src/components/CatchEmAll.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Build CatchEmAll**

SVG progress ring showing `percentage` of unique verbs seen. Counter text `"42 of 187"`. At 100%, fire `confetti()` and show congratulatory message.

- [ ] **Step 2: Build StatsPanel**

Collapsible panel (toggle button). Contains: session stats (total, unique, time, streak), CatchEmAll component, SVG donut chart of verb categories (compute from seen set + getCategoryForVerb), most/least seen verbs.

SVG donut: compute arc segments proportional to category counts of seen verbs. Use `stroke-dasharray` and `stroke-dashoffset` on `<circle>` elements.

- [ ] **Step 3: Wire into App.jsx with responsive grid layout**

`grid-cols-1 lg:grid-cols-[1fr_320px]`. Stats panel as sidebar on desktop, bottom drawer on mobile.

- [ ] **Step 4: Add attribution footer**

- [ ] **Step 5: Commit**

```bash
git add src/components/StatsPanel.jsx src/components/CatchEmAll.jsx src/App.jsx && git commit -m "feat: add stats panel, catch-em-all tracker, and attribution footer"
```

---

## TIER 4 — Extractable

### Task 8: SpinnerEasterEgg Component

**Files:**
- Create: `src/components/SpinnerEasterEgg.jsx`

- [ ] **Step 1: Build self-contained overlay**

Props: `duration` (ms), `onComplete`, `theme` ("dark"/"light"/"terminal"), `showStats`. Internally uses `useSpinner` and `useVerbTracker`. Renders as fixed overlay with backdrop blur. Auto-dismisses after `duration` with Framer Motion fade-out. Calls `onComplete` on dismiss.

- [ ] **Step 2: Commit**

```bash
git add src/components/SpinnerEasterEgg.jsx && git commit -m "feat: add SpinnerEasterEgg standalone component"
```

---

### Task 9: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README**

Setup instructions, feature list, component API for SpinnerEasterEgg, attribution, screenshots section placeholder.

- [ ] **Step 2: Commit**

```bash
git add README.md && git commit -m "docs: add README with setup and component API"
```
