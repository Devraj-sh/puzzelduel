import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Sparkles, ArrowRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { AIOrb } from "./AIOrb";
import { PatternLesson } from "./lessons/PatternLesson";
import { RiddleLesson } from "./lessons/RiddleLesson";
import { MathLesson } from "./lessons/MathLesson";
import { LogicLesson } from "./lessons/LogicLesson";
import { EthicsLesson } from "./lessons/EthicsLesson";

const lessons = [
  { id: 1, title: "Pattern Recognition", component: PatternLesson, icon: "🎯" },
  { id: 2, title: "Riddle Reasoning", component: RiddleLesson, icon: "🧩" },
  { id: 3, title: "Mathematical Thinking", component: MathLesson, icon: "🔢" },
  { id: 4, title: "Logical Reasoning", component: LogicLesson, icon: "🧠" },
  { id: 5, title: "AI vs Human Mastery", component: EthicsLesson, icon: "⚖️" },
];

export const LearningPhase = () => {
  const [currentLesson, setCurrentLesson] = useState<number | null>(null);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const handleLessonComplete = (lessonId: number) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons([...completedLessons, lessonId]);
    }
    // Move to next lesson or back to overview
    const nextLesson = lessons.find(l => l.id === lessonId + 1);
    if (nextLesson) {
      setCurrentLesson(nextLesson.id);
    } else {
      setCurrentLesson(null);
    }
  };

  const progress = (completedLessons.length / lessons.length) * 100;

  if (currentLesson !== null) {
    const lesson = lessons.find(l => l.id === currentLesson);
    if (!lesson) return null;

    const LessonComponent = lesson.component;
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="outline" 
              onClick={() => setCurrentLesson(null)}
              className="border-primary/30 hover:border-primary/50"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Lessons
            </Button>
            <div className="text-sm text-muted-foreground">
              Lesson {currentLesson} of {lessons.length}
            </div>
          </div>
          
          <LessonComponent 
            onComplete={() => handleLessonComplete(currentLesson)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <Link to="/">
            <Button variant="outline" className="mb-4 border-primary/30 hover:border-primary/50">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Learning Phase</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-display font-black text-gradient">
            Learn to Command the AI
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Master prompt engineering through 5 interactive lessons. Each lesson teaches you core concepts through hands-on experimentation.
          </p>

          {/* Progress */}
          <div className="max-w-md mx-auto pt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-primary font-bold">{completedLessons.length}/{lessons.length} Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* AI Orb Display */}
        <div className="flex justify-center animate-scale-in">
          <AIOrb mood="neutral" intensity={0.8} />
        </div>

        {/* Lessons Grid */}
        <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up">
          {lessons.map((lesson, index) => {
            const isCompleted = completedLessons.includes(lesson.id);
            const isLocked = index > 0 && !completedLessons.includes(lessons[index - 1].id);

            return (
              <Card
                key={lesson.id}
                className={`glass p-6 border-2 transition-all duration-300 cursor-pointer group ${
                  isCompleted
                    ? 'border-primary/50 hover:border-primary'
                    : isLocked
                    ? 'border-muted/20 opacity-50 cursor-not-allowed'
                    : 'border-secondary/30 hover:border-secondary/60 hover:shadow-lg hover:shadow-secondary/20'
                }`}
                onClick={() => !isLocked && setCurrentLesson(lesson.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{lesson.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-display font-bold">
                        Lesson {lesson.id}
                      </h3>
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      ) : isLocked ? (
                        <Circle className="w-6 h-6 text-muted" />
                      ) : (
                        <Circle className="w-6 h-6 text-secondary" />
                      )}
                    </div>
                    <h4 className="text-lg font-semibold mb-2">{lesson.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {getLessonDescription(lesson.id)}
                    </p>
                    {!isLocked && (
                      <Button 
                        size="sm"
                        variant={isCompleted ? "outline" : "default"}
                        className={`w-full group-hover:translate-x-1 transition-transform ${
                          !isCompleted && 'bg-gradient-to-r from-secondary to-secondary-glow'
                        }`}
                      >
                        {isCompleted ? 'Review Lesson' : 'Start Lesson'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Completion Message */}
        {completedLessons.length === lessons.length && (
          <Card className="glass border-primary/50 p-8 text-center animate-scale-in">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-3xl font-display font-bold text-gradient mb-4">
              Congratulations!
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              You've completed all lessons. Ready to test your skills in the Arena?
            </p>
            <Link to="/arena">
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary">
                <Sparkles className="w-5 h-5 mr-2" />
                Enter the Arena
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
};

function getLessonDescription(id: number): string {
  const descriptions = {
    1: "Learn how AI detects patterns through algorithms vs how humans recognize them visually.",
    2: "Discover the difference between AI's semantic analysis and human wordplay understanding.",
    3: "Compare AI's mathematical formulas with human mental arithmetic and proportional reasoning.",
    4: "Understand AI's formal logic rules versus human common sense and natural language.",
    5: "Master the complete understanding of AI vs human problem-solving approaches.",
  };
  return descriptions[id as keyof typeof descriptions] || "";
}
