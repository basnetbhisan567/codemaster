import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Timer, Play, Pause } from 'lucide-react';
import { useLockdownStore } from '../../stores/lockdownStore';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

export const FocusTimer = () => {
  const { 
    focusActive, 
    startFocus, 
    endFocus, 
    todayFocusedMinutes, 
    dailyGoalMinutes,
    addFocusedTime 
  } = useLockdownStore();
  
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    let interval: number;
    
    if (focusActive) {
      interval = window.setInterval(() => {
        setSessionTime(prev => {
          const newTime = prev + 1;
          // Add to focused minutes every 60 seconds
          if (newTime % 60 === 0) {
            addFocusedTime(1);
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [focusActive, addFocusedTime]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = Math.min(100, (todayFocusedMinutes / dailyGoalMinutes) * 100);

  const handleToggleFocus = () => {
    if (focusActive) {
      endFocus();
      setSessionTime(0);
    } else {
      startFocus();
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <svg className="w-12 h-12 transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-secondary"
          />
          <motion.circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-primary"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress / 100 }}
            transition={{ duration: 0.5 }}
            style={{
              strokeDasharray: 125.6,
              strokeDashoffset: 125.6 * (1 - progress / 100),
            }}
          />
        </svg>
        <Timer className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5" />
      </div>

      <div className="flex flex-col">
        <div className="text-sm font-medium">
          {focusActive ? formatTime(sessionTime) : 'Focus Mode'}
        </div>
        <div className="text-xs text-muted-foreground">
          {todayFocusedMinutes}/{dailyGoalMinutes} min today
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleFocus}
        className={cn(
          'ml-2',
          focusActive && 'text-green-400 hover:text-green-500'
        )}
      >
        {focusActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>
    </div>
  );
};