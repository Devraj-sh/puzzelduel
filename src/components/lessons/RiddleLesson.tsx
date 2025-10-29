import { AIvsHumanLesson } from "./AIvsHumanLesson";

interface RiddleLessonProps {
  onComplete: () => void;
}

export const RiddleLesson = ({ onComplete }: RiddleLessonProps) => {
  return (
    <AIvsHumanLesson
      onComplete={onComplete}
      lessonType="riddle"
      lessonNumber={2}
      title="Riddle Reasoning"
    />
  );
};
