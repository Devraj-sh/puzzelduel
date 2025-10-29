import { useEffect, useRef } from "react";

interface Balloon3DProps {
  option: string;
  color: string;
  onClick: () => void;
  isCorrect?: boolean;
  isPopped?: boolean;
  disabled?: boolean;
}

export const Balloon3D = ({ 
  option, 
  color, 
  onClick, 
  isCorrect, 
  isPopped,
  disabled 
}: Balloon3DProps) => {
  const balloonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!balloonRef.current) return;

    // Floating animation
    const floatAnimation = () => {
      if (!balloonRef.current || isPopped) return;
      
      const randomDelay = Math.random() * 2;
      balloonRef.current.style.animationDelay = `${randomDelay}s`;
    };

    floatAnimation();
  }, [isPopped]);

  return (
    <div 
      ref={balloonRef}
      onClick={disabled ? undefined : onClick}
      className={`
        relative group cursor-pointer transition-all duration-500
        ${isPopped ? 'scale-0 opacity-0' : 'hover:scale-110 animate-float'}
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
      `}
      style={{
        animationDuration: '3s',
        animationTimingFunction: 'ease-in-out'
      }}
    >
      {/* Balloon body */}
      <div className={`
        relative w-32 h-40 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]
        ${color}
        shadow-2xl
        transition-all duration-300
        ${!isPopped && 'group-hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]'}
        ${isPopped ? 'animate-pop' : ''}
        flex items-center justify-center
      `}>
        {/* Shine effect */}
        <div className="absolute top-6 left-8 w-8 h-12 bg-white/40 rounded-full blur-md"></div>
        
        {/* Option text */}
        <div className="relative z-10 text-white font-bold text-xl px-4 text-center drop-shadow-lg">
          {option}
        </div>

        {/* Pop particles */}
        {isPopped && (
          <>
            <div className="absolute inset-0 animate-ping">
              <div className={`w-full h-full ${color} rounded-full opacity-75`}></div>
            </div>
          </>
        )}
      </div>

      {/* Balloon string */}
      {!isPopped && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0.5 h-16 bg-gradient-to-b from-gray-400 to-transparent"></div>
      )}

      {/* Correct/incorrect indicator */}
      {isPopped && isCorrect !== undefined && (
        <div className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          text-6xl animate-scale-in z-20
        `}>
          {isCorrect ? '✓' : '✗'}
        </div>
      )}
    </div>
  );
};
