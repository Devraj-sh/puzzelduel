import { io, Socket } from "socket.io-client";
type GameEvents = Record<string, (...args: any[]) => void>;

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export class GameSocket {
  private socket: Socket;
  private static instance: GameSocket;
  private connectionErrorCallback?: (error: string) => void;
  private connectionStatusCallback?: (status: ConnectionStatus) => void;
  private currentStatus: ConnectionStatus = 'disconnected';

  private constructor() {
    const socketUrl = (import.meta as any).env?.VITE_SOCKET_URL || "http://localhost:3001";
    
    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Handle connection events
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.updateStatus('connected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.updateStatus('error');
      if (this.connectionErrorCallback) {
        this.connectionErrorCallback(error.message);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.updateStatus('disconnected');
    });

    this.socket.on('reconnect_attempt', () => {
      console.log('Attempting to reconnect...');
      this.updateStatus('connecting');
    });

    // Initial status
    this.updateStatus('connecting');
  }

  public static getInstance(): GameSocket {
    if (!GameSocket.instance) {
      GameSocket.instance = new GameSocket();
    }
    return GameSocket.instance;
  }

  private updateStatus(status: ConnectionStatus) {
    this.currentStatus = status;
    if (this.connectionStatusCallback) {
      this.connectionStatusCallback(status);
    }
  }

  public getStatus(): ConnectionStatus {
    return this.currentStatus;
  }

  public onStatusChange(callback: (status: ConnectionStatus) => void) {
    this.connectionStatusCallback = callback;
    // Immediately call with current status
    callback(this.currentStatus);
  }

  // Room management
  public createRoom(playerName: string) {
    this.socket.emit("create:room", playerName);
  }

  public joinRoom(roomId: string, playerName: string) {
    this.socket.emit("join:room", roomId, playerName);
  }

  public onRoomCreated(callback: GameEvents["room:created"]) {
    this.socket.on("room:created", callback);
  }

  public onRoomJoined(callback: GameEvents["room:joined"]) {
    this.socket.on("room:joined", callback);
  }

  public onRoomError(callback: GameEvents["room:error"]) {
    this.socket.on("room:error", callback);
  }

  public leaveRoom() {
    this.socket.emit("leave:room");
  }

  // Game events
  public move(dx: number, dy: number) {
    this.socket.emit("player:move", { dx, dy });
  }

  public startLevel(levelData: { level: number; maze: number[][]; goal: { x: number; y: number }; gates: Array<{ x: number; y: number }>; player1Start: { x: number; y: number }; player2Start: { x: number; y: number } }) {
    this.socket.emit("level:start", levelData);
  }

  public onGameUpdated(callback: GameEvents["game:updated"]) {
    this.socket.on("game:updated", callback);
  }

  public onRiddlePrompt(callback: GameEvents["riddle:prompt"]) {
    this.socket.on("riddle:prompt", callback);
  }

  public submitRiddleAnswer(answer: string) {
    this.socket.emit("riddle:answer", answer);
  }

  public onGameOver(callback: GameEvents["game:over"]) {
    this.socket.on("game:over", callback);
  }

  public onLevelStarted(callback: (levelData: any) => void) {
    this.socket.on("level:started", callback);
  }

  public cleanup() {
    this.socket.removeAllListeners();
    this.socket.close();
  }
}