const SPEEDS = [
  { key: 'chill', label: 'Chill' },
  { key: 'normal', label: 'Normal' },
  { key: 'hyperspeed', label: 'Hyperspeed' },
];

export default function SpinnerControls({
  speed,
  onSpeedChange,
  isPaused,
  onTogglePause,
  crtEnabled,
  onToggleCrt,
  isTurbo,
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 mt-4">
      {/* Speed Selector */}
      <div className="flex rounded-lg border border-terminal-border overflow-hidden">
        {SPEEDS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onSpeedChange(key)}
            className={`px-3 py-1.5 text-xs transition-colors ${
              speed === key && !isTurbo
                ? 'bg-verb-active/20 text-verb-active'
                : 'bg-terminal-bg text-verb-ghost hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
        {isTurbo && (
          <div className="px-3 py-1.5 text-xs bg-accent/20 text-accent">
            TURBO
          </div>
        )}
      </div>

      {/* Pause/Resume */}
      <button
        onClick={onTogglePause}
        className="px-3 py-1.5 text-xs rounded-lg border border-terminal-border bg-terminal-bg text-verb-ghost hover:text-white transition-colors"
      >
        {isPaused ? '\u25B6 Resume' : '\u23F8 Pause'}
      </button>

      {/* CRT Toggle */}
      <label className="flex items-center gap-2 text-xs text-verb-ghost cursor-pointer">
        <div
          className={`w-8 h-4 rounded-full transition-colors relative ${
            crtEnabled ? 'bg-verb-active/30' : 'bg-terminal-border'
          }`}
          onClick={onToggleCrt}
        >
          <div
            className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
              crtEnabled ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </div>
        CRT
      </label>
    </div>
  );
}
