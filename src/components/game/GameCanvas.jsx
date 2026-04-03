import { useState, useEffect, useRef, useCallback } from "react";

import { SPINNER_VERBS } from "../../data/spinnerVerbs";
import { getCategoryForVerb } from "../../data/verbCategories";
import { COMMENTARY } from "../../data/commentary";
import { PHASES } from "../../data/phases";
import { POWER_UPS } from "../../data/powerUps";
import { BUDDIES } from "../../data/buddies";

import { useGameLoop } from "../../hooks/useGameLoop";
import { useJumpPhysics } from "../../hooks/useJumpPhysics";
import { useScoreTracker } from "../../hooks/useScoreTracker";

import PlayerCharacter from "./PlayerCharacter";
import VerbBlock from "./VerbBlock";
import ParallaxBackground from "./ParallaxBackground";
import GameHUD from "./GameHUD";
import Commentary from "./Commentary";
import GameOverScreen from "./GameOverScreen";

const PLAYER_X_PERCENT = 0.12;
const PLAYER_WIDTH = 20; // tight hitbox — only the center of the sprite
const PLAYER_HEIGHT = 40;
const MAX_VERBS = 12;
const BASE_SPEED = 120;

// Obstacle height scales with word length
// Short (5-7): 15-21px → trivial quick tap
// Medium (8-10): 24-30px → short hold
// Long (11-13): 33-39px → moderate charge
// Very long (14+): 42px+ → strong charge
function getVerbHeight(verb) {
  return verb.length * 3;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CHAOS_VERBS = SPINNER_VERBS.filter(
  (v) => getCategoryForVerb(v).name === "Chaos"
);

export default function GameCanvas({ onBack }) {
  const containerRef = useRef(null);
  const audioRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [gameState, setGameState] = useState("ready"); // ready | playing | over
  const [verbs, setVerbs] = useState([]);
  const [currentPhase, setCurrentPhase] = useState(PHASES[0]);
  const [commentaryText, setCommentaryText] = useState("");
  const [isHit, setIsHit] = useState(false);
  const [gameOverStats, setGameOverStats] = useState(null);
  const [activePowerUp, setActivePowerUp] = useState(null);
  const [selectedBuddy, setSelectedBuddy] = useState("capybara");
  const [muted, setMuted] = useState(false);

  const verbsRef = useRef([]);
  const verbIdCounter = useRef(0);
  const lastSpawnRef = useRef(0);
  const lastCommentaryRef = useRef(0);
  const usedCommentaryRef = useRef(new Set());
  const verbQueueRef = useRef(shuffle(SPINNER_VERBS));
  const verbQueueIndexRef = useRef(0);
  const lastPowerUpRef = useRef(0);
  const powerUpTimerRef = useRef(null);
  const hitCooldownRef = useRef(0);
  const lastUsageMilestoneRef = useRef(0);

  const gameLoop = useGameLoop();
  const jump = useJumpPhysics();
  const score = useScoreTracker();

  // Initialize audio
  useEffect(() => {
    const audio = new Audio("/spatial_audio.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Mute toggle
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
  }, [muted]);

  // Measure container width
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const getNextVerb = useCallback(() => {
    if (verbQueueIndexRef.current >= verbQueueRef.current.length) {
      verbQueueRef.current = shuffle(SPINNER_VERBS);
      verbQueueIndexRef.current = 0;
    }
    return verbQueueRef.current[verbQueueIndexRef.current++];
  }, []);

  const pickCommentary = useCallback((pool) => {
    const lines = COMMENTARY[pool];
    if (!lines) return null;
    const available = lines.filter((l) => !usedCommentaryRef.current.has(l));
    if (available.length === 0) return null;
    const line = available[Math.floor(Math.random() * available.length)];
    usedCommentaryRef.current.add(line);
    return line;
  }, []);

  const triggerCommentary = useCallback(
    (pool, force = false) => {
      const now = gameLoop.elapsedRef.current;
      if (!force && now - lastCommentaryRef.current < 8) return;
      const line = pickCommentary(pool);
      if (line) {
        setCommentaryText(line);
        lastCommentaryRef.current = now;
      }
    },
    [pickCommentary, gameLoop.elapsedRef]
  );

  // Main game tick
  useEffect(() => {
    if (gameState !== "playing") return;

    const unsub = gameLoop.subscribe((delta, elapsed) => {
      jump.update(delta);

      // Phase management
      let phase = PHASES[0];
      for (let i = PHASES.length - 1; i >= 0; i--) {
        if (elapsed >= PHASES[i].startTime) {
          phase = PHASES[i];
          break;
        }
      }
      if (phase.name !== currentPhase.name) {
        setCurrentPhase(phase);
        score.updatePhase(phase.name);
        triggerCommentary(phase.commentaryPool, true);
      }

      const speed = BASE_SPEED * phase.speedMultiplier;
      const effectiveSpeed =
        activePowerUp?.effect === "slowdown" ? speed * 0.5 : speed;

      score.addTokens(effectiveSpeed * delta * 0.1);

      // Hit cooldown
      if (hitCooldownRef.current > 0) {
        hitCooldownRef.current -= delta;
        if (hitCooldownRef.current <= 0) setIsHit(false);
      }

      // Spawn verbs
      const timeSinceSpawn = elapsed - lastSpawnRef.current;
      const activeCount = verbsRef.current.filter(
        (v) => !v.consumed && !v.hit
      ).length;
      if (
        timeSinceSpawn * 1000 >= phase.spawnInterval &&
        activeCount < MAX_VERBS
      ) {
        lastSpawnRef.current = elapsed;

        const isHazard =
          activePowerUp?.effect === "allSafe"
            ? false
            : Math.random() < phase.hazardRate;
        const verb = isHazard
          ? CHAOS_VERBS[Math.floor(Math.random() * CHAOS_VERBS.length)]
          : getNextVerb();

        const isGolden = !isHazard && COMMENTARY.specialVerbs[verb];

        verbsRef.current = [
          ...verbsRef.current,
          {
            id: verbIdCounter.current++,
            verb,
            x: containerWidth + 20,
            type: isHazard ? "hazard" : isGolden ? "golden" : "collectible",
            height: getVerbHeight(verb),
            width: verb.length * 8 + 16, // ~8px per char + braille spinner
            consumed: false,
            hit: false,
          },
        ];
      }

      // Spawn power-ups
      const timeSincePowerUp = elapsed - lastPowerUpRef.current;
      if (timeSincePowerUp > 25 + Math.random() * 15 && !activePowerUp) {
        lastPowerUpRef.current = elapsed;
        const pu = POWER_UPS[Math.floor(Math.random() * POWER_UPS.length)];
        verbsRef.current = [
          ...verbsRef.current,
          {
            id: verbIdCounter.current++,
            verb: pu.name,
            icon: pu.icon,
            x: containerWidth + 20,
            type: "powerup",
            width: 24,
            height: 24,
            consumed: false,
            hit: false,
            powerUp: pu,
            floatY: -(60 + Math.random() * 40),
          },
        ];
      }

      // Update positions & collisions
      // Center the hitbox on the sprite (sprite is ~60px wide, hitbox is 20px)
      const playerX = containerWidth * PLAYER_X_PERCENT + 20;
      const playerY = jump.yRef.current;
      const playerFeetHeight = -playerY; // positive = above ground
      let newVerbs = [];

      for (const v of verbsRef.current) {
        const updatedV = { ...v, x: v.x - effectiveSpeed * delta };

        if (updatedV.x < -300) continue;

        if (v.consumed || v.hit) {
          newVerbs.push(updatedV);
          continue;
        }

        // Power-ups: floating, jump INTO
        if (v.type === "powerup" && v.powerUp) {
          const overlapX =
            updatedV.x < playerX + PLAYER_WIDTH &&
            updatedV.x + v.width > playerX;
          if (overlapX) {
            const puBottom = -(v.floatY || -80);
            const puTop = puBottom + v.height;
            if (
              playerFeetHeight < puTop &&
              playerFeetHeight + PLAYER_HEIGHT > puBottom
            ) {
              const pu = v.powerUp;
              setActivePowerUp(pu);
              setCommentaryText(pu.commentary);
              lastCommentaryRef.current = elapsed;
              if (pu.effect === "extraLife") score.addLife();
              if (pu.duration) {
                if (powerUpTimerRef.current)
                  clearTimeout(powerUpTimerRef.current);
                powerUpTimerRef.current = setTimeout(
                  () => setActivePowerUp(null),
                  pu.duration
                );
              } else {
                setTimeout(() => setActivePowerUp(null), 1500);
              }
              continue;
            }
          }
          newVerbs.push(updatedV);
          continue;
        }

        // Ground verbs: fully passed player → consumed (jumped over successfully)
        if (updatedV.x + v.width < playerX) {
          updatedV.consumed = true;
          score.collectVerb(v.verb);

          if (COMMENTARY.specialVerbs[v.verb]) {
            setCommentaryText(COMMENTARY.specialVerbs[v.verb]);
            lastCommentaryRef.current = elapsed;
          } else if (score.verbsCollected % 10 === 0) {
            triggerCommentary("verbConsumed");
          }

          const milestone = Math.floor(
            (score.uniqueVerbs.size / 187) * 4
          );
          if (milestone > lastUsageMilestoneRef.current) {
            lastUsageMilestoneRef.current = milestone;
            triggerCommentary("usageMilestone", true);
          }

          newVerbs.push(updatedV);
          continue;
        }

        // Collision: verb overlaps player X and player isn't high enough
        if (hitCooldownRef.current <= 0) {
          const overlapX =
            updatedV.x < playerX + PLAYER_WIDTH &&
            updatedV.x + v.width > playerX;

          if (overlapX && playerFeetHeight < v.height) {
            if (activePowerUp?.effect === "shield") {
              setActivePowerUp(null);
              updatedV.hit = true;
              newVerbs.push(updatedV);
              continue;
            }

            updatedV.hit = true;
            setIsHit(true);
            hitCooldownRef.current = 1.8;

            const gameOver = score.hitHazard();
            triggerCommentary("hazardHit", true);

            if (gameOver) {
              setGameOverStats(score.getGameOverStats());
              setGameState("over");
              gameLoop.stop();
              // Music keeps playing through game over screen
              return;
            }

            newVerbs.push(updatedV);
            continue;
          }
        }

        newVerbs.push(updatedV);
      }

      verbsRef.current = newVerbs;
      setVerbs([...newVerbs]);

      if (
        Math.floor(elapsed) % 30 === 0 &&
        Math.floor(elapsed) > 0 &&
        elapsed - lastCommentaryRef.current > 8
      ) {
        triggerCommentary("survivalStreak");
      }
    });

    return unsub;
  }, [
    gameState,
    currentPhase.name,
    activePowerUp,
    containerWidth,
    gameLoop,
    jump,
    score,
    getNextVerb,
    triggerCommentary,
  ]);

  // Start game
  const startGame = useCallback(() => {
    score.reset();
    gameLoop.reset();
    verbsRef.current = [];
    verbIdCounter.current = 0;
    lastSpawnRef.current = 0;
    lastCommentaryRef.current = 0;
    lastPowerUpRef.current = 0;
    lastUsageMilestoneRef.current = 0;
    usedCommentaryRef.current = new Set();
    verbQueueRef.current = shuffle(SPINNER_VERBS);
    verbQueueIndexRef.current = 0;
    hitCooldownRef.current = 0;
    setVerbs([]);
    setCurrentPhase(PHASES[0]);
    setGameOverStats(null);
    setActivePowerUp(null);
    setIsHit(false);
    setGameState("playing");
    gameLoop.start();
    triggerCommentary("gameStart", true);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [gameLoop, score, triggerCommentary]);

  // Pointer handlers — don't start game if clicking a button inside ready screen
  const handlePointerDown = useCallback(
    (e) => {
      if (gameState === "ready") {
        // Only start if clicking the background, not a button
        if (e.target.closest("button")) return;
        e.preventDefault();
        startGame();
        return;
      }
      e.preventDefault();
      if (gameState === "playing") jump.startCharge();
    },
    [gameState, jump, startGame]
  );

  const handlePointerUp = useCallback(
    (e) => {
      e.preventDefault();
      if (gameState === "playing") jump.releaseJump();
    },
    [gameState, jump]
  );

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.code === "Space" ||
        e.code === "ArrowUp" ||
        e.code === "KeyW"
      ) {
        e.preventDefault();
        if (e.repeat) return;
        if (gameState === "ready") {
          startGame();
          return;
        }
        if (gameState === "playing") jump.startCharge();
      }
      if (e.code === "Escape") {
        e.preventDefault();
        if (gameState === "playing") {
          gameLoop.stop();
          // Music keeps playing through game over screen
          setGameOverStats(score.getGameOverStats());
          setGameState("over");
        } else {
          // Only stop music when fully exiting back to spinner
          if (audioRef.current) audioRef.current.pause();
          onBack();
        }
      }
      if (e.code === "KeyM") {
        setMuted((m) => !m);
      }
    };
    const handleKeyUp = (e) => {
      if (
        e.code === "Space" ||
        e.code === "ArrowUp" ||
        e.code === "KeyW"
      ) {
        e.preventDefault();
        if (gameState === "playing") jump.releaseJump();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, jump, startGame, gameLoop, score, onBack]);

  const phaseEffects = currentPhase.visualEffects || [];
  const amberTint = phaseEffects.includes("amberTint") && gameState === "playing";
  const screenFlicker = phaseEffects.includes("screenFlicker") && gameState === "playing";

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: "1px solid #30363D", backgroundColor: "#0D1117" }}
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-2 px-4 py-2"
          style={{ borderBottom: "1px solid #30363D" }}
        >
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span
            className="ml-2 font-mono text-xs"
            style={{ color: "#6B7280" }}
          >
            Claude Code — Verb Surf
            {activePowerUp && (
              <span style={{ color: "#D97706" }}>
                {" "}
                [{activePowerUp.icon} {activePowerUp.name}]
              </span>
            )}
          </span>
          {/* Mute toggle + phase */}
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setMuted((m) => !m)}
              className="font-mono text-[10px] cursor-pointer hover:opacity-80"
              style={{ color: "#6B728066" }}
              title={muted ? "Unmute (M)" : "Mute (M)"}
            >
              {muted ? "\u{1F507}" : "\u{1F50A}"}
            </button>
            <span
              className="font-mono text-[10px]"
              style={{ color: "#6B728066" }}
            >
              {currentPhase.name}
            </span>
          </div>
        </div>

        {/* HUD */}
        {gameState !== "ready" && (
          <GameHUD
            tokens={score.tokens}
            combo={score.combo}
            lives={score.lives}
            verbsCollected={score.verbsCollected}
            uniqueVerbs={score.uniqueVerbs.size}
            isNewHighScore={score.isNewHighScore}
          />
        )}

        {/* Game area */}
        <div
          ref={containerRef}
          className={`relative overflow-hidden select-none ${
            screenFlicker ? "animate-flicker" : ""
          }`}
          style={{
            height: 300,
            cursor: "pointer",
            touchAction: "none",
            backgroundColor: amberTint ? "#0D1117ee" : "#0D1117",
            boxShadow: amberTint
              ? "inset 0 0 60px rgba(217, 119, 6, 0.05)"
              : "none",
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <ParallaxBackground
            elapsed={gameLoop.elapsed}
            speedMultiplier={currentPhase.speedMultiplier}
            gapChance={currentPhase.gapChance}
            containerWidth={containerWidth}
          />

          <Commentary text={commentaryText} />

          {/* Ready / character select screen */}
          {gameState === "ready" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
              <div
                className="font-mono text-lg mb-3"
                style={{ color: "#4ADE80" }}
              >
                VERB SURF
              </div>
              <div
                className="font-mono text-xs mb-1"
                style={{ color: "#6B7280" }}
              >
                Your billing cycle resets soon. Use it or lose it.
              </div>
              <div
                className="font-mono text-xs mb-3"
                style={{ color: "#6B7280" }}
              >
                Jump over verbs to consume them. Longer words = higher jump needed.
              </div>

              {/* Buddy selector */}
              <div className="flex gap-3 mb-3">
                {BUDDIES.map((b) => (
                  <button
                    key={b.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBuddy(b.id);
                    }}
                    className="px-2 py-1 font-mono text-xs cursor-pointer transition-all"
                    style={{
                      color:
                        selectedBuddy === b.id ? "#4ADE80" : "#6B7280",
                      border: `1px solid ${
                        selectedBuddy === b.id ? "#4ADE80" : "#30363D"
                      }`,
                      backgroundColor:
                        selectedBuddy === b.id
                          ? "#4ADE8011"
                          : "transparent",
                    }}
                    title={b.name}
                  >
                    {b.icon}
                  </button>
                ))}
              </div>

              <div
                className="font-mono text-[10px] mb-3"
                style={{ color: "#6B728066" }}
              >
                Space/Click = jump &middot; Hold = charge &middot; Esc =
                quit &middot; M = mute
              </div>
              <div
                className="font-mono text-xs animate-pulse"
                style={{ color: "#4ADE80" }}
              >
                [ PRESS SPACE OR CLICK TO START ]
              </div>
            </div>
          )}

          {/* Player */}
          {gameState !== "ready" && (
            <PlayerCharacter
              y={jump.y}
              isCharging={jump.isCharging}
              chargeProgress={jump.chargeProgress}
              isGrounded={jump.isGrounded}
              isHit={isHit}
              speedMultiplier={currentPhase.speedMultiplier}
              buddyId={selectedBuddy}
            />
          )}

          {/* Verbs */}
          {verbs.map((v) => (
            <VerbBlock
              key={v.id}
              verb={v.verb}
              x={v.x}
              type={v.type}
              icon={v.icon}
              consumed={v.consumed}
              hit={v.hit}
              height={v.height}
            />
          ))}

          {/* Game over */}
          {gameState === "over" && gameOverStats && (
            <GameOverScreen
              stats={gameOverStats}
              elapsed={gameLoop.elapsed}
              onPlayAgain={startGame}
              onBack={() => {
                if (audioRef.current) audioRef.current.pause();
                onBack();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
