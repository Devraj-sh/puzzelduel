import { AIvsHumanLesson } from "./AIvsHumanLesson";

interface MathLessonProps {
  onComplete: () => void;
}

export const MathLesson = ({ onComplete }: MathLessonProps) => {
  return (
    <AIvsHumanLesson
      onComplete={onComplete}
      lessonType="math"
      lessonNumber={3}
      title="Mathematical Thinking"
    />
  );
};
