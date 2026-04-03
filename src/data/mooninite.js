// Ignignokt from Aqua Teen Hunger Force — pixel art sprite
// Grid: 30 cols x 23 rows.
// '.' = transparent, 'G' = green body (#2AFE28), 'B' = navy blue detail (#273B8D)

export const IGNIGNOKT = {
  name: "Ignignokt",
  cols: 30,
  colors: {
    "G": "#2AFE28",
    "B": "#273B8D",
  },
  frames: [
    // Single frame — arms are baked into the grid
    [
      ".........GGG.......GGGG.......",
      ".........GGGG......GGGG.......",
      ".........GGGG......GGGG.......",
      "......GGGGGGG.GGGGGGGGG.......",
      "......GGGGGGGGGGGGGGGGG.......",
      "......GGGGGBGGGGBGGGGGG.......",
      "......GGGGBGGGGGGBGGGGG.......",
      ".......GGBGGGGGGGGBGGGG.......",
      ".......GBGBBGGGBBGGBGGG.......",
      ".......GGGGGGGGGGGGGGGG.......",
      ".......GGGGGGGGGGGGGGGG.......",
      ".......GGGGGGGGGGGGGGGG.......",
      ".......GGGGGGGGGGGGGGGGGBB....",
      "...BBGGGGGGBBBBBBBBGGGGG.BB...",
      "..BB.GGGGGBBBBBBBBGGGGGG...B..",
      ".B...GGGGGGGGGGGGGGGGGGG...B..",
      ".B...GGGGGGGGGGGGGGGGGGG...B..",
      ".B...GGGGGGGGGGGGGGGGGGG...B..",
      ".....GGGGGGGGGGGGGGGGGGG......",
      "...........BB....BB...........",
      "...........BB....BB...........",
      ".......BBBBBB....BBBBBB.......",
      ".......BBBBBB....BBBBBB.......",
    ],
  ],
};

// Animation sequence (500ms per tick) — single frame, no animation
export const MOON_ANIM = [0];
