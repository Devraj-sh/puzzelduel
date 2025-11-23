export type Player = {
  id: string; // socket ID
  name: string;
  position: { x: number; y: number };
  isFrozen: boolean;
  score: number;
  dbId?: string; // database player ID for Supabase
};

export type Room = {
  id: string;
  players: {
    p1?: Player;
    p2?: Player;
  };
  currentTurn: 1 | 2;
  gates: Array<{ x: number; y: number; opened: boolean }>;
  gameState: 'waiting' | 'playing' | 'finished';
  pendingRiddles?: Map<string, { answer: string; gateIndex: number; nextPos: { x: number; y: number } }>;
  currentMaze?: number[][];
  goalPosition?: { x: number; y: number };
  levelStartTime?: number; // track when level started
  currentLevel?: number; // current level being played
};

export type GameEvents = {
  // Room management
  'create:room': (playerName: string) => void;
  'join:room': (roomId: string, playerName: string) => void;
  'room:created': (room: Room) => void;
  'room:joined': (room: Room) => void;
  'room:error': (error: string) => void;
  
  // Game events
  'player:move': (direction: { dx: number; dy: number }) => void;
  'game:updated': (room: Room) => void;
  'riddle:prompt': (data: { question: string; options: string[]; gateIndex: number }) => void;
  'riddle:answer': (answer: string) => void;
  'game:over': (winnerId: string) => void;
  'level:start': (levelData: { level: number; maze: number[][]; goal: { x: number; y: number }; gates: Array<{ x: number; y: number }>; player1Start: { x: number; y: number }; player2Start: { x: number; y: number } }) => void;
  'level:started': (levelData: { level: number; maze: number[][]; goal: { x: number; y: number }; gates: Array<{ x: number; y: number }>; player1Start: { x: number; y: number }; player2Start: { x: number; y: number } }) => void;
};