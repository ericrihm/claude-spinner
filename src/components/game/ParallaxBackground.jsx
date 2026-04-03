import { useRef, useEffect, useState } from "react";

const CODE_LINES = [
  "const result = await claude.think()",
  "// TODO: add more verbs",
  "if (tokens > limit) panic()",
  "while(true) { think_harder(); }",
  "export default function Brain() {}",
  "await fetch('/api/consciousness')",
  "const vibes = useVibes()",
  "git commit -m 'sentience update'",
  "try { exist() } catch { ponder() }",
  "npm install meaning-of-life",
];

const GROUND_CHAR = "─";
const GROUND_WIDTH = 200; // number of characters

export default function ParallaxBackground({ elapsed, speedMultiplier = 1, gapChance = 0, containerWidth = 800 }) {
  const codeOffsetRef = useRef(0);
  const groundOffsetRef = useRef(0);
  const [codeOffset, setCodeOffset] = useState(0);
  const [groundOffset, setGroundOffset] = useState(0);
  const [gaps, setGaps] = useState(new Set());

  // Generate ground gaps once per phase change
  useEffect(() => {
    const newGaps = new Set();
    if (gapChance > 0) {
      for (let i = 0; i < GROUND_WIDTH; i++) {
        if (Math.random() < gapChance * 0.3) {
          newGaps.add(i);
          // Make gaps 2-3 chars wide
          if (i + 1 < GROUND_WIDTH) newGaps.add(i + 1);
        }
      }
    }
    setGaps(newGaps);
  }, [gapChance]);

  // Update offsets via RAF - driven by parent elapsed time
  useEffect(() => {
    const baseSpeed = 60; // px/s
    const codeSpeed = baseSpeed * 0.3 * speedMultiplier;
    const groundSpeed = baseSpeed * speedMultiplier;

    codeOffsetRef.current = (elapsed * codeSpeed) % (containerWidth * 2);
    groundOffsetRef.current = (elapsed * groundSpeed) % (containerWidth);

    setCodeOffset(codeOffsetRef.current);
    setGroundOffset(groundOffsetRef.current);
  }, [elapsed, speedMultiplier, containerWidth]);

  const groundString = Array.from({ length: GROUND_WIDTH }, (_, i) =>
    gaps.has(i % GROUND_WIDTH) ? " " : GROUND_CHAR
  ).join("");

  return (
    <>
      {/* Code layer - back parallax */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none opacity-30"
        style={{ willChange: "transform" }}
      >
        <div
          className="whitespace-nowrap font-mono text-xs"
          style={{
            color: "#1a1f2b",
            transform: `translateX(${-codeOffset}px)`,
            willChange: "transform",
            lineHeight: "2.5",
            paddingTop: "20px",
          }}
        >
          {CODE_LINES.concat(CODE_LINES).map((line, i) => (
            <div key={i} className="inline-block" style={{ minWidth: "400px" }}>
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Ground layer */}
      <div
        className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none"
        style={{ height: "32px" }}
      >
        <div
          className="whitespace-nowrap font-mono text-sm"
          style={{
            color: "#30363D",
            transform: `translateX(${-groundOffset}px)`,
            willChange: "transform",
            lineHeight: "32px",
          }}
        >
          {groundString}{groundString}
        </div>
      </div>
    </>
  );
}
