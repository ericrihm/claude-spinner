import { useState, useEffect, useRef } from 'react';
import { useSpinner } from './hooks/useSpinner';
import { useVerbTracker } from './hooks/useVerbTracker';
import { useEasterEggs } from './components/EasterEggs';
import SpinnerTerminal from './components/SpinnerTerminal';
import SpinnerControls from './components/SpinnerControls';
import VerbTooltip from './components/VerbTooltip';
import StatsPanel from './components/StatsPanel';
import GameCanvas from './components/game/GameCanvas';

export default function App() {
  const [mode, setMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'game' ? 'game' : 'spinner';
  });
  const [speed, setSpeed] = useState('normal');
  const [crtEnabled, setCrtEnabled] = useState(false);
  const [tooltipVerb, setTooltipVerb] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const startTimeRef = useRef(Date.now());
  const prevVerbRef = useRef(null);

  // Easter eggs needs a verb but we don't have it yet on first render,
  // so we track it via ref and re-derive each render
  const [currentVerbForEggs, setCurrentVerbForEggs] = useState(null);
  const easterEggs = useEasterEggs(currentVerbForEggs);

  const activeSpeed = easterEggs.isTurbo ? 'turbo' : speed;
  const {
    currentVerb,
    brailleChar,
    isPaused,
    togglePause,
    history,
  } = useSpinner(activeSpeed);

  const {
    trackVerb,
    seen,
    uniqueCount,
    totalSeen,
    percentage,
    isComplete,
    streak,
    getMostSeen,
    getLeastSeen,
  } = useVerbTracker();

  // Track verbs as they change
  useEffect(() => {
    if (currentVerb && currentVerb !== prevVerbRef.current) {
      trackVerb(currentVerb);
      setCurrentVerbForEggs(currentVerb);
      prevVerbRef.current = currentVerb;
    }
  }, [currentVerb, trackVerb]);

  // Spacebar to pause
  useEffect(() => {
    const handler = (e) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePause]);

  if (mode === 'game') {
    return (
      <div className="min-h-screen bg-terminal-bg text-white font-mono">
        <div className="max-w-6xl mx-auto p-4 lg:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-verb-active mb-2">
              Claude Code Spinner
            </h1>
            <p className="text-verb-ghost text-sm">
              187 verbs. One terminal. Infinite vibes.
            </p>
          </div>
          <GameCanvas onBack={() => setMode('spinner')} />
          <footer className="mt-12 pt-6 border-t border-terminal-border text-center text-[10px] text-verb-ghost space-y-1">
            <p>Inspired by the 187 spinner verbs in Claude Code v2.1.88</p>
            <p>Source: Anthropic's accidental npm source map leak, March 31, 2026</p>
            <p>
              Built by Eric Rihm —{' '}
              <a href="https://rihm.io" className="text-verb-active hover:underline" target="_blank" rel="noopener noreferrer">
                rihm.io
              </a>
            </p>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-terminal-bg text-white font-mono">
      <div className="max-w-6xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-verb-active mb-2">
            Claude Code Spinner
          </h1>
          <p className="text-verb-ghost text-sm">
            187 verbs. One terminal. Infinite vibes.
            <button
              onClick={() => setMode('game')}
              className="ml-3 text-verb-ghost hover:text-verb-active transition-colors cursor-pointer"
              title="Play Verb Surf"
            >
              ▶ Play
            </button>
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Left Column: Terminal + Controls */}
          <div>
            <SpinnerTerminal
              currentVerb={currentVerb}
              brailleChar={brailleChar}
              history={history}
              isPaused={isPaused}
              crtEnabled={crtEnabled}
              titleText={easterEggs.titleText}
              specialEffect={easterEggs.specialEffect}
              onVerbClick={(verb) => {
                // Create a synthetic position since we don't have the event
                setTooltipPos({ x: 100, y: 200 });
                setTooltipVerb(prev => prev === verb ? null : verb);
              }}
              onTitleClick={easterEggs.handleTitleClick}
            />

            <SpinnerControls
              speed={speed}
              onSpeedChange={setSpeed}
              isPaused={isPaused}
              onTogglePause={togglePause}
              crtEnabled={crtEnabled}
              onToggleCrt={() => setCrtEnabled(c => !c)}
              isTurbo={easterEggs.isTurbo}
            />
          </div>

          {/* Right Column: Stats */}
          <div>
            <StatsPanel
              totalSeen={totalSeen}
              uniqueCount={uniqueCount}
              percentage={percentage}
              isComplete={isComplete}
              streak={streak}
              getMostSeen={getMostSeen}
              getLeastSeen={getLeastSeen}
              seen={seen}
              startTime={startTimeRef.current}
            />
          </div>
        </div>

        {/* Attribution Footer */}
        <footer className="mt-12 pt-6 border-t border-terminal-border text-center text-[10px] text-verb-ghost space-y-1">
          <p>Inspired by the 187 spinner verbs in Claude Code v2.1.88</p>
          <p>Source: Anthropic's accidental npm source map leak, March 31, 2026</p>
          <p>
            Built by Eric Rihm —{' '}
            <a href="https://rihm.io" className="text-verb-active hover:underline" target="_blank" rel="noopener noreferrer">
              rihm.io
            </a>
          </p>
        </footer>
      </div>

      {/* Verb Tooltip */}
      <VerbTooltip
        verb={tooltipVerb}
        position={tooltipPos}
        onClose={() => setTooltipVerb(null)}
      />
    </div>
  );
}
