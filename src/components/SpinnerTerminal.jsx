import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IGNIGNOKT, MOON_ANIM } from '../data/mooninite';
import { BUDDIES, ANIM_SEQUENCE } from '../data/buddies';

const PX = 5; // pixel size in CSS px

function PixelSprite({ frame, cols, colors }) {
  const rows = frame.length;
  return (
    <div
      className="inline-grid select-none"
      style={{
        gridTemplateColumns: `repeat(${cols}, ${PX}px)`,
        gridTemplateRows: `repeat(${rows}, ${PX}px)`,
      }}
    >
      {frame.flatMap((row, r) =>
        row.split("").map((ch, c) => (
          <div
            key={`${r}-${c}`}
            style={{
              background: colors[ch] || "transparent",
            }}
          />
        ))
      )}
    </div>
  );
}

function ActiveBuddySprite({ buddyIdx }) {
  const [tick, setTick] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [doneTyping, setDoneTyping] = useState(false);
  const prevBuddyRef = useRef(buddyIdx);
  const buddy = BUDDIES[buddyIdx] || BUDDIES[0];

  const restFrame = buddy.frames[0];
  const totalChars = restFrame.join('\n').length;

  // Reset typewriter when buddy changes
  useEffect(() => {
    if (buddyIdx !== prevBuddyRef.current) {
      prevBuddyRef.current = buddyIdx;
      setCharCount(0);
      setDoneTyping(false);
      setTick(0);
    }
  }, [buddyIdx]);

  // Typewriter animation
  useEffect(() => {
    if (doneTyping) return;
    if (charCount >= totalChars) {
      setDoneTyping(true);
      return;
    }
    const timer = setTimeout(() => {
      setCharCount(c => c + 1);
    }, 32);
    return () => clearTimeout(timer);
  }, [charCount, totalChars, doneTyping]);

  // Idle animation after fully typed
  useEffect(() => {
    if (!doneTyping) return;
    const interval = setInterval(() => {
      setTick(t => (t + 1) % ANIM_SEQUENCE.length);
    }, 650);
    return () => clearInterval(interval);
  }, [doneTyping]);

  let frame;
  if (doneTyping) {
    const animState = ANIM_SEQUENCE[tick];
    if (animState === 1) frame = buddy.frames[1];
    else if (animState === 2) frame = buddy.frames[2];
    else frame = buddy.frames[0];
    if (animState === -1) {
      frame = buddy.frames[0].map(line => line.replace(/·/g, '-'));
    }
  } else {
    frame = restFrame;
  }

  const fullText = frame.join('\n');
  const visibleText = doneTyping
    ? fullText
    : fullText.slice(0, charCount) + '\u2588';

  return (
    <pre
      className="leading-[12px] select-none"
      style={{
        fontSize: '10px',
        color: '#4ADE80',
        margin: 0,
        minHeight: '62px',
      }}
    >
      {visibleText}
    </pre>
  );
}

function MooniniteWelcome() {
  const [frameIdx, setFrameIdx] = useState(0);

  useEffect(() => {
    let seqIdx = 0;
    const interval = setInterval(() => {
      seqIdx = (seqIdx + 1) % MOON_ANIM.length;
      setFrameIdx(MOON_ANIM[seqIdx]);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const frame = IGNIGNOKT.frames[frameIdx] || IGNIGNOKT.frames[0];

  return (
    <div className="text-center mb-4 pb-4 border-b border-terminal-border/50">
      <p className="text-white text-sm font-bold mb-3">Welcome!</p>
      <div className="flex justify-center mb-3">
        <PixelSprite
          frame={frame}
          cols={IGNIGNOKT.cols}
          colors={IGNIGNOKT.colors}
        />
      </div>
      <p className="text-verb-ghost text-[11px]">
        187 verbs &middot; Endless vibes &middot;{' '}
        <a
          href="https://rihm.io"
          className="text-verb-ghost hover:text-verb-active transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          rihm.io
        </a>
      </p>
    </div>
  );
}

function StartupBanner() {
  return (
    <div
      className="mb-3 text-[11px] leading-relaxed select-none"
      style={{ color: '#30363D' }}
    >
      <div>{'\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510'}</div>
      <div>{'\u2502'}  <span style={{ color: '#6B7280' }}>Claude Code Spinner v2.1.88</span>{'                  \u2502'}</div>
      <div>{'\u2502'}  <span style={{ color: '#4a5568' }}>187 verbs loaded · 6 buddies ready</span>{'             \u2502'}</div>
      <div>{'\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518'}</div>
    </div>
  );
}

function BuddySeparator({ buddyName }) {
  const dashes = '\u2500'.repeat(40);
  return (
    <div
      className="text-[11px] select-none py-0.5"
      style={{ color: '#3d4450' }}
    >
      {'\u2500\u2500'} buddy: {buddyName} {dashes}
    </div>
  );
}

function formatDuration(ms) {
  return (ms / 1000).toFixed(1) + 's';
}

function HistoryLine({ verb, duration, opacity, onVerbClick }) {
  return (
    <div
      className="flex items-center text-[12px] leading-[18px] ghost-line"
      style={{ color: '#6B7280', opacity }}
    >
      <span className="flex-shrink-0" style={{ color: '#4a5568' }}>{'\u2714'}</span>
      <span
        className="ml-1.5 cursor-pointer hover:underline truncate"
        onClick={onVerbClick}
      >
        {verb}
      </span>
      <span className="ml-1 flex-shrink-0">...</span>
      <span className="ml-auto pl-4 flex-shrink-0 tabular-nums" style={{ color: '#4a5568' }}>
        {formatDuration(duration)}
      </span>
    </div>
  );
}

function TimestampSeparator({ elapsed }) {
  const m = Math.floor(elapsed / 60000);
  const s = Math.floor((elapsed % 60000) / 1000);
  const ts = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return (
    <div
      className="text-[10px] text-right select-none py-0.5 pr-1"
      style={{ color: '#2d333b' }}
    >
      {'\u2500\u2500'} {ts} {'\u2500\u2500'}
    </div>
  );
}

export default function SpinnerTerminal({
  currentVerb,
  brailleChar,
  history,
  currentBuddyIdx,
  isPaused,
  crtEnabled,
  titleText,
  specialEffect,
  onVerbClick,
  onTitleClick,
  onPlayGame,
}) {
  const scrollRef = useRef(null);
  const welcomeRef = useRef(null);
  const scrollPhase = useRef('waiting'); // waiting | scrolling | done
  const animFrameRef = useRef(null);
  const [welcomeHeight, setWelcomeHeight] = useState(0);
  const [scrollDone, setScrollDone] = useState(false);
  const startTimeRef = useRef(Date.now());

  // Measure the welcome section so we know how far to scroll
  useEffect(() => {
    if (welcomeRef.current) {
      setWelcomeHeight(welcomeRef.current.offsetHeight);
    }
  }, []);

  // On mount, wait briefly then scroll past welcome at a readable pace
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = 0;

    const timer = setTimeout(() => {
      if (!scrollRef.current) return;
      scrollPhase.current = 'scrolling';
      const el = scrollRef.current;
      const welcomeH = welcomeRef.current?.offsetHeight || 200;
      const speed = Math.max(welcomeH / 2, 120);

      let lastTime = null;
      const step = (timestamp) => {
        if (!lastTime) lastTime = timestamp;
        const dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        if (!scrollRef.current || scrollPhase.current === 'done') return;

        const maxScroll = el.scrollHeight - el.clientHeight;
        el.scrollTop = Math.min(el.scrollTop + speed * dt, maxScroll);

        if (el.scrollTop >= welcomeH) {
          scrollPhase.current = 'done';
          setScrollDone(true);
          return;
        }
        animFrameRef.current = requestAnimationFrame(step);
      };
      animFrameRef.current = requestAnimationFrame(step);
    }, 1500);

    return () => {
      clearTimeout(timer);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Once welcome scroll is done, keep bottom pinned as verbs arrive
  useEffect(() => {
    if (scrollPhase.current === 'waiting') return;
    if (!scrollRef.current) return;
    if (scrollPhase.current === 'scrolling') return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [currentVerb, history]);

  const getVerbColor = () => {
    if (specialEffect?.isClauding) return 'text-accent';
    return 'text-verb-active';
  };

  // Build history rows with separators — history is newest-first, render oldest-first
  const reversedHistory = [...history].reverse();
  const currentBuddy = BUDDIES[currentBuddyIdx] || BUDDIES[0];

  // Compute cumulative elapsed time for timestamp separators
  let cumulativeMs = 0;
  const historyRows = [];
  let prevBuddyIdx = null;
  let lineCount = 0;

  for (let i = 0; i < reversedHistory.length; i++) {
    const entry = reversedHistory[i];
    const verb = typeof entry === 'string' ? entry : entry.verb;
    const buddyIdx = typeof entry === 'string' ? 0 : entry.buddyIdx;
    const entryId = typeof entry === 'string' ? `legacy-${i}` : entry.id;
    const duration = entry.duration || 0;
    cumulativeMs += duration;

    // Buddy separator when buddy changes or first entry
    if (buddyIdx !== prevBuddyIdx) {
      const buddy = BUDDIES[buddyIdx] || BUDDIES[0];
      historyRows.push(
        <BuddySeparator key={`sep-${entryId}`} buddyName={buddy.name} />
      );
    }
    prevBuddyIdx = buddyIdx;

    // Fade: oldest entries dimmer. reversedHistory[0] is oldest visible.
    const age = reversedHistory.length - i; // 1 = newest, length = oldest
    const opacity = Math.max(0.35, 1 - (age - 1) * 0.04);

    historyRows.push(
      <HistoryLine
        key={entryId}
        verb={verb}
        duration={duration}
        opacity={opacity}
        onVerbClick={(e) => onVerbClick?.(verb, e)}
      />
    );

    lineCount++;

    // Timestamp separator every ~20 lines
    if (lineCount > 0 && lineCount % 20 === 0) {
      historyRows.push(
        <TimestampSeparator key={`ts-${entryId}`} elapsed={cumulativeMs} />
      );
    }
  }

  return (
    <div
      className={`rounded-lg border border-terminal-border bg-terminal-bg shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden ${
        specialEffect?.isTurbo ? 'animate-shake' : ''
      } ${crtEnabled ? 'crt-overlay' : ''}`}
    >
      {/* Title Bar */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b border-terminal-border backdrop-blur-md bg-white/5 cursor-pointer select-none"
        onClick={onTitleClick}
      >
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
        </div>
        <span className="text-xs text-verb-ghost ml-2">{titleText}</span>
      </div>

      {/* Terminal Body */}
      <div className="font-mono text-sm terminal-body flex flex-col" style={{ height: 'clamp(300px, 50vh, 520px)' }}>
        {/* Pinned Verb Surf button */}
        {onPlayGame && (
          <div className="px-4 pt-3 pb-2 border-b border-terminal-border/50 flex-shrink-0">
            <button
              onClick={onPlayGame}
              className="text-[11px] text-verb-ghost hover:text-verb-active border border-terminal-border hover:border-verb-active rounded px-2 py-0.5 transition-colors"
            >
              {'\u25B6'} Verb Surf
            </button>
          </div>
        )}

        {/* Scrollable history */}
        <div className="flex-1 overflow-y-auto px-4 pt-3 pb-1 terminal-scroll" ref={scrollRef}>
          {/* Welcome section — scrolls up like terminal output */}
          <div ref={welcomeRef}>
            <MooniniteWelcome />
          </div>

          {/* Startup banner */}
          <StartupBanner />

          {/* Compact history lines with buddy separators */}
          <div className="mb-1">
            {historyRows}
          </div>

          {/* Spacer ensures enough scroll room to push welcome off-screen */}
          {welcomeHeight > 0 && !scrollDone && (
            <div style={{ minHeight: welcomeHeight }} aria-hidden="true" />
          )}
        </div>

        {/* Active verb area — pinned at bottom */}
        <div className="flex-shrink-0 border-t border-terminal-border/50 px-4 py-3">
          {/* Buddy separator for current buddy */}
          <BuddySeparator buddyName={currentBuddy.name} />

          {/* Buddy sprite — the showpiece */}
          <div className="py-2 pl-2">
            <ActiveBuddySprite buddyIdx={currentBuddyIdx} />
          </div>

          {/* Active verb line */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentVerb}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className={`flex items-center gap-2 text-[13px] ${getVerbColor()}`}
            >
              <span className="w-4 text-center flex-shrink-0">{isPaused ? '\u23F8' : brailleChar}</span>
              <span
                className="cursor-pointer hover:underline truncate"
                onClick={(e) => onVerbClick?.(currentVerb, e)}
              >
                {currentVerb}
              </span>
              {specialEffect?.isPropagating && <span className="ml-1">{'\uD83E\uDEB8'}</span>}
              {specialEffect?.isGitifying && (
                <svg className="w-4 h-4 ml-1 inline flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M9.5 3.25a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.5 2.5 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25Z" />
                </svg>
              )}
              <span className="flex-shrink-0">...</span>
              <span className="animate-blink ml-1 flex-shrink-0">{'\u2588'}</span>
            </motion.div>
          </AnimatePresence>

          {/* Pause indicator */}
          {isPaused && (
            <div className="mt-2 text-verb-ghost text-[11px]">
              {'\u23F8'} Paused — press Space or click Resume
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
