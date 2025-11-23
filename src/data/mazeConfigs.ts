// Maze configurations for 5 progressive levels with creative designs

export type MazeConfig = {
  level: number;
  name: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert" | "Master";
  maze: number[][];
  player1Start: { x: number; y: number };
  player2Start: { x: number; y: number };
  goal: { x: number; y: number };
  gates: Array<{ x: number; y: number; opened: boolean }>;
  gateCount: number;
  theme: string;
  icon: string;
};

// Level 1: Classic Symmetric (17x17) - Keep existing
export const level1Config: MazeConfig = {
  level: 1,
  name: "Gateway",
  description: "Master the basics in this balanced arena",
  difficulty: "Easy",
  theme: "classic",
  icon: "🌟",
  gateCount: 20,
  player1Start: { x: 1, y: 1 },
  player2Start: { x: 15, y: 15 },
  goal: { x: 8, y: 8 },
  maze: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,1,1,0,1,1,1,0,0,0,1,1,1,0,1,1,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  gates: [
    { x: 3, y: 1, opened: false }, { x: 7, y: 1, opened: false }, { x: 13, y: 1, opened: false },
    { x: 1, y: 3, opened: false }, { x: 1, y: 7, opened: false }, { x: 1, y: 13, opened: false },
    { x: 15, y: 3, opened: false }, { x: 15, y: 7, opened: false }, { x: 15, y: 13, opened: false },
    { x: 3, y: 15, opened: false }, { x: 7, y: 15, opened: false }, { x: 13, y: 15, opened: false },
    { x: 5, y: 5, opened: false }, { x: 11, y: 5, opened: false },
    { x: 5, y: 11, opened: false }, { x: 11, y: 11, opened: false },
    { x: 3, y: 8, opened: false }, { x: 8, y: 3, opened: false },
    { x: 13, y: 8, opened: false }, { x: 8, y: 13, opened: false }
  ]
};

// Level 2: Spiral Vortex (19x19) - Inward spiral design
export const level2Config: MazeConfig = {
  level: 2,
  name: "Vortex",
  description: "Navigate the spiraling pathways to the core",
  difficulty: "Medium",
  theme: "spiral",
  icon: "🌀",
  gateCount: 28,
  player1Start: { x: 1, y: 1 },
  player2Start: { x: 1, y: 1 }, // Both start from same corner for fair spiral race
  goal: { x: 9, y: 9 },
  maze: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,1,0,1,0,0,0,0,0,0,0,0,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,0,0,0,0,0,1,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,0,0,0,0,0,0,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  gates: [
    { x: 3, y: 1, opened: false }, { x: 7, y: 1, opened: false }, { x: 11, y: 1, opened: false }, { x: 15, y: 1, opened: false },
    { x: 1, y: 3, opened: false }, { x: 1, y: 7, opened: false }, { x: 1, y: 11, opened: false }, { x: 1, y: 15, opened: false },
    { x: 17, y: 3, opened: false }, { x: 17, y: 7, opened: false }, { x: 17, y: 11, opened: false }, { x: 17, y: 15, opened: false },
    { x: 3, y: 17, opened: false }, { x: 7, y: 17, opened: false }, { x: 11, y: 17, opened: false }, { x: 15, y: 17, opened: false },
    { x: 3, y: 3, opened: false }, { x: 15, y: 3, opened: false }, { x: 3, y: 15, opened: false }, { x: 15, y: 15, opened: false },
    { x: 5, y: 5, opened: false }, { x: 13, y: 5, opened: false }, { x: 5, y: 13, opened: false }, { x: 13, y: 13, opened: false },
    { x: 7, y: 7, opened: false }, { x: 11, y: 7, opened: false }, { x: 7, y: 11, opened: false }, { x: 11, y: 11, opened: false }
  ]
};

// Level 3: Diamond Fortress (21x21) - Diamond shaped paths
export const level3Config: MazeConfig = {
  level: 3,
  name: "Diamond",
  description: "Crystalline patterns challenge your path",
  difficulty: "Hard",
  theme: "diamond",
  icon: "💎",
  gateCount: 35,
  player1Start: { x: 1, y: 10 },
  player2Start: { x: 19, y: 10 },
  goal: { x: 10, y: 10 },
  maze: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,0,0,1,0,0,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,0,0,1,0,1,0,0,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,0,1,0,0,0,1,0,0,1,1,1,1,1,1],
    [1,1,1,1,1,0,0,1,0,0,1,0,0,1,0,0,1,1,1,1,1],
    [1,1,1,1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,1,1,1],
    [1,1,1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,1,1,1],
    [1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,1],
    [1,0,0,1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0,0,1],
    [1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,1],
    [1,1,1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,1,1,1],
    [1,1,1,1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,1,1,1],
    [1,1,1,1,1,0,0,1,0,0,1,0,0,1,0,0,1,1,1,1,1],
    [1,1,1,1,1,1,0,0,1,0,0,0,1,0,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,0,0,1,0,1,0,0,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,0,0,1,0,0,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  gates: [
    { x: 10, y: 1, opened: false }, { x: 9, y: 2, opened: false }, { x: 11, y: 2, opened: false },
    { x: 8, y: 3, opened: false }, { x: 12, y: 3, opened: false },
    { x: 7, y: 4, opened: false }, { x: 13, y: 4, opened: false },
    { x: 6, y: 5, opened: false }, { x: 10, y: 5, opened: false }, { x: 14, y: 5, opened: false },
    { x: 5, y: 6, opened: false }, { x: 15, y: 6, opened: false },
    { x: 4, y: 7, opened: false }, { x: 9, y: 7, opened: false }, { x: 16, y: 7, opened: false },
    { x: 3, y: 8, opened: false }, { x: 17, y: 8, opened: false },
    { x: 2, y: 9, opened: false }, { x: 10, y: 9, opened: false }, { x: 18, y: 9, opened: false },
    { x: 1, y: 10, opened: false }, { x: 7, y: 10, opened: false }, { x: 13, y: 10, opened: false }, { x: 19, y: 10, opened: false },
    { x: 2, y: 11, opened: false }, { x: 18, y: 11, opened: false },
    { x: 3, y: 12, opened: false }, { x: 10, y: 12, opened: false }, { x: 17, y: 12, opened: false },
    { x: 4, y: 13, opened: false }, { x: 16, y: 13, opened: false },
    { x: 5, y: 14, opened: false }, { x: 11, y: 14, opened: false }, { x: 15, y: 14, opened: false },
    { x: 10, y: 17, opened: false }, { x: 10, y: 19, opened: false }
  ]
};

// Level 4: Cross Paths (23x23) - Cross-shaped intersections
export const level4Config: MazeConfig = {
  level: 4,
  name: "Crossroads",
  description: "Multiple paths converge at critical junctions",
  difficulty: "Expert",
  theme: "cross",
  icon: "✨",
  gateCount: 42,
  player1Start: { x: 1, y: 1 },
  player2Start: { x: 21, y: 21 },
  goal: { x: 11, y: 11 },
  maze: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1],
    [1,0,1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,1],
    [1,0,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  gates: [
    { x: 1, y: 1, opened: false }, { x: 5, y: 1, opened: false }, { x: 9, y: 1, opened: false }, { x: 13, y: 1, opened: false }, { x: 17, y: 1, opened: false },
    { x: 1, y: 5, opened: false }, { x: 10, y: 5, opened: false }, { x: 21, y: 5, opened: false },
    { x: 3, y: 3, opened: false }, { x: 7, y: 3, opened: false }, { x: 15, y: 3, opened: false }, { x: 19, y: 3, opened: false },
    { x: 5, y: 7, opened: false }, { x: 11, y: 7, opened: false }, { x: 17, y: 7, opened: false },
    { x: 3, y: 9, opened: false }, { x: 10, y: 9, opened: false }, { x: 19, y: 9, opened: false },
    { x: 6, y: 10, opened: false }, { x: 10, y: 10, opened: false }, { x: 16, y: 10, opened: false },
    { x: 1, y: 11, opened: false }, { x: 5, y: 11, opened: false }, { x: 11, y: 11, opened: false }, { x: 17, y: 11, opened: false }, { x: 21, y: 11, opened: false },
    { x: 6, y: 12, opened: false }, { x: 12, y: 12, opened: false }, { x: 16, y: 12, opened: false },
    { x: 3, y: 13, opened: false }, { x: 10, y: 13, opened: false }, { x: 19, y: 13, opened: false },
    { x: 5, y: 15, opened: false }, { x: 11, y: 15, opened: false }, { x: 17, y: 15, opened: false },
    { x: 1, y: 17, opened: false }, { x: 10, y: 17, opened: false }, { x: 21, y: 17, opened: false },
    { x: 3, y: 19, opened: false }, { x: 7, y: 19, opened: false }, { x: 15, y: 19, opened: false }, { x: 19, y: 19, opened: false },
    { x: 5, y: 21, opened: false }, { x: 21, y: 21, opened: false }
  ]
};

// Level 5: Ultimate Labyrinth (25x25) - Complex multi-path maze
export const level5Config: MazeConfig = {
  level: 5,
  name: "Labyrinth",
  description: "The ultimate test of skill and strategy",
  difficulty: "Master",
  theme: "labyrinth",
  icon: "👑",
  gateCount: 50,
  player1Start: { x: 1, y: 1 },
  player2Start: { x: 23, y: 23 },
  goal: { x: 12, y: 12 },
  maze: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1,0,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,0,0,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,1,0,0,0,1],
    [1,1,1,0,1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1,0,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1,0,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  gates: [
    // Outer perimeter gates
    { x: 1, y: 1, opened: false }, { x: 4, y: 1, opened: false }, { x: 8, y: 1, opened: false }, { x: 12, y: 1, opened: false }, 
    { x: 16, y: 1, opened: false }, { x: 20, y: 1, opened: false }, { x: 23, y: 1, opened: false },
    { x: 1, y: 5, opened: false }, { x: 23, y: 5, opened: false },
    { x: 1, y: 9, opened: false }, { x: 23, y: 9, opened: false },
    { x: 1, y: 13, opened: false }, { x: 23, y: 13, opened: false },
    { x: 1, y: 17, opened: false }, { x: 23, y: 17, opened: false },
    { x: 1, y: 21, opened: false }, { x: 23, y: 21, opened: false },
    { x: 4, y: 23, opened: false }, { x: 8, y: 23, opened: false }, { x: 12, y: 23, opened: false }, 
    { x: 16, y: 23, opened: false }, { x: 20, y: 23, opened: false }, { x: 23, y: 23, opened: false },
    // Inner ring gates
    { x: 3, y: 3, opened: false }, { x: 12, y: 3, opened: false }, { x: 21, y: 3, opened: false },
    { x: 3, y: 6, opened: false }, { x: 10, y: 6, opened: false }, { x: 14, y: 6, opened: false }, { x: 21, y: 6, opened: false },
    { x: 6, y: 9, opened: false }, { x: 12, y: 9, opened: false }, { x: 18, y: 9, opened: false },
    { x: 3, y: 11, opened: false }, { x: 11, y: 11, opened: false }, { x: 13, y: 11, opened: false }, { x: 21, y: 11, opened: false },
    { x: 6, y: 12, opened: false }, { x: 18, y: 12, opened: false },
    { x: 3, y: 13, opened: false }, { x: 12, y: 13, opened: false }, { x: 21, y: 13, opened: false },
    { x: 6, y: 15, opened: false }, { x: 12, y: 15, opened: false }, { x: 18, y: 15, opened: false },
    { x: 3, y: 17, opened: false }, { x: 21, y: 17, opened: false },
    { x: 3, y: 21, opened: false }, { x: 12, y: 21, opened: false }, { x: 21, y: 21, opened: false }
  ]
};

export const allMazeConfigs = [
  level1Config,
  level2Config,
  level3Config,
  level4Config,
  level5Config
];
