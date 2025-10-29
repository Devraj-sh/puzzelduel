import { AIvsHumanLesson } from "./AIvsHumanLesson";

interface PatternLessonProps {
  onComplete: () => void;
}

export const PatternLesson = ({ onComplete }: PatternLessonProps) => {
  return (
    <AIvsHumanLesson
      onComplete={onComplete}
      lessonType="pattern"
      lessonNumber={1}
      title="Pattern Recognition"
    />
  );
};
