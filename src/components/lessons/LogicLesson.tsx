import { AIvsHumanLesson } from "./AIvsHumanLesson";

interface LogicLessonProps {
  onComplete: () => void;
}

export const LogicLesson = ({ onComplete }: LogicLessonProps) => {
  return (
    <AIvsHumanLesson
      onComplete={onComplete}
      lessonType="logic"
      lessonNumber={4}
      title="Logical Reasoning"
    />
  );
};
