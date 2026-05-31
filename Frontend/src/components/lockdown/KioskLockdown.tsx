import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Lock, Timer } from 'lucide-react';
import { useLockdownStore } from '../../stores/lockdownStore';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

declare global {
  interface Window {
    electronAPI?: {
      startLockdown: (options?: { durationMinutes: number }) => Promise<boolean>;
      endLockdown: () => Promise<boolean>;
      getLockdownStatus: () => Promise<{ 
        isLocked: boolean; 
        focusTimerEnd: number | null; 
        remainingMs: number;
        lockdownStartTime: number | null;
      }>;
      onLockdownAutoEnded: (callback: () => void) => void;
      onLockdownForceEnded: (callback: () => void) => void;
      onLockdownRestore: (callback: (data: { isLocked: boolean; focusTimerEnd: number | null; remainingMs: number; lockdownStartTime: number | null }) => void) => void;
      onLockdownExitBlocked: (callback: () => void) => void;
      removeLockdownListener: () => void;
      removeAllLockdownListeners: () => void;
      clearCache?: () => Promise<boolean>;
    };
    reactNativeAPI?: {
      startLockTask: () => Promise<void>;
      stopLockTask: () => Promise<void>;
      isLockTaskActive: () => Promise<boolean>;
    };
  }
}

interface LockdownStats {
  exitAttempts: number;
  lastAttemptTime: number | null;
  warningCount: number;
}

export const KioskLockdown = () => {
  const store = useLockdownStore();
  const { 
    isLocked = false, 
    focusActive = false, 
    lockReason = '', 
    unlockQuiz = null, 
    unlockApp, 
    endFocus,
    focusEndTime,
    focusStartTime 
  } = store as any;

  const [stats, setStats] = useState<LockdownStats>({
    exitAttempts: 0,
    lastAttemptTime: null,
    warningCount: 0,
  });
  
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizError, setQuizError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('00:00');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEmergencyExit, setShowEmergencyExit] = useState(false);
  const [emergencyCountdown, setEmergencyCountdown] = useState(5);
  const [progressPercent, setProgressPercent] = useState(0);
  
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fullscreenCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const emergencyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emergencyIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wakeLockRef = useRef<any>(null);

  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;
  const isReactNative = typeof window !== 'undefined' && !!window.reactNativeAPI;
  const isWeb = !isElectron && !isReactNative;

  // FIXED: Only hide distractions, NEVER hide sidebar/header/main
  useEffect(() => {
    if (focusActive || isLocked) {
      document.body.classList.add('lockdown-active');
    } else {
      document.body.classList.remove('lockdown-active');
    }
    
    return () => {
      document.body.classList.remove('lockdown-active');
    };
  }, [focusActive, isLocked]);

  // Calculate time remaining
  useEffect(() => {
    if (!focusActive) {
      setTimeRemaining('00:00');
      setProgressPercent(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      
      if (focusEndTime) {
        const remaining = focusEndTime - now;
        
        if (remaining <= 0) {
          setTimeRemaining('00:00');
          setProgressPercent(100);
          endFocus?.();
          return;
        }

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeRemaining(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

        if (focusStartTime) {
          const total = focusEndTime - focusStartTime;
          const elapsed = now - focusStartTime;
          const percent = Math.max(0, Math.min(100, (elapsed / total) * 100));
          setProgressPercent(percent);
        }
      } else {
        setTimeRemaining('--:--');
      }
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [focusActive, focusEndTime, focusStartTime, endFocus]);

  // Core lockdown logic
  useEffect(() => {
    if (!focusActive) return;

    const triggerWarning = (message: string) => {
      setWarningMessage(message);
      setShowWarning(true);
      setStats(prev => ({
        ...prev,
        exitAttempts: prev.exitAttempts + 1,
        lastAttemptTime: Date.now(),
        warningCount: prev.warningCount + 1,
      }));

      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      warningTimeoutRef.current = setTimeout(() => {
        setShowWarning(false);
      }, 3000);
    };

    if (isElectron) {
      window.electronAPI?.startLockdown()?.then((result) => {
        console.log('[Lockdown] Electron lockdown started:', result);
      }).catch((err) => {
        console.error('[Lockdown] Failed to start Electron lockdown:', err);
      });
      return () => {};
    } 
    
    if (isReactNative) {
      window.reactNativeAPI?.startLockTask()?.catch(() => {});
      return () => {};
    }
    
    // Web lockdown
    const blockExit = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      triggerWarning('Exit blocked! Focus mode is active.');
    };

    const blockKeys = (e: KeyboardEvent) => {
      const blockedKeys = ['Escape', 'F11', 'F12', 'PrintScreen'];
      const ctrlBlocked = ['w', 'W', 't', 'T', 'n', 'N', 'r', 'R', 'd', 'D', 'q', 'Q'];
      const altBlocked = ['F4', 'Tab'];
      const metaBlocked = ['w', 'W', 't', 'T', 'n', 'N', 'h', 'H'];
      
      const isBlocked = 
        blockedKeys.includes(e.key) ||
        (e.ctrlKey && ctrlBlocked.includes(e.key)) ||
        (e.altKey && altBlocked.includes(e.key)) ||
        (e.metaKey && metaBlocked.includes(e.key)) ||
        (e.ctrlKey && e.shiftKey && e.key === 'i') ||
        (e.ctrlKey && e.shiftKey && e.key === 'j') ||
        (e.ctrlKey && e.shiftKey && e.key === 'c');

      if (isBlocked) {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning(`${e.key} is disabled during focus mode`);
      }
    };

    const requestFullscreen = () => {
      const elem = document.documentElement;
      if (elem && !document.fullscreenElement) {
        elem.requestFullscreen?.()?.catch(() => {});
        setIsFullscreen(true);
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement && focusActive) {
        triggerWarning('Fullscreen required for focus mode');
        setTimeout(requestFullscreen, 500);
      }
    };

    const blockContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerWarning('Right-click disabled during focus mode');
    };

    const blockVisibilityChange = () => {
      if (document.hidden && focusActive) {
        triggerWarning('Tab switching detected! Stay focused.');
      }
    };

    window.addEventListener('beforeunload', blockExit);
    window.addEventListener('keydown', blockKeys);
    window.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', blockVisibilityChange);

    requestFullscreen();

    fullscreenCheckRef.current = setInterval(() => {
      if (focusActive && !document.fullscreenElement) {
        requestFullscreen();
      }
    }, 2000);

    if ('wakeLock' in navigator) {
      (navigator as any).wakeLock.request('screen')
        .then((lock: any) => { wakeLockRef.current = lock; })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener('beforeunload', blockExit);
      window.removeEventListener('keydown', blockKeys);
      window.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', blockVisibilityChange);
      
      if (fullscreenCheckRef.current) {
        clearInterval(fullscreenCheckRef.current);
        fullscreenCheckRef.current = null;
      }
      
      if (wakeLockRef.current) {
        try {
          const releaseResult = wakeLockRef.current.release();
          if (releaseResult && typeof releaseResult.catch === 'function') {
            releaseResult.catch(() => {});
          }
        } catch {
          // Ignore release errors
        }
        wakeLockRef.current = null;
      }
    };
  }, [focusActive, isElectron, isReactNative]);

  // Cleanup on unlock
  useEffect(() => {
    if (!focusActive) {
      if (isElectron) {
        window.electronAPI?.endLockdown()?.then((result) => {
          console.log('[Lockdown] Electron lockdown ended:', result);
          window.electronAPI?.clearCache?.();
        }).catch((err) => {
          console.error('[Lockdown] Failed to end Electron lockdown:', err);
        });
      } else if (isReactNative) {
        window.reactNativeAPI?.stopLockTask()?.catch(() => {});
      } else if (document.fullscreenElement) {
        document.exitFullscreen?.()?.catch(() => {});
      }
      
      setStats({ exitAttempts: 0, lastAttemptTime: null, warningCount: 0 });
      setQuizAnswer('');
      setQuizError('');
      setShowEmergencyExit(false);
    }
  }, [focusActive, isElectron, isReactNative]);

  const handleUnlockAttempt = useCallback(() => {
    if (!unlockQuiz) return;

    const success = unlockApp?.(quizAnswer) ?? false;
    if (success) {
      setQuizAnswer('');
      setQuizError('');
      
      if (isElectron) {
        window.electronAPI?.endLockdown()?.catch(() => {});
      } else if (isReactNative) {
        window.reactNativeAPI?.stopLockTask()?.catch(() => {});
      }
      
      endFocus?.();
    } else {
      setQuizError('Incorrect answer. Try again.');
      setStats(prev => ({
        ...prev,
        exitAttempts: prev.exitAttempts + 1,
        lastAttemptTime: Date.now(),
      }));
    }
  }, [unlockQuiz, quizAnswer, unlockApp, endFocus, isElectron, isReactNative]);

  const handleEmergencyExit = useCallback(() => {
    if (showEmergencyExit) {
      setShowEmergencyExit(false);
      setEmergencyCountdown(5);
      if (emergencyTimeoutRef.current) clearTimeout(emergencyTimeoutRef.current);
      if (emergencyIntervalRef.current) clearInterval(emergencyIntervalRef.current);
    } else {
      setShowEmergencyExit(true);
      setEmergencyCountdown(5);
      
      emergencyIntervalRef.current = setInterval(() => {
        setEmergencyCountdown(prev => prev <= 1 ? 0 : prev - 1);
      }, 1000);
      
      emergencyTimeoutRef.current = setTimeout(() => {
        endFocus?.();
        setShowEmergencyExit(false);
        setEmergencyCountdown(5);
      }, 5000);
    }
  }, [showEmergencyExit, endFocus]);

  const attemptsRemaining = unlockQuiz ? (unlockQuiz.maxAttempts || 3) - (unlockQuiz.attempts || 0) : 3;

  if (!isLocked && !focusActive) return null;

  return (
    <>
      <AnimatePresence>
        {isLocked && unlockQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/98 backdrop-blur-xl flex items-center justify-center isolation-isolate"
            style={{ isolation: 'isolate' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="max-w-md w-full mx-4"
            >
              <div className="glass-heavy rounded-2xl border-2 border-red-500/30 shadow-2xl shadow-red-500/20 overflow-hidden">
                <div className="px-6 py-4 border-b border-red-500/20 bg-gradient-to-r from-red-500/10 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
                        <Lock className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-red-400">
                          {isElectron ? 'System Lockdown' : 'Focus Mode Active'}
                        </h2>
                        <p className="text-xs text-red-300/60">{lockReason || 'Focus session in progress'}</p>
                      </div>
                    </div>
                    <Timer className="w-5 h-5 text-red-400/60" />
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div className="text-center">
                    <div className="text-4xl font-mono font-bold text-red-400 mb-1">{timeRemaining}</div>
                    <div className="text-xs text-muted-foreground">remaining</div>
                  </div>

                  <div className="w-full h-2 bg-secondary/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-red-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-400">Exit Blocked</p>
                      <p className="text-xs text-muted-foreground mt-1">Complete the quiz to unlock</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Verification Question:</label>
                    <div className="p-3 bg-secondary/30 rounded-lg mb-3">
                      <p className="text-sm font-mono">{unlockQuiz.question}</p>
                    </div>
                    <input
                      type="text"
                      value={quizAnswer}
                      onChange={(e) => { setQuizAnswer(e.target.value); setQuizError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleUnlockAttempt()}
                      placeholder="Your answer..."
                      className={cn("w-full p-3 bg-background border rounded-lg", quizError ? "border-red-500" : "border-white/10")}
                    />
                    {quizError && <p className="text-xs text-red-400 mt-2">{quizError}</p>}
                  </div>

                  <Button onClick={handleUnlockAttempt} className="w-full bg-red-600 hover:bg-red-700" size="lg">
                    Verify & Unlock
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">Attempts: {attemptsRemaining}</p>
                  
                  {isElectron && (
                    <p className="text-[10px] text-center text-muted-foreground opacity-50">
                      Press Cmd/Ctrl+Shift+Alt+Q five times for emergency exit
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100000]"
          >
            <div className="glass-heavy px-6 py-3 rounded-full border border-red-500/30">
              <Shield className="w-4 h-4 text-red-400 inline mr-2" />
              <span className="text-sm text-red-400">{warningMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {focusActive && !isLocked && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 z-[9999] animate-pulse" />
      )}
    </>
  );
};