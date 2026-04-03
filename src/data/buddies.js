// Claude Code buddy sprites from the v2.1.88 leak
// Each species has: id, name, icon (1-line fallback), and multiline ASCII frames
// Frame 0 = Rest, Frame 1 = Fidget, Frame 2 = Special

export const BUDDIES = [
  {
    id: "capybara",
    name: "Capybara",
    icon: "(\u00B7oo\u00B7)",
    frames: [
      // Rest
      [
        "           ",
        "  .---.    ",
        " / \u00B7  \u00B7 \\  ",
        " (  oo  )  ",
        ' (")_(")_/ ',
      ],
      // Fidget
      [
        "           ",
        "  .---.    ",
        " / -  - \\  ",
        " (  oo  )  ",
        ' (")_(")_/ ',
      ],
      // Special
      [
        "           ",
        "  .---.    ",
        " / >  < \\  ",
        " (  ==  )  ",
        ' (")_(")_/ ',
      ],
    ],
  },
  {
    id: "cat",
    name: "Cat",
    icon: "=\u00B7\u03C9\u00B7=",
    frames: [
      [
        "           ",
        "  /-/\\     ",
        " ( \u00B7 \u00B7 )   ",
        " ( \u03C9 )    ",
        ' (")_(")   ',
      ],
      [
        "           ",
        "  /-/\\     ",
        " ( - - )   ",
        " ( \u03C9 )    ",
        ' (")_(")   ',
      ],
      [
        "           ",
        "  /-/\\     ",
        " ( > < )   ",
        " ( \u03C9 )    ",
        ' (")_(")   ',
      ],
    ],
  },
  {
    id: "duck",
    name: "Duck",
    icon: ">\u00B7)",
    frames: [
      [
        "           ",
        "    __     ",
        "   ( \u00B7)>   ",
        "   . )___  ",
        "   \u00B4--`<_  ",
      ],
      [
        "           ",
        "    __     ",
        "   ( \u00B7)>   ",
        "   . )___  ",
        "  ~\u00B4--`<_  ",
      ],
      [
        "           ",
        "    __     ",
        "   ( \u00B7)>   ",
        "   . )___  ",
        "   \u00B4--`<__ ",
      ],
    ],
  },
  {
    id: "robot",
    name: "Robot",
    icon: "[\u00B7\u00B7]",
    frames: [
      [
        "           ",
        "  +---+    ",
        "  [ \u00B7 \u00B7 ]  ",
        "  | === |  ",
        "  +---+    ",
      ],
      [
        "           ",
        "  +---+    ",
        "  [ - - ]  ",
        "  | === |  ",
        "  +---+    ",
      ],
      [
        "           ",
        "  +---+    ",
        "  [ > < ]  ",
        "  | ooo |  ",
        "  +---+    ",
      ],
    ],
  },
  {
    id: "chonk",
    name: "Chonk",
    icon: "(\u00B7..\u00B7)",
    frames: [
      [
        "           ",
        "  /\\  /\\   ",
        " ( \u00B7  \u00B7 )  ",
        " ( ..  )   ",
        " `------\u00B4  ",
      ],
      [
        "           ",
        "  /\\  /\\   ",
        " ( -  - )  ",
        " ( ..  )   ",
        " `------\u00B4  ",
      ],
      [
        "           ",
        "  /\\  /\\   ",
        " ( >  < )  ",
        " (  ==  )  ",
        " `------\u00B4  ",
      ],
    ],
  },
  {
    id: "ghost",
    name: "Ghost",
    icon: "/\u00B7\u00B7\\",
    frames: [
      [
        "  .----.   ",
        " / \u00B7  \u00B7 \\  ",
        " |      |  ",
        " |      |  ",
        " ~`~``~`~  ",
      ],
      [
        "  .----.   ",
        " / -  - \\  ",
        " |      |  ",
        " |      |  ",
        " ~``~`~`~  ",
      ],
      [
        "  .----.   ",
        " / >  < \\  ",
        " |      |  ",
        " |  oo  |  ",
        " ~`~``~`~  ",
      ],
    ],
  },
];

// Animation state sequence (500ms per tick)
export const ANIM_SEQUENCE = [0, 0, 0, 0, 1, 0, 0, 0, -1, 0, 0, 2, 0, 0, 0];
// -1 = blink (swap eyes to - ), 0 = rest, 1 = fidget, 2 = special
