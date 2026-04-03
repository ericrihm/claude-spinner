import { useState, useEffect } from 'react';
import { CATEGORIES, getCategoryForVerb } from '../data/verbCategories';
import { SPINNER_VERBS } from '../data/spinnerVerbs';
import CatchEmAll from './CatchEmAll';

function DonutChart({ seen }) {
  // Count seen verbs per category
  const categoryCounts = {};
  const allCats = [...CATEGORIES, { name: 'Miscellaneous', emoji: '\ud83c\udfb2' }];
  allCats.forEach(c => { categoryCounts[c.name] = 0; });

  for (const verb of seen) {
    const cat = getCategoryForVerb(verb);
    categoryCounts[cat.name] = (categoryCounts[cat.name] || 0) + 1;
  }

  const total = seen.size || 1;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const colors = ['#F59E0B', '#8B5CF6', '#EC4899', '#EF4444', '#10B981', '#6366F1', '#06B6D4', '#6B7280'];

  let accumulated = 0;
  const segments = allCats
    .map((cat, i) => {
      const count = categoryCounts[cat.name];
      if (count === 0) return null;
      const pct = count / total;
      const dashLength = pct * circumference;
      const gap = circumference - dashLength;
      const offset = -accumulated * circumference + circumference * 0.25;
      accumulated += pct;
      return (
        <circle
          key={cat.name}
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={colors[i % colors.length]}
          strokeWidth="12"
          strokeDasharray={`${dashLength} ${gap}`}
          strokeDashoffset={offset}
        />
      );
    })
    .filter(Boolean);

  return (
    <div>
      <svg viewBox="0 0 100 100" width="120" height="120" className="mx-auto">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#30363D" strokeWidth="12" />
        {segments}
      </svg>
      <div className="mt-2 grid grid-cols-2 gap-1">
        {allCats.map((cat, i) => {
          const count = categoryCounts[cat.name];
          if (count === 0) return null;
          return (
            <div key={cat.name} className="flex items-center gap-1 text-[10px] text-verb-ghost">
              <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: colors[i % colors.length] }} />
              {cat.emoji} {cat.name} ({count})
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function StatsPanel({
  totalSeen,
  uniqueCount,
  percentage,
  isComplete,
  streak,
  getMostSeen,
  getLeastSeen,
  seen,
  startTime,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border border-terminal-border rounded-lg bg-terminal-bg overflow-hidden">
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex justify-between items-center px-4 py-3 text-xs text-verb-ghost hover:text-white transition-colors"
      >
        <span className="font-bold">Stats</span>
        <span>{isOpen ? '\u25B2' : '\u25BC'}</span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4">
          {/* Catch Em All */}
          <CatchEmAll
            uniqueCount={uniqueCount}
            total={SPINNER_VERBS.length}
            percentage={percentage}
            isComplete={isComplete}
          />

          {/* Session Stats */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-verb-ghost">Total seen</span>
              <span className="text-white">{totalSeen}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-verb-ghost">Unique</span>
              <span className="text-white">{uniqueCount} / {SPINNER_VERBS.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-verb-ghost">Time watching</span>
              <span className="text-white">{formatTime(elapsed)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-verb-ghost">No-repeat streak</span>
              <span className="text-white">{streak}</span>
            </div>
            {getMostSeen() && (
              <div className="flex justify-between text-xs">
                <span className="text-verb-ghost">Most seen</span>
                <span className="text-verb-active">{getMostSeen()}</span>
              </div>
            )}
            {getLeastSeen() && (
              <div className="flex justify-between text-xs">
                <span className="text-verb-ghost">Rarest</span>
                <span className="text-accent">{getLeastSeen()}</span>
              </div>
            )}
          </div>

          {/* Donut Chart */}
          <div>
            <div className="text-xs text-verb-ghost mb-2 font-bold">Categories</div>
            <DonutChart seen={seen} />
          </div>
        </div>
      )}
    </div>
  );
}
