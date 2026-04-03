import { useState, useEffect, useRef } from "react";
import { BUDDIES, ANIM_SEQUENCE } from "../../data/buddies";

// Charge color gradient: green → yellow → amber → bright white
function getChargeColor(progress) {
  if (progress < 0.3) return "#4ADE80"; // green - light tap
  if (progress < 0.6) return "#FACC15"; // yellow - medium
  if (progress < 0.85) return "#F59E0B"; // amber - strong
  return "#FEFCE8"; // near-white - max power
}

function getChargeLabel(progress) {
  if (progress < 0.3) return "tap";
  if (progress < 0.6) return "mid";
  if (progress < 0.85) return "strong";
  return "MAX";
}

export default function PlayerCharacter({ y, isCharging, chargeProgress = 0, isGrounded, isHit, speedMultiplier = 1, buddyId = "capybara" }) {
  const [animTick, setAnimTick] = useState(0);
  const [bobOffset, setBobOffset] = useState(0);
  const bobRef = useRef(0);

  const buddy = BUDDIES.find((b) => b.id === buddyId) || BUDDIES[0];

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimTick((t) => (t + 1) % ANIM_SEQUENCE.length);
      bobRef.current += 1;
      setBobOffset(Math.sin(bobRef.current * 0.8) * 2);
    }, Math.max(80, 200 / speedMultiplier));
    return () => clearInterval(interval);
  }, [speedMultiplier]);

  const animState = ANIM_SEQUENCE[animTick];
  let frameIdx = 0;
  if (isHit) frameIdx = 2;
  else if (isCharging) frameIdx = 2;
  else if (animState === 1) frameIdx = 1;
  else if (animState === 2) frameIdx = 2;

  const frame = buddy.frames[frameIdx] || buddy.frames[0];
  const displayBob = isGrounded && !isCharging ? bobOffset : 0;

  const chargeColor = isCharging ? getChargeColor(chargeProgress) : null;
  const color = isHit ? "#EF4444" : isCharging ? chargeColor : "#4ADE80";

  return (
    <div
      className="absolute left-[12%] pointer-events-none z-20"
      style={{
        bottom: 32,
        transform: `translateY(${y + displayBob}px)`,
      }}
    >
      {/* ASCII buddy sprite */}
      <pre
        className="font-mono leading-none select-none"
        style={{
          fontSize: 10,
          lineHeight: "11px",
          color,
          textShadow: isCharging
            ? `0 0 ${4 + chargeProgress * 12}px ${chargeColor}, 0 0 ${8 + chargeProgress * 20}px ${chargeColor}44`
            : isHit
            ? "0 0 6px #EF4444"
            : `0 0 3px #4ADE8033`,
          transition: "text-shadow 0.05s",
          margin: 0,
        }}
      >
        {frame.join("\n")}
      </pre>

      {/* Dust particles when running */}
      {isGrounded && !isCharging && (
        <span
          className="absolute font-mono text-[8px]"
          style={{
            color: "#30363D",
            left: -6,
            bottom: 0,
            opacity: 0.5 + Math.sin(bobRef.current) * 0.3,
          }}
        >
          {animTick % 3 === 0 ? "\u00B7" : animTick % 3 === 1 ? "\u00B7\u00B7" : "\u00B7"}
        </span>
      )}

      {/* Charge power meter */}
      {isCharging && (
        <div
          className="absolute font-mono"
          style={{
            bottom: -16,
            left: 0,
            width: 60,
          }}
        >
          {/* Bar background */}
          <div
            className="rounded-full overflow-hidden"
            style={{
              height: 3,
              backgroundColor: "#30363D",
              marginBottom: 2,
            }}
          >
            {/* Fill */}
            <div
              className="h-full rounded-full"
              style={{
                width: `${chargeProgress * 100}%`,
                backgroundColor: chargeColor,
                boxShadow: `0 0 4px ${chargeColor}`,
                transition: "background-color 0.05s",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 7,
              color: chargeColor,
              textShadow: chargeProgress >= 0.85 ? `0 0 4px ${chargeColor}` : "none",
            }}
          >
            {getChargeLabel(chargeProgress)}
          </span>
        </div>
      )}
    </div>
  );
}
