import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Trophy, Target, Zap, Home, Brain, Cpu } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Balloon3D } from "./Balloon3D";
import { puzzles } from "@/data/puzzles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ArenaWithBalloons = () => {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [poppedBalloons, setPoppedBalloons] = useState<Set<string>>(new Set());
  const [showExplanation, setShowExplanation] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const { toast } = useToast();

  const currentPuzzle = puzzles[currentPuzzleIndex];

  const balloonColors = [
    "bg-gradient-to-br from-pink-400 to-pink-600",
    "bg-gradient-to-br from-blue-400 to-blue-600",
    "bg-gradient-to-br from-green-400 to-green-600",
    "bg-gradient-to-br from-yellow-400 to-yellow-600"
  ];

  const handleBalloonClick = (option: string) => {
    if (selectedAnswer || poppedBalloons.has(option)) return;

    setSelectedAnswer(option);
    setPoppedBalloons(new Set([...poppedBalloons, option]));
    
    const isCorrect = option === currentPuzzle.answer;
    const points = isCorrect ? 50 + (streak * 10) : 0;
    
    if (isCorrect) {
      setTotalScore(totalScore + points);
      setStreak(streak + 1);
      toast({
        title: `Correct! +${points} points 🎉`,
        description: streak >= 2 ? `${streak + 1}x Streak!` : "Great job!",
      });

      // Save to leaderboard
      const username = localStorage.getItem('username') || 'Player';
      const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
      leaderboard.push({
        username,
        level: currentPuzzle.type,
        score: totalScore + points,
        creativity: Math.floor(Math.random() * 30) + 70,
        date: new Date().toISOString(),
      });
      localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    } else {
      setStreak(0);
      toast({
        title: "Not quite right",
        description: "Keep trying! Learn from the explanation.",
        variant: "destructive",
      });
    }

    setTimeout(() => {
      setShowExplanation(true);
    }, 1000);
  };

  const handleNext = () => {
    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
      setSelectedAnswer(null);
      setPoppedBalloons(new Set());
      setShowExplanation(false);
    } else {
      // Game complete
      toast({
        title: "Arena Complete! 🏆",
        description: `Final Score: ${totalScore} points`,
      });
    }
  };

  return (
    <div className="min-h-screen p-4 py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <Link to="/">
            <Button variant="outline" className="mb-4 border-primary/30 hover:border-primary/50">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-secondary/30 text-sm font-medium">
            <Zap className="w-4 h-4 text-secondary" />
            <span>Solo Arena</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-display font-black text-gradient">
            Battle Arena
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Burst the correct balloon! Test your reasoning skills against AI logic.
          </p>
        </div>

        {/* Score Display */}
        <Card className="glass p-6 border-primary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Badge variant="outline" className="border-primary/30 text-xl px-4 py-2">
                <Trophy className="w-5 h-5 mr-2" />
                {totalScore} pts
              </Badge>
              {streak > 0 && (
                <Badge variant="outline" className="border-secondary/30 text-lg px-4 py-2 animate-pulse">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {streak}x Streak
                </Badge>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Progress</div>
              <div className="text-2xl font-bold text-primary">
                {currentPuzzleIndex + 1}/{puzzles.length}
              </div>
            </div>
          </div>
          <Progress value={((currentPuzzleIndex + 1) / puzzles.length) * 100} className="h-2 mt-4" />
        </Card>

        {/* Challenge */}
        <Card className="glass p-8 border-secondary/30 animate-scale-in">
          <div className="flex items-start gap-3 mb-8">
            <Target className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold">Challenge</h3>
                <Badge variant="outline" className="capitalize">
                  {currentPuzzle.type}
                </Badge>
              </div>
              <p className="text-lg leading-relaxed">{currentPuzzle.question}</p>
            </div>
          </div>

          {/* 3D Balloons */}
          <div className="min-h-[300px] flex items-center justify-center mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {currentPuzzle.options.map((option, index) => (
                <Balloon3D
                  key={option}
                  option={option}
                  color={balloonColors[index]}
                  onClick={() => handleBalloonClick(option)}
                  isCorrect={selectedAnswer === option && option === currentPuzzle.answer}
                  isPopped={poppedBalloons.has(option)}
                  disabled={selectedAnswer !== null}
                />
              ))}
            </div>
          </div>

          {/* AI vs Human Explanation */}
          {showExplanation && (
            <div className="space-y-4 animate-fade-in">
              <Tabs defaultValue="explanation" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="explanation">Explanation</TabsTrigger>
                  <TabsTrigger value="ai" className="gap-2">
                    <Cpu className="w-4 h-4" />
                    AI
                  </TabsTrigger>
                  <TabsTrigger value="human" className="gap-2">
                    <Brain className="w-4 h-4" />
                    Human
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="explanation" className="space-y-4">
                  <Card className="glass p-6 border-accent/30">
                    <p className="text-sm leading-relaxed">{currentPuzzle.explanation}</p>
                  </Card>
                </TabsContent>
                
                <TabsContent value="ai" className="space-y-4">
                  <Card className="glass p-6 border-primary/30">
                    <div className="flex items-start gap-3">
                      <Cpu className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-2 text-primary">AI Approach</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {currentPuzzle.aiApproach}
                        </p>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
                
                <TabsContent value="human" className="space-y-4">
                  <Card className="glass p-6 border-secondary/30">
                    <div className="flex items-start gap-3">
                      <Brain className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-2 text-secondary">Human Approach</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {currentPuzzle.humanApproach}
                        </p>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>

              <Button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-primary to-secondary"
                size="lg"
              >
                {currentPuzzleIndex < puzzles.length - 1 ? 'Next Challenge' : 'Complete Arena'}
              </Button>

              {currentPuzzleIndex >= puzzles.length - 1 && (
                <Link to="/leaderboard">
                  <Button variant="outline" className="w-full" size="lg">
                    <Trophy className="w-5 h-5 mr-2" />
                    View Leaderboard
                  </Button>
                </Link>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
