import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, Home, Swords, Brain, Copy, Cpu, User, Lock, Unlock, Star, Award, Target, Zap, Crown, Medal, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { puzzles } from "@/data/puzzles";
import { allMazeConfigs, type MazeConfig } from "@/data/mazeConfigs";
import { GameSocket } from "@/lib/gameSocket";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import type { Room } from "../../server/types";

type GameState = "setup" | "room-select" | "level-select" | "playing" | "level-complete" | "scoreboard";

type LevelStats = {
  level: number;
  completed: boolean;
  timeSeconds: number;
  gatesOpened: number;
  winner: string;
};

type RiddleState = {
  isOpen: boolean;
  puzzle: typeof puzzles[0] | null;
  gateIndex: number;
  nextMove: { x: number; y: number } | null;
};

export const MultiplayerArena = () => {
  const [gameState, setGameState] = useState<GameState>("room-select");
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [currentRound, setCurrentRound] = useState(0);
  const [myPlayerNumber, setMyPlayerNumber] = useState<1 | 2 | null>(null);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [roomId, setRoomId] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [socket, setSocket] = useState<GameSocket>();
  // Level system state
  const [currentLevel, setCurrentLevel] = useState(1);
  const [unlockedLevels, setUnlockedLevels] = useState(1);
  const [levelStats, setLevelStats] = useState<LevelStats[]>([]);
  const [levelStartTime, setLevelStartTime] = useState<number>(0);
  const [currentMazeConfig, setCurrentMazeConfig] = useState<MazeConfig>(allMazeConfigs[0]);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const [preGameCountdown, setPreGameCountdown] = useState<number | null>(null);
  // Maze specific state
  const [player1Pos, setPlayer1Pos] = useState({ x: 1, y: 1 });
  const [player2Pos, setPlayer2Pos] = useState({ x: 15, y: 15 });
  const [gates, setGates] = useState<Array<{ x: number; y: number; opened: boolean }>>([]);
  const [frozen, setFrozen] = useState<{ p1: boolean; p2: boolean }>({ p1: false, p2: false });
  const [riddle, setRiddle] = useState<RiddleState>({
    isOpen: false,
    puzzle: null,
    gateIndex: -1,
    nextMove: null
  });
  const { toast } = useToast();

  // Use current maze configuration
  const maze = currentMazeConfig.maze;
  const goal = currentMazeConfig.goal;

  const startGame = () => {
    if (!player1Name.trim() || !player2Name.trim()) {
      toast({
        title: "Enter Names",
        description: "Both players must enter their names!",
        variant: "destructive",
      });
      return;
    }
    // Initialize players using current level config
    const config = allMazeConfigs[currentLevel - 1];
    setCurrentMazeConfig(config);
    setPlayer1Pos(config.player1Start);
    setPlayer2Pos(config.player2Start);
    setGates(JSON.parse(JSON.stringify(config.gates))); // Deep clone
    setFrozen({ p1: false, p2: false });
    setLevelStartTime(Date.now());
    setGameState("playing");
  };

  const resetGame = () => {
    setGameState("room-select");
    setPlayer1Name("");
    setPlayer2Name("");
    setCurrentRound(0);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setGates([]);
    setRoomId("");
    setJoinRoomId("");
    setCurrentLevel(1);
    setUnlockedLevels(1);
    setLevelStats([]);
    setCurrentMazeConfig(allMazeConfigs[0]);
  };

  const handleLevelComplete = (winnerName: string) => {
    const timeSeconds = Math.floor((Date.now() - levelStartTime) / 1000);
    const gatesOpened = gates.filter(g => g.opened).length;
    
    const stats: LevelStats = {
      level: currentLevel,
      completed: true,
      timeSeconds,
      gatesOpened,
      winner: winnerName
    };
    
    setLevelStats(prev => {
      // Avoid duplicate stats for the same level
      const filtered = prev.filter(s => s.level !== currentLevel);
      return [...filtered, stats];
    });
    
    // Always unlock next level when completing current level
    if (currentLevel < allMazeConfigs.length) {
      setUnlockedLevels(prev => Math.max(prev, currentLevel + 1));
    }
    
    // Check if all levels complete
    if (currentLevel >= allMazeConfigs.length) {
      setGameState('scoreboard');
    } else {
      setGameState('level-complete');
      // Start instant auto-advance (0 seconds = immediate)
      setAutoAdvanceCountdown(0);
    }
  };

  const proceedToNextLevel = () => {
    console.log('proceedToNextLevel called:', { currentLevel, unlockedLevels, myPlayerNumber });
    const nextLevel = currentLevel + 1;
    if (nextLevel <= allMazeConfigs.length) {
      selectLevel(nextLevel);
    } else {
      console.log('No more levels available');
    }
  };

  const selectLevel = (level: number) => {
    console.log('selectLevel called:', { level, unlockedLevels, myPlayerNumber, socket: !!socket });
    
    if (level > unlockedLevels) {
      console.log('Level locked - aborting');
      toast({
        title: "Level Locked",
        description: `Complete level ${unlockedLevels} first`,
        variant: "destructive"
      });
      return;
    }
    
    // In multiplayer, only player 1 should trigger level start
    if (socket && myPlayerNumber !== 1) {
      console.log('Not player 1 - aborting');
      toast({
        title: "Waiting for Host",
        description: "Player 1 will start the level",
        variant: "default"
      });
      return;
    }
    
    console.log('Getting config for level', level);
    const config = allMazeConfigs[level - 1];
    
    if (!config) {
      console.error('No config found for level', level);
      return;
    }
    
    console.log('Config found:', config.name);
    
    // Send level configuration to server first
    if (socket) {
      console.log('Sending level:start to server...');
      socket.startLevel({
        level: level,
        maze: config.maze,
        goal: config.goal,
        gates: config.gates,
        player1Start: config.player1Start,
        player2Start: config.player2Start
      });
      console.log('level:start sent to server');
    } else {
      console.log('Solo mode - initializing directly');
      // Solo mode - set directly
      initializeLevel(level, config);
    }
  };
  
  const initializeLevel = (level: number, config: MazeConfig) => {
    console.log('initializeLevel:', level);
    setCurrentLevel(level);
    setCurrentMazeConfig(config);
    setPlayer1Pos(config.player1Start);
    setPlayer2Pos(config.player2Start);
    setGates(JSON.parse(JSON.stringify(config.gates)));
    setFrozen({ p1: false, p2: false });
    setLevelStartTime(Date.now());
    setPreGameCountdown(3);
    setGameState("playing");
    
    toast({
      title: `Level ${level}`,
      description: `${config.name} - ${config.difficulty}`,
    });
  };

  useEffect(() => {
    const gameSocket = GameSocket.getInstance();
    setSocket(gameSocket);

    gameSocket.onRoomCreated((room) => {
      console.log('onRoomCreated: Setting myPlayerNumber = 1', room);
      setRoomId(room.id);
      setMyPlayerNumber(1); // Creator is player 1
      setGameState("level-select");
      if (room.players.p1) {
        setPlayer1Name(room.players.p1.name);
      }
      toast({
        title: "Room Created!",
        description: `Room ID: ${room.id}`,
      });
    });

    gameSocket.onRoomJoined((room) => {
      console.log('onRoomJoined event received:', { 
        myCurrentPlayerNumber: myPlayerNumber,
        roomPlayers: { p1: room.players.p1?.name, p2: room.players.p2?.name }
      });
      
      setRoomId(room.id);
      
      // Update all player states from the room
      if (room.players.p1) setPlayer1Name(room.players.p1.name);
      if (room.players.p1?.position) setPlayer1Pos(room.players.p1.position);
      if (room.players.p1?.score !== undefined) setPlayer1Score(room.players.p1.score);
      if (room.players.p1?.isFrozen !== undefined) setFrozen((f) => ({ ...f, p1: room.players.p1!.isFrozen }));

      if (room.players.p2) setPlayer2Name(room.players.p2.name);
      if (room.players.p2?.position) setPlayer2Pos(room.players.p2.position);
      if (room.players.p2?.score !== undefined) setPlayer2Score(room.players.p2.score);
      if (room.players.p2?.isFrozen !== undefined) setFrozen((f) => ({ ...f, p2: room.players.p2!.isFrozen }));

      setGates(room.gates || []);
      setGameState(room.gameState === 'playing' ? 'playing' : 'level-select');

      // Determine player number based on socket ID
      if (myPlayerNumber === null) {
        const gameSocketInstance = GameSocket.getInstance();
        const mySocketId = (gameSocketInstance as any).socket?.id;
        
        console.log('Determining player number:', { 
          mySocketId, 
          p1Id: room.players.p1?.id, 
          p2Id: room.players.p2?.id 
        });
        
        if (room.players.p1?.id === mySocketId) {
          console.log('onRoomJoined: Setting myPlayerNumber = 1 (matched p1 socket ID)');
          setMyPlayerNumber(1);
        } else if (room.players.p2?.id === mySocketId) {
          console.log('onRoomJoined: Setting myPlayerNumber = 2 (matched p2 socket ID)');
          setMyPlayerNumber(2);
          toast({
            title: "Joined Room",
            description: `Joined ${room.players.p1?.name}'s room!`,
          });
        }
      } else if (room.players.p2 && myPlayerNumber === 1) {
        // Player 1 sees notification that player 2 joined
        toast({
          title: "Player Joined",
          description: `${room.players.p2.name} has joined the room!`,
        });
      }
    });

    gameSocket.onGameUpdated((room) => {
      console.log('onGameUpdated:', room.gameState);
      
      // Sync player names
      if (room.players.p1?.name) setPlayer1Name(room.players.p1.name);
      if (room.players.p2?.name) setPlayer2Name(room.players.p2.name);
      
      // Apply authoritative room updates
      if (room.players.p1?.position) setPlayer1Pos(room.players.p1.position);
      if (room.players.p2?.position) setPlayer2Pos(room.players.p2.position);

      setGates(room.gates || []);
      setPlayer1Score(room.players.p1?.score ?? 0);
      setPlayer2Score(room.players.p2?.score ?? 0);
      setFrozen({ p1: room.players.p1?.isFrozen ?? false, p2: room.players.p2?.isFrozen ?? false });
      
      // Don't override client-side UI states (level-complete, scoreboard, level-select)
      setGameState(prev => {
        if (prev === 'level-complete' || prev === 'scoreboard' || prev === 'level-select') {
          return prev;
        }
        return room.gameState || 'playing';
      });
    });

    gameSocket.onRiddlePrompt((data: any) => {
      // Server tells this client there is a riddle to answer. Open riddle dialog with question/options.
      setRiddle({
        isOpen: true,
        puzzle: { 
          question: data.question, 
          options: data.options, 
          answer: '',
          type: data.type || 'riddle',
          aiApproach: data.aiApproach || 'AI analyzes patterns systematically.',
          humanApproach: data.humanApproach || 'Humans use intuition and experience.',
        } as any,
        gateIndex: data.gateIndex ?? -1,
        nextMove: null,
      });
    });

    gameSocket.onGameOver((winnerId: string) => {
      console.log('onGameOver:', winnerId);
      // Handle game over - show who won
      const winnerName = winnerId === 'p1' ? player1Name : player2Name;
      handleLevelComplete(winnerName);
      toast({ 
        title: 'Level Complete!', 
        description: `${winnerName} reached the center first!`,
      });
    });

    gameSocket.onLevelStarted((levelData: any) => {
      console.log('onLevelStarted:', levelData);
      // Both clients receive level start event from server
      const level = levelData.level || (currentLevel + 1);
      const config = allMazeConfigs[level - 1];
      
      if (config) {
        initializeLevel(level, config);
      }
    });

    gameSocket.onRoomError((err) => {
      toast({ title: 'Room Error', description: String(err), variant: 'destructive' });
    });

    return () => {
      gameSocket.cleanup();
    };
  }, []);

  // Auto-advance countdown timer
  useEffect(() => {
    if (autoAdvanceCountdown !== null && autoAdvanceCountdown > 0) {
      const timer = setTimeout(() => {
        setAutoAdvanceCountdown(autoAdvanceCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (autoAdvanceCountdown === 0) {
      // Auto-advance to next level (only for player 1 in multiplayer)
      setAutoAdvanceCountdown(null);
      if (!socket || myPlayerNumber === 1) {
        console.log('Auto-advancing to next level', { myPlayerNumber });
        proceedToNextLevel();
      }
    }
  }, [autoAdvanceCountdown, socket, myPlayerNumber]);

  // Pre-game countdown timer (3, 2, 1, GO!)
  useEffect(() => {
    if (preGameCountdown !== null && preGameCountdown > 0) {
      const timer = setTimeout(() => {
        setPreGameCountdown(preGameCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (preGameCountdown === 0) {
      // Show GO! for 500ms then clear
      setTimeout(() => {
        setPreGameCountdown(null);
      }, 500);
    }
  }, [preGameCountdown]);

  // Helpers
  const isWall = (x: number, y: number) => {
    if (y < 0 || y >= maze.length || x < 0 || x >= maze[0].length) return true;
    return maze[y][x] === 1;
  };

  const gateAt = (x: number, y: number) => gates.find((g) => g.x === x && g.y === y);

  const handleRiddleAnswer = (answer: string) => {
    // If connected to a server, delegate answer handling to server and wait for authoritative update
    if (socket) {
      socket.submitRiddleAnswer(answer);
      // close dialog locally while waiting for server update
      setRiddle(prev => ({ ...prev, isOpen: false, puzzle: null }));
      return;
    }

    if (!riddle.puzzle) return;

    const correct = riddle.puzzle.answer.toLowerCase() === answer.toLowerCase();
    if (correct) {
      // open gate
      setGates((prev) => prev.map((g, i) => (i === riddle.gateIndex ? { ...g, opened: true } : g)));
      const playerName = myPlayerNumber === 1 ? player1Name : player2Name;
      toast({ title: "Correct! Gate opened.", description: `${playerName} may pass.` });

      // Move player if we stored the next move
      if (riddle.nextMove) {
        if (myPlayerNumber === 1) setPlayer1Pos(riddle.nextMove);
        else setPlayer2Pos(riddle.nextMove);
      }
    } else {
      // freeze this player for 3s
      const playerName = myPlayerNumber === 1 ? player1Name : player2Name;
      toast({ title: "Wrong answer", description: `Freezing ${playerName} for 3s.`, variant: 'destructive' });
      if (myPlayerNumber === 1) setFrozen((f) => ({ ...f, p1: true }));
      else setFrozen((f) => ({ ...f, p2: true }));
      setTimeout(() => {
        if (myPlayerNumber === 1) setFrozen((f) => ({ ...f, p1: false }));
        else setFrozen((f) => ({ ...f, p2: false }));
      }, 3000);
    }

    // Close dialog
    setRiddle(prev => ({ ...prev, isOpen: false, puzzle: null }));

    // If moved and reached goal, trigger win
    if (correct && riddle.nextMove && riddle.nextMove.x === goal.x && riddle.nextMove.y === goal.y) {
      const playerName = myPlayerNumber === 1 ? player1Name : player2Name;
      if (myPlayerNumber === 1) setPlayer1Score((s) => s + 1);
      else setPlayer2Score((s) => s + 1);
      toast({ title: `${playerName} reached the goal!` });
      handleLevelComplete(playerName);
      return;
    }
  };

  const askRiddleAtGate = (gIndex: number, nextPos: { x: number; y: number }) => {
    // pick a random puzzle as riddle
    const pool = puzzles;
    const p = pool[Math.floor(Math.random() * pool.length)];
    
    setRiddle({
      isOpen: true,
      puzzle: p,
      gateIndex: gIndex,
      nextMove: nextPos
    });
  };

  const movePlayer = async (dx: number, dy: number) => {
    // Prevent movement during pre-game countdown
    if (preGameCountdown !== null) {
      return;
    }

    // If connected to a server socket, delegate movement to server so both clients stay in sync
    if (socket) {
      socket.move(dx, dy);
      return;
    }

    // Check if this player is frozen
    const isFrozen = myPlayerNumber === 1 ? frozen.p1 : frozen.p2;
    if (isFrozen) {
      toast({ title: "You are frozen!", description: "Wait until the freeze ends.", variant: 'destructive' });
      return;
    }

    // Get this player's position
    const pos = myPlayerNumber === 1 ? player1Pos : player2Pos;
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    if (isWall(nx, ny)) return; // can't move into walls

    const gate = gateAt(nx, ny);
    if (gate && !gate.opened) {
      // ask riddle
      const gIndex = gates.findIndex((g) => g.x === gate.x && g.y === gate.y);
      askRiddleAtGate(gIndex, { x: nx, y: ny });
      return; // Don't move yet, wait for riddle answer
    }

    // move this player
    if (myPlayerNumber === 1) setPlayer1Pos({ x: nx, y: ny });
    else setPlayer2Pos({ x: nx, y: ny });

    // check win
    if (nx === goal.x && ny === goal.y) {
      // this player wins
      const playerName = myPlayerNumber === 1 ? player1Name : player2Name;
      if (myPlayerNumber === 1) setPlayer1Score((s) => s + 1);
      else setPlayer2Score((s) => s + 1);
      toast({ title: `${playerName} reached the goal!` });
      handleLevelComplete(playerName);
      return;
    }
  };

  // Keyboard controls: allow laptop arrow keys or WASD to move while playing.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if not playing
      if (gameState !== 'playing') return;

      // Ignore when focus is on an input or textarea so typing isn't interfered with
      const active = document.activeElement as HTMLElement | null;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;

      if (e.repeat) return; // ignore held-down repeats

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          movePlayer(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          movePlayer(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          movePlayer(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          movePlayer(1, 0);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, myPlayerNumber, frozen, player1Pos, player2Pos]);

  const createRoom = () => {
    if (!player1Name.trim()) {
      toast({
        title: "Enter Name",
        description: "Please enter your name to create a room!",
        variant: "destructive",
      });
      return;
    }
    socket?.createRoom(player1Name);
  };

  const joinRoom = () => {
    if (!player2Name.trim()) {
      toast({
        title: "Enter Name",
        description: "Please enter your name to join a room!",
        variant: "destructive",
      });
      return;
    }
    if (!joinRoomId) {
      toast({
        title: "Room ID Required",
        description: "Please enter a room ID to join!",
        variant: "destructive",
      });
      return;
    }
    socket?.joinRoom(joinRoomId, player2Name);
  };

  if (gameState === "room-select") {
    return (
      <div className="min-h-screen p-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4 animate-fade-in">
            <Link to="/">
              <Button variant="outline" className="mb-4 border-primary/30 hover:border-primary/50">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-secondary/30 text-sm font-medium">
                <Users className="w-4 h-4 text-secondary" />
                <span>Multiplayer Arena</span>
              </div>
              <ConnectionStatus />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-display font-black text-gradient">
              Join a Battle
            </h1>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Room */}
            <Card className="glass p-8 border-primary/30 animate-scale-in">
              <h2 className="text-2xl font-bold mb-4">Create Room</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Your Name</label>
                  <Input
                    value={player1Name}
                    onChange={(e) => setPlayer1Name(e.target.value)}
                    placeholder="Enter your name..."
                    className="glass border-primary/20 focus:border-primary/50"
                  />
                </div>
                <Button
                  onClick={createRoom}
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                  size="lg"
                >
                  Create Room
                </Button>
              </div>
            </Card>

            {/* Join Room */}
            <Card className="glass p-8 border-secondary/30 animate-scale-in">
              <h2 className="text-2xl font-bold mb-4">Join Room</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Your Name</label>
                  <Input
                    value={player2Name}
                    onChange={(e) => setPlayer2Name(e.target.value)}
                    placeholder="Enter your name..."
                    className="glass border-secondary/20 focus:border-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Room ID</label>
                  <Input
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                    placeholder="Enter room ID..."
                    className="glass border-secondary/20 focus:border-secondary/50"
                  />
                </div>
                <Button
                  onClick={joinRoom}
                  variant="secondary"
                  className="w-full"
                  size="lg"
                >
                  Join Room
                </Button>
              </div>
            </Card>
          </div>

          {/* Available Rooms */}
          {availableRooms.length > 0 && (
            <Card className="glass p-6 border-accent/30">
              <h3 className="text-xl font-bold mb-4">Available Rooms</h3>
              <div className="space-y-2">
                {availableRooms.map((room) => (
                  <div key={room.id} className="flex items-center justify-between p-3 glass rounded-lg border border-accent/20">
                    <div>
                      <p className="font-medium">{room.players.p1?.name || 'Unknown'}'s Room</p>
                      <p className="text-sm text-muted-foreground">ID: {room.id}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-accent/30"
                      onClick={() => {
                        setJoinRoomId(room.id);
                        toast({
                          title: "Room ID Copied",
                          description: "You can now join this room!",
                        });
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy ID
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Level Selection Screen
  if (gameState === "level-select") {
    const getDifficultyColor = (difficulty: string) => {
      switch(difficulty) {
        case "Easy": return "text-green-400 border-green-500/30 bg-green-500/10";
        case "Medium": return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
        case "Hard": return "text-orange-400 border-orange-500/30 bg-orange-500/10";
        case "Expert": return "text-red-400 border-red-500/30 bg-red-500/10";
        case "Master": return "text-purple-400 border-purple-500/30 bg-purple-500/10";
        default: return "text-gray-400 border-gray-500/30 bg-gray-500/10";
      }
    };

    const getLevelIcon = (icon: string, level: number) => {
      const iconMap: Record<string, any> = {
        "🌟": Star,
        "🌀": Zap,
        "💎": Award,
        "✨": Target,
        "👑": Crown
      };
      const IconComponent = iconMap[icon] || Star;
      return <IconComponent className="w-8 h-8" />;
    };

    return (
      <div className="min-h-screen p-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4 animate-fade-in">
            <Link to="/">
              <Button variant="outline" className="mb-4 border-primary/30 hover:border-primary/50">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-secondary/30 text-sm font-medium">
                <Users className="w-4 h-4 text-secondary" />
                <span>Multiplayer Arena - Room {roomId}</span>
              </div>
              <ConnectionStatus />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-display font-black text-gradient">
              Select Level
            </h1>
            
            <div className="flex items-center justify-center gap-8 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="font-medium">{player1Name}</span>
              </div>
              <span className="text-2xl">VS</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary animate-pulse" />
                <span className="font-medium">{player2Name || "Waiting..."}</span>
              </div>
            </div>
          </div>

          {/* Level Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allMazeConfigs.map((config, idx) => {
              const isLocked = config.level > unlockedLevels;
              const isCompleted = levelStats.some(s => s.level === config.level && s.completed);
              const levelStat = levelStats.find(s => s.level === config.level);
              
              return (
                <Card
                  key={config.level}
                  className={`glass p-6 border-2 transition-all duration-300 ${
                    isLocked 
                      ? 'opacity-50 border-gray-500/20' 
                      : currentLevel === config.level
                      ? 'border-accent/60 shadow-lg shadow-accent/20 scale-105'
                      : 'border-primary/30 hover:border-accent/50 hover:scale-105 cursor-pointer'
                  }`}
                  onClick={() => !isLocked && selectLevel(config.level)}
                >
                  <div className="space-y-4">
                    {/* Level Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                          isLocked ? 'bg-gray-500/10 border border-gray-500/30' :
                          isCompleted ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/40' :
                          'bg-gradient-to-br from-primary/20 to-accent/20 border border-accent/40'
                        } transform transition-transform hover:scale-110`}>
                          {isLocked ? (
                            <Lock className="w-7 h-7 text-gray-400" />
                          ) : isCompleted ? (
                            <Trophy className="w-7 h-7 text-green-400" />
                          ) : (
                            getLevelIcon(config.icon, config.level)
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold flex items-center gap-2">
                            Level {config.level}
                            {isCompleted && <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/30">✓</Badge>}
                          </h3>
                          <p className="text-lg font-semibold text-accent">{config.name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {config.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className={getDifficultyColor(config.difficulty)}>
                          {config.difficulty}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="border-accent/30 bg-accent/10">
                          {config.gateCount} Gates
                        </Badge>
                      </div>
                    </div>

                    {/* Previous Stats */}
                    {levelStat && (
                      <div className="pt-3 border-t border-accent/20">
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <Clock className="w-3 h-3 mx-auto mb-1 text-muted-foreground" />
                            <p className="font-medium">{levelStat.timeSeconds}s</p>
                          </div>
                          <div className="text-center">
                            <Target className="w-3 h-3 mx-auto mb-1 text-muted-foreground" />
                            <p className="font-medium">{levelStat.gatesOpened} gates</p>
                          </div>
                          <div className="text-center">
                            <Trophy className="w-3 h-3 mx-auto mb-1 text-muted-foreground" />
                            <p className="font-medium text-xs">{levelStat.winner}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action */}
                    {!isLocked && (
                      <Button
                        onClick={() => selectLevel(config.level)}
                        className="w-full"
                        variant={currentLevel === config.level ? "default" : "outline"}
                        disabled={!player2Name}
                      >
                        {!player2Name ? "Waiting for Player 2..." : 
                         currentLevel === config.level ? "Play This Level" : "Select"}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => {
                socket?.leaveRoom();
                resetGame();
              }}
              variant="outline"
            >
              Leave Room
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Level Complete Screen
  if (gameState === "level-complete") {
    const lastStat = levelStats[levelStats.length - 1];
    const isWinner = lastStat && ((myPlayerNumber === 1 && lastStat.winner === player1Name) || 
                                   (myPlayerNumber === 2 && lastStat.winner === player2Name));
    
    // Use server scores instead of calculating from levelStats
    const p1Wins = player1Score;
    const p2Wins = player2Score;
    
    return (
      <div className="min-h-screen p-4 py-12 flex items-center justify-center">
        <Card className="glass p-12 border-accent/30 max-w-3xl w-full animate-scale-in">
          <div className="text-center space-y-6">
            {/* Player Role Badge */}
            {myPlayerNumber && (
              <div className="flex justify-center">
                <Badge variant="outline" className="px-4 py-2">
                  You are Player {myPlayerNumber} {myPlayerNumber === 1 ? "(Host)" : "(Guest)"}
                </Badge>
              </div>
            )}
            
            {/* Countdown Badge */}
            {autoAdvanceCountdown !== null && autoAdvanceCountdown > 0 && (
              <div className="flex justify-center">
                <Badge className="px-6 py-3 text-lg bg-gradient-to-r from-accent/20 to-primary/20 border-accent/50 animate-pulse">
                  <Clock className="w-5 h-5 mr-2" />
                  Next level in {autoAdvanceCountdown}s...
                </Badge>
              </div>
            )}
            
            {/* Victory Animation */}
            <div className="text-8xl animate-bounce">
              {isWinner ? "🏆" : "⭐"}
            </div>
            
            <h1 className="text-5xl font-display font-black text-gradient">
              Level {currentLevel} Complete!
            </h1>
            
            <div className="text-3xl font-bold">
              {lastStat?.winner} Wins!
            </div>

            {/* Current Match Score */}
            <div className="grid grid-cols-2 gap-4 mt-6 max-w-md mx-auto">
              <Card className={`p-4 ${
                p1Wins > p2Wins ? 'border-2 border-green-500/50 bg-green-500/10' : 'glass border border-primary/20'
              }`}>
                <p className="text-sm text-muted-foreground mb-1">{player1Name}</p>
                <p className="text-3xl font-bold text-primary">{p1Wins}</p>
                <p className="text-xs text-muted-foreground">wins</p>
              </Card>
              <Card className={`p-4 ${
                p2Wins > p1Wins ? 'border-2 border-green-500/50 bg-green-500/10' : 'glass border border-secondary/20'
              }`}>
                <p className="text-sm text-muted-foreground mb-1">{player2Name}</p>
                <p className="text-3xl font-bold text-secondary">{p2Wins}</p>
                <p className="text-xs text-muted-foreground">wins</p>
              </Card>
            </div>

            {/* Stats */}
            {lastStat && (
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-accent" />
                  <p className="text-2xl font-bold">{lastStat.timeSeconds}s</p>
                  <p className="text-sm text-muted-foreground">Time</p>
                </div>
                <div className="space-y-2">
                  <Target className="w-8 h-8 mx-auto text-accent" />
                  <p className="text-2xl font-bold">{lastStat.gatesOpened}</p>
                  <p className="text-sm text-muted-foreground">Gates Solved</p>
                </div>
                <div className="space-y-2">
                  <TrendingUp className="w-8 h-8 mx-auto text-accent" />
                  <p className="text-2xl font-bold">{currentLevel}/{allMazeConfigs.length}</p>
                  <p className="text-sm text-muted-foreground">Levels Done</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              {currentLevel < allMazeConfigs.length ? (
                <>
                  {myPlayerNumber === 1 ? (
                    <>
                      <Button
                        onClick={() => {
                          console.log('Next Level button clicked!', { 
                            myPlayerNumber, 
                            currentLevel, 
                            unlockedLevels,
                            allMazeConfigsLength: allMazeConfigs.length 
                          });
                          setAutoAdvanceCountdown(null);
                          proceedToNextLevel();
                        }}
                        className="flex-1 bg-gradient-to-r from-primary to-accent text-lg py-6"
                        size="lg"
                      >
                        <Zap className="w-5 h-5 mr-2" />
                        {autoAdvanceCountdown !== null && autoAdvanceCountdown > 0 ? 'Skip Wait' : `Next Level (${currentLevel + 1})`}
                      </Button>
                      <Button
                        onClick={() => {
                          setAutoAdvanceCountdown(null);
                          setGameState('level-select');
                        }}
                        variant="outline"
                        className="flex-1 py-6"
                        size="lg"
                      >
                        <Target className="w-5 h-5 mr-2" />
                        Choose Level
                      </Button>
                    </>
                  ) : (
                    <div className="text-center p-6 glass rounded-lg border border-accent/30 w-full">
                      <p className="text-lg text-muted-foreground mb-2">
                        Waiting for {player1Name} to start the next level...
                      </p>
                      <p className="text-sm text-muted-foreground/70">
                        {autoAdvanceCountdown !== null && autoAdvanceCountdown > 0 && `Auto-starting in ${autoAdvanceCountdown}s`}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <Button
                  onClick={() => setGameState('scoreboard')}
                  className="w-full bg-gradient-to-r from-primary to-accent text-lg py-6"
                  size="lg"
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  View Final Score
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (gameState === "scoreboard") {
    // Calculate comprehensive stats
    const totalLevelsCompleted = levelStats.filter(s => s.completed).length;
    const totalTime = levelStats.reduce((sum, s) => sum + s.timeSeconds, 0);
    const totalGates = levelStats.reduce((sum, s) => sum + s.gatesOpened, 0);
    const player1Wins = levelStats.filter(s => s.winner === player1Name).length;
    const player2Wins = levelStats.filter(s => s.winner === player2Name).length;
    const avgTime = totalLevelsCompleted > 0 ? Math.floor(totalTime / totalLevelsCompleted) : 0;
    
    const winner = player1Wins > player2Wins ? player1Name : player2Wins > player1Wins ? player2Name : null;
    const isTie = player1Wins === player2Wins;
    
    // Performance remarks based on stats
    const getPerformanceRemark = () => {
      if (totalLevelsCompleted === allMazeConfigs.length) {
        if (avgTime < 30) return "🚀 Lightning Fast! You both are maze masters!";
        if (avgTime < 60) return "⚡ Impressive Speed! Great teamwork and strategy!";
        if (avgTime < 90) return "🎯 Well Done! Solid performance throughout!";
        return "🌟 Completed! Persistence pays off!";
      }
      if (totalLevelsCompleted >= 3) return "💪 Strong Progress! You're on the right track!";
      if (totalLevelsCompleted >= 1) return "🎮 Good Start! Keep up the momentum!";
      return "🎪 Adventure Begins! Every journey starts somewhere!";
    };

    const getPlayerRemark = (wins: number, isWinner: boolean) => {
      if (wins === allMazeConfigs.length) return "Perfect Sweep! Unstoppable!";
      if (wins >= 4) return "Dominant Performance! Excellent!";
      if (wins >= 3) return "Strong Showing! Well played!";
      if (wins >= 2) return "Good Effort! Nice work!";
      if (wins >= 1) return "Made Your Mark! Keep improving!";
      return "Great Try! Learn and return!";
    };
    
    return (
      <div className="min-h-screen p-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Victory Header */}
          <div className="text-center space-y-6 animate-fade-in">
            <div className="text-8xl animate-bounce">
              {isTie ? "🤝" : "👑"}
            </div>
            
            <h1 className="text-6xl md:text-7xl font-display font-black text-gradient">
              {isTie ? "Epic Tie!" : `${winner} Wins!`}
            </h1>
            
            <p className="text-2xl font-bold text-accent">
              {getPerformanceRemark()}
            </p>
          </div>

          {/* Player Comparison Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Player 1 Card */}
            <Card className={`glass p-8 border-2 transition-all duration-300 ${
              player1Wins > player2Wins ? 'border-green-500/50 bg-gradient-to-br from-green-500/10 to-emerald-500/10 scale-105' : 
              'border-primary/30'
            }`}>
              <div className="text-center space-y-4">
                {player1Wins > player2Wins && (
                  <div className="flex justify-center">
                    <Badge className="bg-green-500/20 border-green-500/50 text-green-400 px-4 py-2 text-sm">
                      <Crown className="w-4 h-4 mr-2" />
                      Champion
                    </Badge>
                  </div>
                )}
                
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border-4 border-primary/50">
                  <User className="w-10 h-10 text-primary" />
                </div>
                
                <h2 className="text-3xl font-bold">{player1Name}</h2>
                
                <div className="text-5xl font-black text-primary">
                  {player1Wins} <span className="text-2xl text-muted-foreground">/ {totalLevelsCompleted}</span>
                </div>
                
                <p className="text-sm text-muted-foreground font-medium">
                  {getPlayerRemark(player1Wins, player1Wins > player2Wins)}
                </p>
                
                <div className="pt-4 border-t border-primary/20 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Performance:</span>
                    <span className="font-semibold">{totalLevelsCompleted > 0 ? Math.round((player1Wins / totalLevelsCompleted) * 100) : 0}%</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Player 2 Card */}
            <Card className={`glass p-8 border-2 transition-all duration-300 ${
              player2Wins > player1Wins ? 'border-green-500/50 bg-gradient-to-br from-green-500/10 to-emerald-500/10 scale-105' : 
              'border-secondary/30'
            }`}>
              <div className="text-center space-y-4">
                {player2Wins > player1Wins && (
                  <div className="flex justify-center">
                    <Badge className="bg-green-500/20 border-green-500/50 text-green-400 px-4 py-2 text-sm">
                      <Crown className="w-4 h-4 mr-2" />
                      Champion
                    </Badge>
                  </div>
                )}
                
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-secondary/30 to-accent/30 flex items-center justify-center border-4 border-secondary/50">
                  <User className="w-10 h-10 text-secondary" />
                </div>
                
                <h2 className="text-3xl font-bold">{player2Name}</h2>
                
                <div className="text-5xl font-black text-secondary">
                  {player2Wins} <span className="text-2xl text-muted-foreground">/ {totalLevelsCompleted}</span>
                </div>
                
                <p className="text-sm text-muted-foreground font-medium">
                  {getPlayerRemark(player2Wins, player2Wins > player1Wins)}
                </p>
                
                <div className="pt-4 border-t border-secondary/20 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Performance:</span>
                    <span className="font-semibold">{totalLevelsCompleted > 0 ? Math.round((player2Wins / totalLevelsCompleted) * 100) : 0}%</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Overall Stats */}
          <Card className="glass p-8 border-accent/30">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Medal className="w-6 h-6 text-accent" />
              Session Statistics
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2 p-4 glass rounded-lg border border-accent/20">
                <Target className="w-8 h-8 mx-auto text-accent" />
                <p className="text-3xl font-bold">{totalLevelsCompleted}</p>
                <p className="text-sm text-muted-foreground">Levels Completed</p>
              </div>
              
              <div className="text-center space-y-2 p-4 glass rounded-lg border border-accent/20">
                <Clock className="w-8 h-8 mx-auto text-accent" />
                <p className="text-3xl font-bold">{avgTime}s</p>
                <p className="text-sm text-muted-foreground">Avg Time</p>
              </div>
              
              <div className="text-center space-y-2 p-4 glass rounded-lg border border-accent/20">
                <Zap className="w-8 h-8 mx-auto text-accent" />
                <p className="text-3xl font-bold">{totalGates}</p>
                <p className="text-sm text-muted-foreground">Gates Solved</p>
              </div>
              
              <div className="text-center space-y-2 p-4 glass rounded-lg border border-accent/20">
                <TrendingUp className="w-8 h-8 mx-auto text-accent" />
                <p className="text-3xl font-bold">{Math.floor(totalTime / 60)}m {totalTime % 60}s</p>
                <p className="text-sm text-muted-foreground">Total Time</p>
              </div>
            </div>
          </Card>

          {/* Level by Level Breakdown */}
          {levelStats.length > 0 && (
            <Card className="glass p-8 border-accent/30">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-accent" />
                Level Breakdown
              </h3>
              
              <div className="space-y-3">
                {levelStats.map((stat, idx) => {
                  const config = allMazeConfigs[stat.level - 1];
                  return (
                    <div key={idx} className="flex items-center justify-between p-4 glass rounded-lg border border-accent/20 hover:border-accent/40 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center border border-accent/30">
                          <span className="text-xl font-bold">{stat.level}</span>
                        </div>
                        <div>
                          <p className="font-semibold">{config.name}</p>
                          <p className="text-sm text-muted-foreground">Winner: {stat.winner}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-lg font-bold">{stat.timeSeconds}s</p>
                          <p className="text-xs text-muted-foreground">Time</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">{stat.gatesOpened}</p>
                          <p className="text-xs text-muted-foreground">Gates</p>
                        </div>
                        <Badge variant="outline" className={
                          stat.winner === player1Name ? 'border-primary/50 bg-primary/10' : 
                          'border-secondary/50 bg-secondary/10'
                        }>
                          <Trophy className="w-3 h-3 mr-1" />
                          Victory
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={resetGame} className="flex-1 text-lg py-6" size="lg">
              <Swords className="w-5 h-5 mr-2" />
              Play Again
            </Button>
            <Link to="/leaderboard" className="flex-1">
              <Button variant="outline" className="w-full text-lg py-6" size="lg">
                <Trophy className="w-5 h-5 mr-2" />
                Global Leaderboard
              </Button>
            </Link>
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full text-lg py-6" size="lg">
                <Home className="w-5 h-5 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-secondary/30 text-sm font-medium">
              <Users className="w-4 h-4 text-secondary" />
              <span>Race to the Center!</span>
            </div>
            <ConnectionStatus />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-black text-gradient">
            Multiplayer Race
          </h1>
        </div>

        {/* Score Display */}
        <Card className="glass p-6 border-primary/30">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-sm text-muted-foreground mb-1">{player1Name}</p>
              <Badge variant="outline" className="border-primary/30 text-xl px-4 py-2">
                <Trophy className="w-4 h-4 mr-2" />
                {player1Score}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-muted-foreground">VS</div>
            <div className="text-center flex-1">
              <p className="text-sm text-muted-foreground mb-1">{player2Name}</p>
              <Badge variant="outline" className="border-secondary/30 text-xl px-4 py-2">
                <Trophy className="w-4 h-4 mr-2" />
                {player2Score}
              </Badge>
            </div>
          </div>
          <Progress value={(currentRound / 5) * 100} className="h-2 mt-4" />
        </Card>

        {/* Maze Playing UI */}
        {gameState === "playing" && (
          <div className="space-y-8 animate-scale-in">
            <div className="text-center space-y-3">
              {/* Level Info */}
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Badge variant="outline" className="px-4 py-2 text-lg border-accent/40 bg-accent/10">
                  <Target className="w-4 h-4 mr-2" />
                  Level {currentLevel} - {currentMazeConfig.name}
                </Badge>
                <Badge variant="outline" className="px-3 py-2 border-primary/30">
                  {currentMazeConfig.difficulty}
                </Badge>
              </div>
              
              {/* Quick Action Buttons - Moved to top */}
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                <Button 
                  onClick={() => setGameState('level-select')} 
                  variant="outline"
                  size="sm"
                  className="border-primary/30"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Level Select
                </Button>
                
                {currentLevel < allMazeConfigs.length && (
                  <Button 
                    onClick={() => {
                      const nextLevel = currentLevel + 1;
                      if (nextLevel <= unlockedLevels) {
                        setCurrentLevel(nextLevel);
                        const config = allMazeConfigs[nextLevel - 1];
                        setCurrentMazeConfig(config);
                        setPlayer1Pos(config.player1Start);
                        setPlayer2Pos(config.player2Start);
                        setGates(JSON.parse(JSON.stringify(config.gates)));
                        setLevelStartTime(Date.now());
                        toast({
                          title: `Level ${nextLevel}`,
                          description: `Now playing: ${config.name}`
                        });
                      } else {
                        toast({
                          title: "Level Locked",
                          description: "Complete current level to unlock!",
                          variant: "destructive"
                        });
                      }
                    }}
                    variant="default"
                    size="sm"
                    className="bg-gradient-to-r from-accent to-primary"
                    disabled={currentLevel >= unlockedLevels}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Next Level ({currentLevel + 1})
                  </Button>
                )}
                
                {levelStats.length > 0 && (
                  <Button 
                    onClick={() => setGameState('scoreboard')} 
                    variant="outline"
                    size="sm"
                    className="border-secondary/30"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Scoreboard
                  </Button>
                )}
              </div>
              
              <p className="text-lg font-semibold text-primary">
                Both players racing to the center!
              </p>
              <p className="text-sm text-muted-foreground">
                You are <span className="font-bold">{myPlayerNumber === 1 ? player1Name : player2Name}</span>
                {myPlayerNumber === 1 ? " (Red)" : " (Green)"}
              </p>
              <div className="flex items-center justify-center gap-4 mt-2 text-xs flex-wrap">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-600 rounded-sm" />
                  <span>Player 1</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-700 rounded-sm" />
                  <span>Player 2</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Locked Gate</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span>Open Gate</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full" />
                  <span>Goal</span>
                </div>
              </div>
            </div>

            <Card className="p-6 glass overflow-auto relative">
              {/* Pre-Game Countdown Overlay */}
              {preGameCountdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 rounded-lg">
                  <div className="text-center animate-scale-in">
                    {preGameCountdown > 0 ? (
                      <div className="text-9xl font-black text-white animate-bounce">
                        {preGameCountdown}
                      </div>
                    ) : (
                      <div className="text-8xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent animate-pulse">
                        GO!
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mx-auto" style={{ width: maze[0].length * 24, maxWidth: '100%' }}>
                {maze.map((row, y) => (
                  <div key={y} className="flex">
                    {row.map((cell, x) => {
                      const isP1 = player1Pos.x === x && player1Pos.y === y;
                      const isP2 = player2Pos.x === x && player2Pos.y === y;
                      const gate = gateAt(x, y);
                      let bg = cell === 1 ? 'bg-black' : 'bg-white';
                      let content = null;
                      if (isP1) content = <div className="w-4 h-4 bg-red-600 rounded-sm" />;
                      else if (isP2) content = <div className="w-4 h-4 bg-green-700 rounded-sm" />;
                      else if (gate) content = gate.opened ? <div className="w-2 h-2 bg-green-400 rounded-full" /> : <div className="w-2 h-2 bg-red-500 rounded-full" />;
                      else if (x === goal.x && y === goal.y) content = <div className="w-5 h-5 bg-yellow-400 rounded-full animate-pulse" />;

                      return (
                        <div key={x} className={`${bg} border border-gray-300 w-6 h-6 flex items-center justify-center`}>
                          {content}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex items-center justify-center gap-6">
              <div className="grid grid-cols-3 gap-2">
                <div />
                <Button onClick={() => movePlayer(0, -1)} disabled={gameState !== 'playing'}>Up</Button>
                <div />
                <Button onClick={() => movePlayer(-1, 0)} disabled={gameState !== 'playing'}>Left</Button>
                <Button onClick={() => {/* no-op center */}} disabled className="opacity-50">Turn</Button>
                <Button onClick={() => movePlayer(1, 0)} disabled={gameState !== 'playing'}>Right</Button>
                <div />
                <Button onClick={() => movePlayer(0, 1)} disabled={gameState !== 'playing'}>Down</Button>
                <div />
              </div>
            </div>
          </div>
        )}

        {/* Riddle Dialog */}
        <Dialog open={riddle.isOpen} onOpenChange={(open) => !open && setRiddle(prev => ({ ...prev, isOpen: false }))}>
          <DialogContent className="sm:max-w-[700px] glass border-accent/30">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-display text-2xl">
                <Brain className="w-6 h-6 text-accent animate-pulse" />
                Gate Riddle Challenge
              </DialogTitle>
              <DialogDescription>
                Answer correctly to pass through the gate!
              </DialogDescription>
            </DialogHeader>

            {riddle.puzzle && (
              <div className="space-y-6 py-4">
                {/* Question Card */}
                <Card className="glass p-6 border-accent/30">
                  <p className="text-lg font-medium text-center">{riddle.puzzle.question}</p>
                </Card>

                {/* AI vs Human Approaches Tabs */}
                <Tabs defaultValue="ai" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 glass">
                    <TabsTrigger 
                      value="ai" 
                      className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 transition-all duration-300"
                    >
                      <div className="relative">
                        <Cpu className="w-5 h-5 text-blue-400" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                      </div>
                      AI Approach
                    </TabsTrigger>
                    <TabsTrigger 
                      value="human" 
                      className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-teal-500/20 transition-all duration-300"
                    >
                      <div className="relative">
                        <User className="w-5 h-5 text-green-400" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                      </div>
                      Human Approach
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent 
                    value="ai" 
                    className="mt-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
                  >
                    <Card className="glass p-5 border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
                            <Cpu className="w-7 h-7 text-blue-400" strokeWidth={2.5} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                            Computational Strategy
                            <Badge variant="outline" className="text-xs border-blue-500/30 bg-blue-500/10">
                              Systematic
                            </Badge>
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {riddle.puzzle.aiApproach || 'AI analyzes patterns systematically using logic and data.'}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent 
                    value="human" 
                    className="mt-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
                  >
                    <Card className="glass p-5 border-green-500/30 bg-gradient-to-br from-green-500/5 to-teal-500/5">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
                            <User className="w-7 h-7 text-green-400" strokeWidth={2.5} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                            Intuitive Reasoning
                            <Badge variant="outline" className="text-xs border-green-500/30 bg-green-500/10">
                              Creative
                            </Badge>
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {riddle.puzzle.humanApproach || 'Humans use intuition, experience, and creative thinking.'}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Answer Options */}
                <div className="grid gap-3 pt-2">
                  {riddle.puzzle.options.map((option, idx) => (
                    <Button
                      key={option}
                      onClick={() => handleRiddleAnswer(option)}
                      variant="outline"
                      className="w-full h-14 text-base font-medium hover:bg-accent/10 hover:border-accent/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
                    >
                      <span className="flex items-center gap-2 w-full">
                        <Badge variant="outline" className="w-6 h-6 flex items-center justify-center group-hover:bg-accent/20">
                          {String.fromCharCode(65 + idx)}
                        </Badge>
                        <span className="flex-1 text-left">{option}</span>
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

