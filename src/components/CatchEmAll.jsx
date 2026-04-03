import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export default function CatchEmAll({ uniqueCount, total, percentage, isComplete }) {
  const hasCelebrated = useRef(false);

  useEffect(() => {
    if (isComplete && !hasCelebrated.current) {
      hasCelebrated.current = true;
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#4ADE80', '#D97706', '#60A5FA', '#F472B6'],
      });
    }
  }, [isComplete]);

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-3">
      {/* Progress Ring */}
      <svg width="68" height="68" className="shrink-0">
        <circle
          cx="34"
          cy="34"
          r={radius}
          fill="none"
          stroke="#30363D"
          strokeWidth="4"
        />
        <circle
          cx="34"
          cy="34"
          r={radius}
          fill="none"
          stroke={isComplete ? '#D97706' : '#4ADE80'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 34 34)"
          className="transition-all duration-500"
        />
        <text
          x="34"
          y="34"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-white text-[10px] font-mono"
        >
          {percentage}%
        </text>
      </svg>

      <div>
        <div className="text-xs text-verb-ghost">
          Verb {uniqueCount} of {total}
        </div>
        {isComplete && (
          <div className="text-xs text-accent font-bold mt-1">
            You caught 'em all!
          </div>
        )}
      </div>
    </div>
  );
}
