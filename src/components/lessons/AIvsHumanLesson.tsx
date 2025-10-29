import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Cpu, Sparkles, Lightbulb, Zap, Users } from "lucide-react";
import { puzzles } from "@/data/puzzles";
import { useToast } from "@/hooks/use-toast";

interface AIvsHumanLessonProps {
  onComplete: () => void;
  lessonType: "pattern" | "riddle" | "math" | "logic";
  lessonNumber: number;
  title: string;
}

export const AIvsHumanLesson = ({ 
  onComplete, 
  lessonType, 
  lessonNumber, 
  title 
}: AIvsHumanLessonProps) => {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  const lessonPuzzles = puzzles.filter(p => p.type === lessonType).slice(0, 3);
  const currentPuzzle = lessonPuzzles[currentPuzzleIndex];

  const handleAnswerSelect = (option: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(option);
    
    const isCorrect = option === currentPuzzle.answer;
    if (isCorrect) {
      setScore(score + 1);
      toast({
        title: "Correct! 🎉",
        description: "Now see how AI vs Human thinks differently!",
      });
    } else {
      toast({
        title: "Not quite right",
        description: "Learn from both AI and Human approaches!",
        variant: "destructive",
      });
    }

    setTimeout(() => {
      setShowExplanation(true);
    }, 500);
  };

  const handleNext = () => {
    if (currentPuzzleIndex < lessonPuzzles.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      onComplete();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Card className="glass p-8 border-primary/30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-display font-bold text-gradient mb-2">
              {`Lesson ${lessonNumber}: ${title}`}
            </h2>
            <p className="text-muted-foreground">
              Learn how AI and humans solve {lessonType} problems differently
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Progress</div>
            <div className="text-2xl font-bold text-primary">
              {currentPuzzleIndex + 1}/{lessonPuzzles.length}
            </div>
            <div className="text-sm text-secondary">Score: {score}</div>
          </div>
        </div>

        {/* Puzzle Question */}
        <div className="glass p-6 rounded-lg border border-accent/30 mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-accent" />
            <h3 className="text-2xl font-semibold">Challenge</h3>
          </div>
          <p className="text-xl leading-relaxed font-medium">{currentPuzzle.question}</p>
        </div>

        {/* Options Grid */}
        {!showExplanation && (
          <div className="grid grid-cols-2 gap-4 mb-8 animate-fade-in">
            {currentPuzzle.options.map((option, index) => (
              <Button
                key={option}
                onClick={() => handleAnswerSelect(option)}
                disabled={selectedAnswer !== null}
                variant="outline"
                size="lg"
                className={`h-24 text-lg font-semibold transition-all duration-300 ${
                  selectedAnswer === option
                    ? option === currentPuzzle.answer
                      ? 'bg-primary/20 border-primary text-primary scale-105'
                      : 'bg-destructive/20 border-destructive text-destructive'
                    : 'hover:scale-105 hover:border-primary/50'
                }`}
              >
                {option}
              </Button>
            ))}
          </div>
        )}

        {/* AI vs Human Side-by-Side Comparison */}
        {showExplanation && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
                <Zap className="w-4 h-4" />
                <span className="font-semibold">AI vs Human: Different Thinking Styles</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* AI Approach */}
              <Card className="glass border-2 border-primary/40 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-glow"></div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Cpu className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-primary">AI Thinking</h4>
                      <p className="text-xs text-muted-foreground">Algorithmic & Data-Driven</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                      <p className="text-sm leading-relaxed">{currentPuzzle.aiApproach}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-primary/20">
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <Zap className="w-3 h-3" />
                      <span className="font-semibold">Strengths: Pattern Detection, Speed, Accuracy</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Human Approach */}
              <Card className="glass border-2 border-secondary/40 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-secondary-glow"></div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-secondary">Human Thinking</h4>
                      <p className="text-xs text-muted-foreground">Intuitive & Experience-Based</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
                      <p className="text-sm leading-relaxed">{currentPuzzle.humanApproach}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-secondary/20">
                    <div className="flex items-center gap-2 text-xs text-secondary">
                      <Users className="w-3 h-3" />
                      <span className="font-semibold">Strengths: Intuition, Context, Creativity</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Key Insight */}
            <Card className="glass p-6 border-2 border-accent/40 bg-gradient-to-br from-accent/5 to-transparent">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-2 text-accent">Key Learning</h4>
                  <p className="text-sm leading-relaxed">
                    {currentPuzzle.explanation}
                  </p>
                </div>
              </div>
            </Card>

            <Button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-primary via-accent to-secondary hover:shadow-lg hover:shadow-primary/20"
              size="lg"
            >
              {currentPuzzleIndex < lessonPuzzles.length - 1 
                ? 'Next Challenge →' 
                : '✓ Complete Lesson'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
