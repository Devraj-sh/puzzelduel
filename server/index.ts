// Load environment variables FIRST
import './config.js';

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import type { Room, Player, GameEvents } from './types';
import { serverSupabaseService } from './supabaseService';

// Interesting puzzles for multiplayer
const puzzles = [
  {
    question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    options: ["Echo", "Shadow", "Cloud", "Spirit"],
    answer: "Echo",
    type: "riddle",
    aiApproach: "Processes metaphorical language by analyzing attribute combinations: 'speaks' + 'no mouth', 'hears' + 'no ears'. Searches sound phenomena database. Matches 'comes alive with wind' to acoustic properties.",
    humanApproach: "Thinks about the riddle poetically. 'Something that repeats sound... comes with wind... it's an echo!' Uses intuition and real-world experience."
  },
  {
    question: "What has 13 hearts but no other organs?",
    options: ["A deck of cards", "An octopus", "A hospital", "A garden"],
    answer: "A deck of cards",
    type: "riddle",
    aiApproach: "Semantic search for objects containing exactly 13 'hearts'. Cross-references playing card knowledge base. Identifies heart suit cards in standard deck (A-K = 13).",
    humanApproach: "Connects 'hearts' to card games. Counts: 'Ace through King is 13 cards in the heart suit!' Personal experience with card games helps."
  },
  {
    question: "The more you take, the more you leave behind. What am I?",
    options: ["Footsteps", "Memories", "Time", "Shadows"],
    answer: "Footsteps",
    type: "riddle",
    aiApproach: "Analyzes inverse relationship: 'take' (forward motion) produces more 'leave behind' (trail). Searches physical trace patterns. Matches footprint accumulation behavior.",
    humanApproach: "Visualizes walking. 'As I walk and take steps, I leave footprints behind me!' Relies on common daily experience."
  },
  {
    question: "If you have me, you want to share me. If you share me, you no longer have me. What am I?",
    options: ["A secret", "Money", "Food", "Love"],
    answer: "A secret",
    type: "logic",
    aiApproach: "Logical constraint analysis: possession → desire to transfer, transfer → loss of possession. Filters database for information-based entities. Secret matches unique property of becoming known upon sharing.",
    humanApproach: "Thinks about things that disappear when shared. 'A secret! Once you tell someone, it's not a secret anymore.' Social understanding."
  },
  {
    question: "Find the pattern: 2, 6, 12, 20, 30, ?",
    options: ["40", "42", "45", "48"],
    answer: "42",
    type: "pattern",
    aiApproach: "Calculates differences: 4, 6, 8, 10. Detects arithmetic progression in deltas (+2 each time). Predicts next difference: 12. Computes 30+12=42.",
    humanApproach: "Notices gaps growing: 'Goes up by 4, then 6, then 8, then 10... next should be 12, so 30+12=42!' Pattern recognition."
  },
  {
    question: "What comes once in a minute, twice in a moment, but never in a thousand years?",
    options: ["The letter M", "Time", "Death", "Silence"],
    answer: "The letter M",
    type: "riddle",
    aiApproach: "String analysis mode: counts character occurrences in words. 'minute' has 1 'm', 'moment' has 2 'm's, 'thousand years' has 0 'm's. Direct pattern match.",
    humanApproach: "Realizes it's a word puzzle! Looks at the letters: 'M appears once in minute, twice in moment, not in thousand years.' Wordplay thinking."
  },
  {
    question: "I am not alive, but I grow; I don't have lungs, but I need air; I don't have a mouth, but water kills me. What am I?",
    options: ["Fire", "Plant", "Crystal", "Cloud"],
    answer: "Fire",
    type: "riddle",
    aiApproach: "Contradiction resolution algorithm: 'not alive' excludes biological entities. Requires oxygen but lacks respiratory system. Water as fatal agent. Matches combustion properties in chemistry database.",
    humanApproach: "Goes through clues: 'Grows and spreads... needs air to burn... water puts it out. It's fire!' Uses knowledge of how fire works."
  },
  {
    question: "If 5 machines make 5 widgets in 5 minutes, how long would it take 100 machines to make 100 widgets?",
    options: ["5 minutes", "20 minutes", "100 minutes", "500 minutes"],
    answer: "5 minutes",
    type: "math",
    aiApproach: "Rate calculation: 5 machines / 5 widgets / 5 min = 1 widget per machine per 5 min. Parallel processing: 100 machines simultaneously produce 100 widgets in same 5 minutes. Linear scaling.",
    humanApproach: "Realizes it's a trick! 'Each machine makes 1 widget in 5 minutes. If you have 100 machines working at once, still just 5 minutes!' Logical reasoning."
  },
  {
    question: "What runs around the whole yard without moving?",
    options: ["A fence", "A dog", "The wind", "Grass"],
    answer: "A fence",
    type: "riddle",
    aiApproach: "Semantic parsing: 'runs around' (encircles) vs physical motion. Searches for stationary perimeter objects. Fence matches: surrounds yard property without locomotion.",
    humanApproach: "Pictures a yard. 'What goes all the way around but stays still? A fence!' Visualizes the boundary."
  },
  {
    question: "Continue the sequence: 1, 1, 2, 3, 5, 8, 13, ?",
    options: ["18", "19", "21", "23"],
    answer: "21",
    type: "pattern",
    aiApproach: "Pattern recognition identifies Fibonacci sequence: F(n) = F(n-1) + F(n-2). Computes next term: 8 + 13 = 21. Validates against mathematical sequence database.",
    humanApproach: "Sees each number is the sum of the previous two: '5+8=13, so 8+13=21!' Famous pattern from math class."
  },
  {
    question: "A farmer has 17 sheep. All but 9 die. How many are left?",
    options: ["8", "9", "17", "0"],
    answer: "9",
    type: "logic",
    aiApproach: "Language parsing challenge: 'all but 9' = exception clause. Interprets as '9 survived'. Answer: 9. Natural language understanding model required.",
    humanApproach: "Reads carefully: 'All BUT 9 die means 9 survived!' Catches the tricky wording through careful reading."
  },
  {
    question: "What can travel around the world while staying in a corner?",
    options: ["A stamp", "A map", "Light", "Sound"],
    answer: "A stamp",
    type: "riddle",
    aiApproach: "Constraint satisfaction: object in corner + global travel. Queries postal system knowledge. Postage stamp: affixed to envelope corner, travels with mail worldwide.",
    humanApproach: "Thinks about mail: 'A stamp sits in the corner of an envelope and travels everywhere!' Everyday knowledge."
  },
  {
    question: "If you drop me, I'm sure to crack, but smile at me and I'll smile back. What am I?",
    options: ["A mirror", "Glass", "An egg", "Ice"],
    answer: "A mirror",
    type: "riddle",
    aiApproach: "Property matching: fragile (cracks when dropped) + reflective (returns smile). Filters for reflective surfaces with brittleness attribute. Mirror has both properties.",
    humanApproach: "Thinks about reflection: 'Something that breaks and reflects... a mirror!' Combines the two clues together."
  },
  {
    question: "Solve: 8 ÷ 2(2+2) = ?",
    options: ["1", "16", "8", "4"],
    answer: "16",
    type: "math",
    aiApproach: "Applies order of operations (PEMDAS/BODMAS): Parentheses first (2+2=4), then left-to-right division and multiplication: 8÷2=4, then 4×4=16.",
    humanApproach: "Remembers PEMDAS: 'Parentheses first gives 8÷2(4). Left to right: 8÷2=4, times 4 is 16.' Math rules from school."
  },
  {
    question: "What has cities but no houses, forests but no trees, and water but no fish?",
    options: ["A map", "A painting", "A dream", "A book"],
    answer: "A map",
    type: "riddle",
    aiApproach: "Representation analysis: seeks objects depicting reality without physical instantiation. Map database: shows geographical features symbolically without actual elements.",
    humanApproach: "Realizes it's showing things without having them: 'A map shows all these things but they're just drawings!' Abstract thinking."
  }
];

// Maze definition (0 = path, 1 = wall) - must match client
const maze: number[][] = [
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
];

// Helper function to check if position is a wall
const isWall = (x: number, y: number): boolean => {
  if (y < 0 || y >= maze.length || x < 0 || x >= maze[0].length) return true;
  return maze[y][x] === 1;
};

const app = express();

// Enable CORS for the frontend dev server(s)
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:8081',
    'http://localhost:8082'
  ],
  credentials: true
}));
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:8081',
      'http://localhost:8082'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// In-memory store for rooms
const rooms = new Map<string, Room>();

// Helper to generate room ID
const generateRoomId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Create a new room
  socket.on('create:room', async (playerName: string) => {
    const roomId = generateRoomId();
    
    // Create or get player in database
    const dbPlayer = await serverSupabaseService.getOrCreatePlayer(playerName);
    
    const player: Player = {
      id: socket.id,
      name: playerName,
      position: { x: 1, y: 1 }, // Player 1 starting position
      isFrozen: false,
      score: 0,
      dbId: dbPlayer?.id
    };

    const room: Room = {
      id: roomId,
      players: { p1: player },
      currentTurn: 1,
      gates: [
        // Gates placed only on valid paths (not walls)
        // Upper area gates
        { x: 3, y: 1, opened: false },
        { x: 7, y: 1, opened: false },
        { x: 13, y: 1, opened: false },
        // Left side gates
        { x: 1, y: 3, opened: false },
        { x: 1, y: 7, opened: false },
        { x: 1, y: 13, opened: false },
        // Right side gates
        { x: 15, y: 3, opened: false },
        { x: 15, y: 7, opened: false },
        { x: 15, y: 13, opened: false },
        // Bottom area gates
        { x: 3, y: 15, opened: false },
        { x: 9, y: 15, opened: false },
        { x: 13, y: 15, opened: false },
        // Inner strategic gates
        { x: 3, y: 5, opened: false },
        { x: 5, y: 3, opened: false },
        { x: 11, y: 3, opened: false },
        { x: 13, y: 5, opened: false },
        { x: 3, y: 11, opened: false },
        { x: 13, y: 11, opened: false },
        // Central gates guarding the goal
        { x: 7, y: 8, opened: false },
        { x: 9, y: 8, opened: false }
      ],
      gameState: 'waiting',
      pendingRiddles: new Map()
    };

    rooms.set(roomId, room);
    socket.join(roomId);
    
    // Create match in database
    if (dbPlayer?.id) {
      await serverSupabaseService.createMatch(roomId, dbPlayer.id);
    }
    
    socket.emit('room:created', room);
  });

  // Join an existing room
  socket.on('join:room', async (roomId: string, playerName: string) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('room:error', 'Room not found');
      return;
    }

    if (room.players.p2) {
      socket.emit('room:error', 'Room is full');
      return;
    }

    // Create or get player in database
    const dbPlayer = await serverSupabaseService.getOrCreatePlayer(playerName);

    const player: Player = {
      id: socket.id,
      name: playerName,
      position: { x: 15, y: 15 }, // Player 2 starting position
      isFrozen: false,
      score: 0,
      dbId: dbPlayer?.id
    };

    room.players.p2 = player;
    room.gameState = 'playing';
    rooms.set(roomId, room);
    
    // Update match in database
    if (dbPlayer?.id) {
      await serverSupabaseService.joinMatch(roomId, dbPlayer.id);
    }
    
    socket.join(roomId);
    io.to(roomId).emit('room:joined', room);
  });

  // Leave room
  socket.on('leave:room', () => {
    // Find the room this player is in
    for (const [roomId, room] of rooms.entries()) {
      if (room.players.p1?.id === socket.id || room.players.p2?.id === socket.id) {
        socket.leave(roomId);
        
        if (room.players.p1?.id === socket.id) {
          room.players.p1 = undefined;
        } else {
          room.players.p2 = undefined;
        }
        
        if (!room.players.p1 && !room.players.p2) {
          rooms.delete(roomId);
        }
        break;
      }
    }
  });

  // Handle player movement
  socket.on('player:move', async (direction: { dx: number; dy: number }) => {
    // Find the room this player is in
    const room = Array.from(rooms.values()).find(room => 
      room.players.p1?.id === socket.id || room.players.p2?.id === socket.id
    );
    
    if (!room) return;

    const isPlayer1 = room.players.p1?.id === socket.id;
    const currentPlayer = isPlayer1 ? room.players.p1 : room.players.p2;
    
    // Allow both players to move at any time (removed turn check)
    if (!currentPlayer) return;
    if (currentPlayer.isFrozen) return;

    const nextPos = {
      x: currentPlayer.position.x + direction.dx,
      y: currentPlayer.position.y + direction.dy
    };

    // Check if moving into a wall - use room's current maze if available
    const currentMaze = room.currentMaze || maze;
    const isWallAtPos = (x: number, y: number): boolean => {
      if (y < 0 || y >= currentMaze.length || x < 0 || x >= currentMaze[0].length) return true;
      return currentMaze[y][x] === 1;
    };
    
    if (isWallAtPos(nextPos.x, nextPos.y)) {
      return; // Cannot move into walls
    }

    // Check if moving into a gate
    const gate = room.gates.find(g => g.x === nextPos.x && g.y === nextPos.y);
    if (gate && !gate.opened) {
      // Send riddle to player
      const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
      const gateIndex = room.gates.indexOf(gate);
      
      // Store the riddle and answer for this player
      if (!room.pendingRiddles) room.pendingRiddles = new Map();
      room.pendingRiddles.set(socket.id, { 
        answer: puzzle.answer, 
        gateIndex: gateIndex,
        nextPos: nextPos
      });
      
      socket.emit('riddle:prompt', {
        question: puzzle.question,
        options: puzzle.options,
        gateIndex: gateIndex,
        type: puzzle.type,
        aiApproach: puzzle.aiApproach,
        humanApproach: puzzle.humanApproach
      });
      return;
    }

    // Update position
    currentPlayer.position = nextPos;
    
    // Check win condition - use room's goal position if available
    const goalPos = room.goalPosition || { x: 8, y: 8 };
    if (nextPos.x === goalPos.x && nextPos.y === goalPos.y) {
      currentPlayer.score++;
      room.gameState = 'finished';
      const winnerId = isPlayer1 ? 'p1' : 'p2';
      
      // Save level result to Supabase
      const winnerDbId = currentPlayer.dbId;
      if (winnerDbId && room.levelStartTime) {
        const timeSeconds = Math.floor((Date.now() - room.levelStartTime) / 1000);
        const gatesOpened = room.gates.filter(g => g.opened).length;
        const currentLevel = room.currentLevel || 1;
        
        await serverSupabaseService.saveLevelResult(
          room.id,
          currentLevel,
          winnerDbId,
          timeSeconds,
          gatesOpened
        );
        
        // Update match scores
        const p1Score = room.players.p1?.score || 0;
        const p2Score = room.players.p2?.score || 0;
        await serverSupabaseService.updateMatchScores(room.id, p1Score, p2Score);
      }
      
      io.to(room.id).emit('game:over', winnerId);
    }

    // Broadcast updated game state
    io.to(room.id).emit('game:updated', room);
  });

  // Handle riddle answers
  socket.on('riddle:answer', async (answer: string) => {
    const room = Array.from(rooms.values()).find(room => 
      room.players.p1?.id === socket.id || room.players.p2?.id === socket.id
    );
    
    if (!room) return;

    const isPlayer1 = room.players.p1?.id === socket.id;
    const currentPlayer = isPlayer1 ? room.players.p1 : room.players.p2;
    
    if (!currentPlayer) return;

    // Get the stored riddle info for this player
    const riddleInfo = room.pendingRiddles?.get(socket.id);
    if (!riddleInfo) return;

    // Validate answer against the stored correct answer
    const isCorrect = answer.trim().toLowerCase() === riddleInfo.answer.trim().toLowerCase();

    if (isCorrect) {
      // Open the specific gate
      if (riddleInfo.gateIndex >= 0 && riddleInfo.gateIndex < room.gates.length) {
        room.gates[riddleInfo.gateIndex].opened = true;
      }
      
      // Move the player to the gate position
      currentPlayer.position = riddleInfo.nextPos;
      
      // Check if they reached the goal - use room's goal position if available
      const goalPos = room.goalPosition || { x: 8, y: 8 };
      if (riddleInfo.nextPos.x === goalPos.x && riddleInfo.nextPos.y === goalPos.y) {
        currentPlayer.score++;
        room.gameState = 'finished';
        const winnerId = isPlayer1 ? 'p1' : 'p2';
        
        // Save level result to Supabase
        const winnerDbId = currentPlayer.dbId;
        if (winnerDbId && room.levelStartTime) {
          const timeSeconds = Math.floor((Date.now() - room.levelStartTime) / 1000);
          const gatesOpened = room.gates.filter(g => g.opened).length;
          const currentLevel = room.currentLevel || 1;
          
          await serverSupabaseService.saveLevelResult(
            room.id,
            currentLevel,
            winnerDbId,
            timeSeconds,
            gatesOpened
          );
          
          // Update match scores
          const p1Score = room.players.p1?.score || 0;
          const p2Score = room.players.p2?.score || 0;
          await serverSupabaseService.updateMatchScores(room.id, p1Score, p2Score);
        }
        
        io.to(room.id).emit('game:over', winnerId);
      }
    } else {
      // Freeze player for 3 seconds on wrong answer
      currentPlayer.isFrozen = true;
      setTimeout(() => {
        currentPlayer.isFrozen = false;
        io.to(room.id).emit('game:updated', room);
      }, 3000);
    }
    
    // Clear the pending riddle
    room.pendingRiddles?.delete(socket.id);

    io.to(room.id).emit('game:updated', room);
  });

  // Handle level start - update room's maze configuration
  socket.on('level:start', async (levelData: { level: number; maze: number[][]; goal: { x: number; y: number }; gates: Array<{ x: number; y: number }>; player1Start: { x: number; y: number }; player2Start: { x: number; y: number } }) => {
    const room = Array.from(rooms.values()).find(room => 
      room.players.p1?.id === socket.id || room.players.p2?.id === socket.id
    );
    
    if (!room) return;

    // Only allow player 1 to start levels
    if (room.players.p1?.id !== socket.id) return;

    console.log('Server: level:start received for level', levelData.level);

    // Update room with new level configuration
    room.currentMaze = levelData.maze;
    room.goalPosition = levelData.goal;
    room.gates = levelData.gates.map(g => ({ ...g, opened: false }));
    room.gameState = 'playing';
    room.levelStartTime = Date.now(); // Track when level started
    room.currentLevel = levelData.level; // Track current level
    
    // Reset player positions for the new level
    if (room.players.p1) {
      room.players.p1.position = levelData.player1Start;
    }
    if (room.players.p2) {
      room.players.p2.position = levelData.player2Start;
    }

    // Update match level in Supabase
    await serverSupabaseService.updateMatchLevel(room.id, levelData.level);

    // Broadcast level start to both clients
    io.to(room.id).emit('level:started', levelData);
    
    // Broadcast updated room to all players
    io.to(room.id).emit('game:updated', room);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    // Find and clean up any room this player was in
    for (const [roomId, room] of rooms.entries()) {
      if (room.players.p1?.id === socket.id || room.players.p2?.id === socket.id) {
        if (room.gameState === 'waiting') {
          rooms.delete(roomId);
        } else {
          // Mark game as finished if in progress
          room.gameState = 'finished';
          io.to(roomId).emit('game:over', 'disconnect');
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});