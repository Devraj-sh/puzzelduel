import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Trophy, Users, Home, Swords, Brain, Cpu, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { puzzles } from "@/data/puzzles";

type GameState = "setup" | "playing" | "results" | "finished";

export const MultiplayerArena = () => {
  const [gameState, setGameState] = useState<GameState>("setup");
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [currentRound, setCurrentRound] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [player1Answer, setPlayer1Answer] = useState<string | null>(null);
  const [player2Answer, setPlayer2Answer] = useState<string | null>(null);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const { toast } = useToast();

  const gamePuzzles = puzzles.slice(0, 5);
  const currentPuzzle = gamePuzzles[currentRound];

  const startGame = () => {
    if (!player1Name.trim() || !player2Name.trim()) {
      toast({
        title: "Enter Names",
        description: "Both players must enter their names!",
        variant: "destructive",
      });
      return;
    }
    setGameState("playing");
  };

  const handleAnswerSelect = (option: string) => {
    if (currentPlayer === 1) {
      setPlayer1Answer(option);
      const isCorrect = option === currentPuzzle.answer;
      
      if (isCorrect) {
        toast({
          title: `${player1Name} - Correct! 🎉`,
          description: "Great reasoning!",
        });
        setPlayer1Score(player1Score + 1);
      } else {
        toast({
          title: `${player1Name} - Not quite!`,
          description: "See how to think better!",
          variant: "destructive",
        });
      }
      
      setCurrentPlayer(2);
    } else {
      setPlayer2Answer(option);
      const isCorrect = option === currentPuzzle.answer;
      
      if (isCorrect) {
        toast({
          title: `${player2Name} - Correct! 🎉`,
          description: "Excellent work!",
        });
        setPlayer2Score(player2Score + 1);
      } else {
        toast({
          title: `${player2Name} - Not quite!`,
          description: "Learn from the explanation!",
          variant: "destructive",
        });
      }
      
      setShowExplanation(true);
      setGameState("results");
    }
  };

  const handleNextRound = () => {
    if (currentRound < 4) {
      setCurrentRound(currentRound + 1);
      setCurrentPlayer(1);
      setPlayer1Answer(null);
      setPlayer2Answer(null);
      setShowExplanation(false);
      setGameState("playing");
    } else {
      setGameState("finished");
    }
  };

  const resetGame = () => {
    setGameState("setup");
    setPlayer1Name("");
    setPlayer2Name("");
    setCurrentRound(0);
    setCurrentPlayer(1);
    setPlayer1Answer(null);
    setPlayer2Answer(null);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setShowExplanation(false);
  };

  if (gameState === "setup") {
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
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-secondary/30 text-sm font-medium">
              <Users className="w-4 h-4 text-secondary" />
              <span>Multiplayer Arena</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-display font-black text-gradient">
              Puzzle Battle Arena
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Compete in logic, riddles & math! 5 rounds, fastest correct answers win.
            </p>
          </div>

          <Card className="glass p-8 border-primary/30 animate-scale-in">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Player 1 Name</label>
                <Input
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  placeholder="Enter Player 1 name..."
                  className="glass border-primary/20 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Player 2 Name</label>
                <Input
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  placeholder="Enter Player 2 name..."
                  className="glass border-secondary/20 focus:border-secondary/50"
                />
              </div>

              <Button
                onClick={startGame}
                className="w-full bg-gradient-to-r from-primary to-secondary"
                size="lg"
              >
                <Swords className="w-5 h-5 mr-2" />
                Start Battle
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (gameState === "finished") {
    const winner = player1Score > player2Score ? player1Name : player2Score > player1Score ? player2Name : "Tie";
    const isDraw = player1Score === player2Score;

    return (
      <div className="min-h-screen p-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-display font-black text-gradient">
              Battle Complete!
            </h1>
            
            <div className="text-6xl animate-scale-in">
              {isDraw ? "🤝" : "🏆"}
            </div>
            
            <p className="text-3xl font-bold">
              {isDraw ? "It's a Draw!" : `${winner} Wins!`}
            </p>
          </div>

          <Card className="glass p-8 border-primary/30">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className={`p-6 rounded-lg ${player1Score > player2Score ? 'bg-primary/10 border-2 border-primary' : 'glass border border-primary/20'}`}>
                <div className="text-center space-y-2">
                  <Brain className="w-8 h-8 mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">Player 1</p>
                  <p className="text-2xl font-bold">{player1Name}</p>
                  <p className="text-4xl font-black text-primary">{player1Score}</p>
                  <p className="text-sm text-muted-foreground">correct answers</p>
                </div>
              </div>

              <div className={`p-6 rounded-lg ${player2Score > player1Score ? 'bg-secondary/10 border-2 border-secondary' : 'glass border border-secondary/20'}`}>
                <div className="text-center space-y-2">
                  <Brain className="w-8 h-8 mx-auto text-secondary" />
                  <p className="text-sm text-muted-foreground">Player 2</p>
                  <p className="text-2xl font-bold">{player2Name}</p>
                  <p className="text-4xl font-black text-secondary">{player2Score}</p>
                  <p className="text-sm text-muted-foreground">correct answers</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={resetGame} className="flex-1" size="lg">
                Play Again
              </Button>
              <Link to="/leaderboard" className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  <Trophy className="w-5 h-5 mr-2" />
                  Leaderboard
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const currentPlayerName = currentPlayer === 1 ? player1Name : player2Name;
  const waitingPlayerName = currentPlayer === 1 ? player2Name : player1Name;

  return (
    <div className="min-h-screen p-4 py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-secondary/30 text-sm font-medium">
            <Users className="w-4 h-4 text-secondary" />
            <span>Round {currentRound + 1} of 5</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-black text-gradient">
            {currentPlayerName}'s Turn
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

        {/* Puzzle Display */}
        {gameState === "playing" && (
          <div className="space-y-8 animate-scale-in">
            <Card className="glass p-8 border-accent/30 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-accent" />
                <h3 className="text-2xl font-semibold">Puzzle Challenge</h3>
              </div>
              <p className="text-xl font-medium mb-4">{currentPuzzle.question}</p>
              <Badge variant="outline" className="border-accent/30">
                {currentPuzzle.type.toUpperCase()}
              </Badge>
            </Card>

            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">
                {currentPlayer === 1 ? (
                  <span className="text-primary">{currentPlayerName}'s Turn</span>
                ) : (
                  <span className="text-secondary">{currentPlayerName}'s Turn</span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {waitingPlayerName} is waiting...
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {currentPuzzle.options.map((option) => (
                <Button
                  key={option}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={(currentPlayer === 1 && player1Answer !== null) || (currentPlayer === 2 && player2Answer !== null)}
                  variant="outline"
                  size="lg"
                  className={`h-24 text-lg font-semibold transition-all duration-300 ${
                    (currentPlayer === 1 && player1Answer === option) || (currentPlayer === 2 && player2Answer === option)
                      ? 'scale-95 opacity-50'
                      : 'hover:scale-105 hover:border-accent/50'
                  }`}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Results & AI vs Human Explanation */}
        {gameState === "results" && showExplanation && (
          <div className="space-y-6 animate-fade-in">
            <Card className="glass p-6 border-accent/30">
              <h3 className="text-xl font-bold text-center mb-4">Round {currentRound + 1} Results</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg text-center ${player1Answer === currentPuzzle.answer ? 'bg-primary/20 border-2 border-primary' : 'glass border border-muted/20'}`}>
                  <p className="text-sm text-muted-foreground">{player1Name}</p>
                  <p className="font-bold text-lg">{player1Answer}</p>
                  <p className="text-xs mt-1">
                    {player1Answer === currentPuzzle.answer ? '✓ Correct' : '✗ Incorrect'}
                  </p>
                </div>
                <div className={`p-4 rounded-lg text-center ${player2Answer === currentPuzzle.answer ? 'bg-secondary/20 border-2 border-secondary' : 'glass border border-muted/20'}`}>
                  <p className="text-sm text-muted-foreground">{player2Name}</p>
                  <p className="font-bold text-lg">{player2Answer}</p>
                  <p className="text-xs mt-1">
                    {player2Answer === currentPuzzle.answer ? '✓ Correct' : '✗ Incorrect'}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-center p-3 bg-accent/10 rounded-lg">
                <p className="text-sm font-semibold">Correct Answer: <span className="text-accent text-lg">{currentPuzzle.answer}</span></p>
              </div>
            </Card>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
                <Zap className="w-4 h-4" />
                <span className="font-semibold">Learn: AI vs Human Thinking</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* AI Approach */}
              <Card className="glass border-2 border-primary/40 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-glow"></div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="text-lg font-bold text-primary">AI Approach</h4>
                  </div>
                  <p className="text-sm leading-relaxed">{currentPuzzle.aiApproach}</p>
                </div>
              </Card>

              {/* Human Approach */}
              <Card className="glass border-2 border-secondary/40 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-secondary-glow"></div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-secondary" />
                    </div>
                    <h4 className="text-lg font-bold text-secondary">Human Approach</h4>
                  </div>
                  <p className="text-sm leading-relaxed">{currentPuzzle.humanApproach}</p>
                </div>
              </Card>
            </div>

            <Card className="glass p-6 border-accent/30 bg-accent/5">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                Key Insight
              </h4>
              <p className="text-sm">{currentPuzzle.explanation}</p>
            </Card>

            <Button
              onClick={handleNextRound}
              className="w-full bg-gradient-to-r from-primary via-accent to-secondary"
              size="lg"
            >
              {currentRound < 4 ? 'Next Round →' : 'See Final Results'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

