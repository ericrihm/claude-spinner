// Severance spatial_audio.mp3 is ~120 BPM → 500ms per beat
// Spawn intervals are quantized to beat multiples so verbs arrive on rhythm
// 1 beat = 500ms, 2 beats = 1000ms, 3 beats = 1500ms, 4 beats = 2000ms

export const PHASES = [
  {
    name: "Normal Session",
    startTime: 0,
    speedMultiplier: 1,
    hazardRate: 0.08,       // very few hazards early
    spawnInterval: 2000,    // every 4 beats — relaxed intro
    gapChance: 0,
    visualEffects: [],
    commentaryPool: "gameStart",
  },
  {
    name: "Extended Thinking",
    startTime: 45,
    speedMultiplier: 1.2,
    hazardRate: 0.15,
    spawnInterval: 1500,    // every 3 beats
    gapChance: 0,
    visualEffects: ["amberTint"],
    commentaryPool: "speedMilestone",
  },
  {
    name: "Rate Limited",
    startTime: 90,
    speedMultiplier: 1.4,
    hazardRate: 0.22,
    spawnInterval: 1000,    // every 2 beats
    gapChance: 0.1,
    visualEffects: ["amberTint", "amberPulse"],
    commentaryPool: "speedMilestone",
  },
  {
    name: "Context Overflow",
    startTime: 135,
    speedMultiplier: 1.7,
    hazardRate: 0.3,
    spawnInterval: 1000,    // still 2 beats but faster scroll
    gapChance: 0.15,
    visualEffects: ["amberTint", "amberPulse", "screenFlicker"],
    commentaryPool: "survivalStreak",
  },
  {
    name: "Hallucinating",
    startTime: 180,
    speedMultiplier: 2.0,
    hazardRate: 0.4,
    spawnInterval: 500,     // every beat — chaos
    gapChance: 0.2,
    visualEffects: ["amberTint", "amberPulse", "screenFlicker", "colorLies", "glitchText"],
    commentaryPool: "survivalStreak",
  },
];
