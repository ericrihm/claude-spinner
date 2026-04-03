import { motion, AnimatePresence } from 'framer-motion';

export default function SpinnerTerminal({
  currentVerb,
  brailleChar,
  history,
  isPaused,
  crtEnabled,
  titleText,
  specialEffect,
  onVerbClick,
  onTitleClick,
}) {
  const getVerbColor = () => {
    if (specialEffect?.isClauding) return 'text-accent';
    return 'text-verb-active';
  };

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
      <div className="p-4 font-mono text-sm min-h-[280px] terminal-body">
        {/* Ghost History */}
        <div className="space-y-1 mb-4">
          {history.map((verb, i) => (
            <div
              key={`${verb}-${i}`}
              className="ghost-line text-verb-ghost"
              style={{
                opacity: Math.max(0.15, 1 - (i + 1) * 0.15),
                transform: `translateY(${i * -1}px)`,
              }}
            >
              <span className="text-verb-ghost/50">{'\u2714'}</span>{' '}
              <span
                className="cursor-pointer hover:underline"
                onClick={() => onVerbClick?.(verb)}
              >
                {verb}
              </span>
              ...
            </div>
          ))}
        </div>

        {/* Active Spinner Line */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentVerb}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className={`flex items-center gap-2 ${getVerbColor()}`}
          >
            <span className="w-4 text-center">{isPaused ? '\u23F8' : brailleChar}</span>
            <span
              className="cursor-pointer hover:underline"
              onClick={() => onVerbClick?.(currentVerb)}
            >
              {currentVerb}
            </span>
            {specialEffect?.isPropagating && <span className="ml-1">{'\ud83e\udeb8'}</span>}
            {specialEffect?.isGitifying && (
              <svg className="w-4 h-4 ml-1 inline" viewBox="0 0 16 16" fill="currentColor">
                <path d="M9.5 3.25a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.5 2.5 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25Z" />
              </svg>
            )}
            <span>...</span>
            <span className="animate-blink ml-1">{'\u2588'}</span>
          </motion.div>
        </AnimatePresence>

        {/* Pause indicator */}
        {isPaused && (
          <div className="mt-4 text-verb-ghost text-xs">
            {'\u23F8'} Paused — press Space or click Resume
          </div>
        )}
      </div>
    </div>
  );
}
