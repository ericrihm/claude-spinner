// Severance spatial_audio.mp3 is ~120 BPM → 500ms per beat
// Spawn intervals are quantized to beat multiples so verbs arrive on rhythm
// 1 beat = 500ms, 2 beats = 1000ms, 3 beats = 1500ms, 4 beats = 2000ms

export const PHASES = [
  {
    name: "Normal Session",
    startTime: 0,
    speedMultiplier: 1,
    hazardRate: 0.15,       // more hazards from the start for fun
    spawnInterval: 2000,    // every 4 beats — relaxed intro
    gapChance: 0,
    visualEffects: [],
    commentaryPool: "gameStart",
  },
  {
    name: "Extended Thinking",
    startTime: 60,          // longer warm-up (was 45)
    speedMultiplier: 1.15,  // gentler speed bump (was 1.2)
    hazardRate: 0.22,       // noticeable hazards (was 0.15)
    spawnInterval: 1500,    // every 3 beats
    gapChance: 0,
    visualEffects: ["amberTint"],
    commentaryPool: "speedMilestone",
  },
  {
    name: "Rate Limited",
    startTime: 120,         // more breathing room (was 90)
    speedMultiplier: 1.3,   // was 1.4
    hazardRate: 0.28,       // was 0.22
    spawnInterval: 1200,    // slightly more relaxed (was 1000)
    gapChance: 0.1,
    visualEffects: ["amberTint", "amberPulse"],
    commentaryPool: "speedMilestone",
  },
  {
    name: "Context Overflow",
    startTime: 180,         // was 135
    speedMultiplier: 1.5,   // was 1.7
    hazardRate: 0.35,       // was 0.3
    spawnInterval: 1000,    // 2 beats
    gapChance: 0.12,        // was 0.15
    visualEffects: ["amberTint", "amberPulse", "screenFlicker"],
    commentaryPool: "survivalStreak",
  },
  {
    name: "Hallucinating",
    startTime: 240,         // was 180
    speedMultiplier: 1.8,   // was 2.0
    hazardRate: 0.42,       // was 0.4
    spawnInterval: 750,     // was 500 — less overwhelming
    gapChance: 0.18,        // was 0.2
    visualEffects: ["amberTint", "amberPulse", "screenFlicker", "colorLies", "glitchText"],
    commentaryPool: "survivalStreak",
  },
];
