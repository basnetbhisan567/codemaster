import { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { triggerConfetti, triggerGlitch, triggerSuccessPulse } from '../../utils/effects';

interface ScoreGaugeProps {
  value: number;
  size?: number;
  animated?: boolean;
  onComplete?: () => void;
  showConfetti?: boolean;
  showGlitch?: boolean;
}

export const ScoreGauge = ({ 
  value, 
  size = 120, 
  animated = true,
  onComplete,
  showConfetti = false,
  showGlitch = false
}: ScoreGaugeProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const controls = useAnimation();
  const gaugeRef = useRef<HTMLDivElement>(null);
  
  const percentage = Math.min(100, Math.max(0, value));
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = (val: number) => {
    if (val >= 80) return '#22c55e';
    if (val >= 60) return '#eab308';
    return '#ef4444';
  };

  const getGlowColor = (val: number) => {
    if (val >= 80) return 'rgba(34, 197, 94, 0.3)';
    if (val >= 60) return 'rgba(234, 179, 8, 0.3)';
    return 'rgba(239, 68, 68, 0.3)';
  };

  useEffect(() => {
    if (animated && !hasAnimated) {
      controls.start({
        strokeDashoffset: offset,
        transition: { duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }
      });
      
      // Animate number
      let start = 0;
      const step = percentage / 60;
      const timer = setInterval(() => {
        start += step;
        if (start >= percentage) {
          setDisplayValue(percentage);
          clearInterval(timer);
          setHasAnimated(true);
          
          // Trigger effects on complete
          if (percentage >= 80) {
            if (showConfetti) {
              triggerConfetti(percentage >= 90 ? 'certification' : 'success');
            }
            if (showGlitch && gaugeRef.current) {
              triggerGlitch(gaugeRef.current);
            }
            if (gaugeRef.current) {
              triggerSuccessPulse(gaugeRef.current);
            }
          }
          
          onComplete?.();
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);
      
      return () => clearInterval(timer);
    } else {
      setDisplayValue(percentage);
      controls.set({ strokeDashoffset: offset });
    }
  }, [percentage, animated, hasAnimated, controls, offset, onComplete, showConfetti, showGlitch]);

  return (
    <motion.div 
      ref={gaugeRef}
      className="relative"
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Outer Glow */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{
          background: getGlowColor(percentage),
          transform: 'scale(1.2)',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1.1, 1.3, 1.1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-secondary/30"
        />
        
        {/* Animated Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(percentage)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={controls}
          style={{
            filter: `drop-shadow(0 0 8px ${getColor(percentage)})`,
          }}
        />
      </svg>
      
      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <motion.span 
          className="text-3xl font-bold"
          style={{ color: getColor(percentage) }}
          animate={{
            scale: displayValue >= 80 ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: displayValue >= 80 ? 2 : 0,
          }}
        >
          {Math.round(displayValue)}
        </motion.span>
        <span className="text-xs text-muted-foreground">SCORE</span>
      </div>
      
      {/* Success Particles */}
      {displayValue >= 80 && (
        <>
          <motion.div
            className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-green-400"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-2 -left-2 w-2 h-2 rounded-full bg-green-400"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
          />
          <motion.div
            className="absolute top-1/2 -right-3 w-2 h-2 rounded-full bg-green-400"
            animate={{
              scale: [0.8, 1.3, 0.8],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }}
          />
        </>
      )}
    </motion.div>
  );
};