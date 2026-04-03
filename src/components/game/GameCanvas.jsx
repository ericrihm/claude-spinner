import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence } from "framer-motion";

import { SPINNER_VERBS } from "../../data/spinnerVerbs";
import { getCategoryForVerb } from "../../data/verbCategories";
import { COMMENTARY } from "../../data/commentary";
import { PHASES } from "../../data/phases";
import { POWER_UPS } from "../../data/powerUps";

import { useGameLoop } from "../../hooks/useGameLoop";
import { useJumpPhysics } from "../../hooks/useJumpPhysics";
import { useScoreTracker } from "../../hooks/useScoreTracker";

import PlayerCharacter from "./PlayerCharacter";
import VerbBlock from "./VerbBlock";
import ParallaxBackground from "./ParallaxBackground";
import GameHUD from "./GameHUD";
import Commentary from "./Commentary";
import GameOverScreen from "./GameOverScreen";

const PLAYER_X_PERCENT = 0.15;
const PLAYER_WIDTH = 20;
const PLAYER_HEIGHT = 24;
const VERB_HEIGHT = 20;
const MAX_VERBS = 12;
const BASE_SPEED = 180; // px/s

// Shuffle array (Fisher-Yates)
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Get chaos verbs for hazards
const CHAOS_VERBS = SPINNER_VERBS.filter(
  (v) => getCategoryForVerb(v).name === "Chaos"
);

export default function GameCanvas({ onBack }) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [gameState, setGameState] = useState("ready"); // ready | playing | over
  const [verbs, setVerbs] = useState([]);
  const [currentPhase, setCurrentPhase] = useState(PHASES[0]);
  const [commentaryText, setCommentaryText] = useState("");
  const [isHit, setIsHit] = useState(false);
  const [gameOverStats, setGameOverStats] = useState(null);
  const [activePowerUp, setActivePowerUp] = useState(null);

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

  const gameLoop = useGameLoop();
  const jump = useJumpPhysics();
  const score = useScoreTracker();

  // Measure container width
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Get next verb from shuffled queue
  const getNextVerb = useCallback(() => {
    if (verbQueueIndexRef.current >= verbQueueRef.current.length) {
      verbQueueRef.current = shuffle(SPINNER_VERBS);
      verbQueueIndexRef.current = 0;
    }
    return verbQueueRef.current[verbQueueIndexRef.current++];
  }, []);

  // Pick a commentary line without repeats
  const pickCommentary = useCallback((pool) => {
    const lines = COMMENTARY[pool];
    if (!lines) return null;
    const available = lines.filter((l) => !usedCommentaryRef.current.has(l));
    if (available.length === 0) return null;
    const line = available[Math.floor(Math.random() * available.length)];
    usedCommentaryRef.current.add(line);
    return line;
  }, []);

  // Trigger commentary with cooldown
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
      // Update jump physics
      jump.update(delta);

      // Determine current phase
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
      const effectiveSpeed = activePowerUp?.effect === "slowdown" ? speed * 0.5 : speed;

      // Add distance-based tokens
      score.addTokens(effectiveSpeed * delta * 0.1);

      // Reduce hit cooldown
      if (hitCooldownRef.current > 0) {
        hitCooldownRef.current -= delta;
        if (hitCooldownRef.current <= 0) {
          setIsHit(false);
        }
      }

      // Spawn verbs
      const timeSinceSpawn = elapsed - lastSpawnRef.current;
      if (timeSinceSpawn * 1000 >= phase.spawnInterval && verbsRef.current.length < MAX_VERBS) {
        lastSpawnRef.current = elapsed;

        const isHazard = activePowerUp?.effect === "allSafe" ? false : Math.random() < phase.hazardRate;
        const verb = isHazard
          ? CHAOS_VERBS[Math.floor(Math.random() * CHAOS_VERBS.length)]
          : getNextVerb();

        // Determine if this is a golden verb (special commentary verb)
        const isGolden = !isHazard && COMMENTARY.specialVerbs[verb];

        const newVerb = {
          id: verbIdCounter.current++,
          verb,
          x: containerWidth + 20,
          y: -(Math.random() * 120 + 40), // negative y = above ground
          type: isHazard ? "hazard" : isGolden ? "golden" : "collectible",
          width: verb.length * 8.5,
          collected: false,
        };

        verbsRef.current = [...verbsRef.current, newVerb];
      }

      // Spawn power-ups
      const timeSincePowerUp = elapsed - lastPowerUpRef.current;
      if (timeSincePowerUp > 25 + Math.random() * 15 && !activePowerUp) {
        lastPowerUpRef.current = elapsed;
        const pu = POWER_UPS[Math.floor(Math.random() * POWER_UPS.length)];
        const newVerb = {
          id: verbIdCounter.current++,
          verb: pu.name,
          icon: pu.icon,
          x: containerWidth + 20,
          y: -(80 + Math.random() * 60),
          type: "powerup",
          width: 24,
          collected: false,
          powerUp: pu,
        };
        verbsRef.current = [...verbsRef.current, newVerb];
      }

      // Update verb positions and check collisions
      const playerX = containerWidth * PLAYER_X_PERCENT;
      const playerY = jump.yRef.current;
      let newVerbs = [];
      let collected = false;

      for (const v of verbsRef.current) {
        const updatedV = { ...v, x: v.x - effectiveSpeed * delta };

        // Off-screen removal
        if (updatedV.x < -200) continue;

        // Collision check (AABB)
        if (!v.collected && hitCooldownRef.current <= 0) {
          const overlapX = updatedV.x < playerX + PLAYER_WIDTH && updatedV.x + v.width > playerX;
          const overlapY = playerY < v.y + VERB_HEIGHT && playerY + PLAYER_HEIGHT > v.y;

          if (overlapX && overlapY) {
            if (v.type === "powerup" && v.powerUp) {
              // Activate power-up
              const pu = v.powerUp;
              setActivePowerUp(pu);
              setCommentaryText(pu.commentary);
              lastCommentaryRef.current = elapsed;

              if (pu.effect === "extraLife") {
                score.addLife();
              }

              if (pu.duration) {
                if (powerUpTimerRef.current) clearTimeout(powerUpTimerRef.current);
                powerUpTimerRef.current = setTimeout(() => setActivePowerUp(null), pu.duration);
              } else {
                // Instant effect, clear after brief display
                setTimeout(() => setActivePowerUp(null), 1500);
              }

              updatedV.collected = true;
              continue; // Remove from render
            } else if (v.type === "hazard") {
              if (activePowerUp?.effect === "shield") {
                setActivePowerUp(null);
                updatedV.collected = true;
                continue;
              }
              const gameOver = score.hitHazard();
              setIsHit(true);
              hitCooldownRef.current = 1.0; // 1 second invincibility
              triggerCommentary("hazardHit", true);
              if (gameOver) {
                const stats = score.getGameOverStats();
                setGameOverStats(stats);
                setGameState("over");
                gameLoop.stop();
                return;
              }
              updatedV.collected = true;
              continue;
            } else {
              // Collectible or golden
              const points = score.collectVerb(v.verb);
              collected = true;

              // Check for special commentary
              if (COMMENTARY.specialVerbs[v.verb]) {
                setCommentaryText(COMMENTARY.specialVerbs[v.verb]);
                lastCommentaryRef.current = elapsed;
              } else if (score.verbsCollected % 10 === 0) {
                triggerCommentary("verbCollected");
              }

              updatedV.collected = true;
              continue; // Remove collected verb
            }
          }
        }

        newVerbs.push(updatedV);
      }

      verbsRef.current = newVerbs;
      setVerbs([...newVerbs]);

      // Survival commentary every 30s
      if (Math.floor(elapsed) % 30 === 0 && Math.floor(elapsed) > 0 && elapsed - lastCommentaryRef.current > 8) {
        triggerCommentary("survivalStreak");
      }
    });

    return unsub;
  }, [gameState, currentPhase.name, activePowerUp, containerWidth, gameLoop, jump, score, getNextVerb, triggerCommentary]);

  // Start game
  const startGame = useCallback(() => {
    score.reset();
    gameLoop.reset();
    verbsRef.current = [];
    verbIdCounter.current = 0;
    lastSpawnRef.current = 0;
    lastCommentaryRef.current = 0;
    lastPowerUpRef.current = 0;
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
  }, [gameLoop, score, triggerCommentary]);

  // Input handlers
  const handlePointerDown = useCallback(
    (e) => {
      e.preventDefault();
      if (gameState === "ready") {
        startGame();
        return;
      }
      if (gameState === "playing") {
        jump.startCharge();
      }
    },
    [gameState, jump, startGame]
  );

  const handlePointerUp = useCallback(
    (e) => {
      e.preventDefault();
      if (gameState === "playing") {
        jump.releaseJump();
      }
    },
    [gameState, jump]
  );

  // Visual effects based on phase
  const phaseEffects = currentPhase.visualEffects || [];
  const amberTint = phaseEffects.includes("amberTint");
  const screenFlicker = phaseEffects.includes("screenFlicker");

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Terminal chrome */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: "1px solid #30363D", backgroundColor: "#0D1117" }}
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-2 px-4 py-2"
          style={{ borderBottom: "1px solid #30363D" }}
        >
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="ml-2 font-mono text-xs" style={{ color: "#6B7280" }}>
            Claude Code — Verb Surf
            {activePowerUp && (
              <span style={{ color: "#D97706" }}> [{activePowerUp.icon} {activePowerUp.name}]</span>
            )}
          </span>
          <span className="ml-auto font-mono text-[10px]" style={{ color: "#6B728066" }}>
            {currentPhase.name}
          </span>
        </div>

        {/* HUD */}
        {gameState !== "ready" && (
          <GameHUD
            tokens={score.tokens}
            combo={score.combo}
            lives={score.lives}
            verbsCollected={score.verbsCollected}
            isNewHighScore={score.isNewHighScore}
          />
        )}

        {/* Game area */}
        <div
          ref={containerRef}
          className={`relative overflow-hidden select-none ${screenFlicker ? "animate-flicker" : ""}`}
          style={{
            height: "300px",
            cursor: "pointer",
            touchAction: "none",
            backgroundColor: amberTint ? "#0D1117ee" : "#0D1117",
            boxShadow: amberTint ? "inset 0 0 60px rgba(217, 119, 6, 0.05)" : "none",
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          {/* Parallax background */}
          <ParallaxBackground
            elapsed={gameLoop.elapsed}
            speedMultiplier={currentPhase.speedMultiplier}
            gapChance={currentPhase.gapChance}
            containerWidth={containerWidth}
          />

          {/* Commentary */}
          <Commentary text={commentaryText} />

          {/* Ready screen */}
          {gameState === "ready" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
              <div className="font-mono text-lg mb-2" style={{ color: "#4ADE80" }}>
                VERB SURF
              </div>
              <div className="font-mono text-xs mb-4" style={{ color: "#6B7280" }}>
                Click to start — Click to jump — Hold to charge
              </div>
              <div
                className="font-mono text-xs animate-pulse"
                style={{ color: "#4ADE80" }}
              >
                [ CLICK TO START ]
              </div>
            </div>
          )}

          {/* Player */}
          {gameState !== "ready" && (
            <PlayerCharacter
              y={jump.y}
              isCharging={jump.isCharging}
              isGrounded={jump.isGrounded}
              isHit={isHit}
              speedMultiplier={currentPhase.speedMultiplier}
            />
          )}

          {/* Verbs */}
          <AnimatePresence>
            {verbs.map((v) => (
              <VerbBlock
                key={v.id}
                verb={v.verb}
                x={v.x}
                y={v.y}
                type={v.type}
                icon={v.icon}
              />
            ))}
          </AnimatePresence>

          {/* Game over overlay */}
          {gameState === "over" && gameOverStats && (
            <GameOverScreen
              stats={gameOverStats}
              elapsed={gameLoop.elapsed}
              onPlayAgain={startGame}
              onBack={onBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}
