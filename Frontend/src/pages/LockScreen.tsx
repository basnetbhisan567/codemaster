import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Timer, Brain, Focus, AlarmClock, Zap, Shield,
  X, Check, AlertTriangle, RefreshCw, Coffee,
  Play, Pause, StopCircle, BarChart3, Target, Award,
  ChevronRight, Sparkles, Moon, Sun, TrendingUp
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';

// ============================================
// TYPES
// ============================================
interface FocusSession {
  id: number;
  start_time: string;
  end_time?: string;
  target_minutes: number;
  actual_minutes: number;
  completed: boolean;
  remaining_seconds: number;
}

interface LockdownStatus {
  is_locked: boolean;
  lock_reason: string;
  quiz_question?: string;
  attempts_remaining: number;
}

interface FocusStats {
  total_sessions: number;
  total_minutes: number;
  completed_sessions: number;
  current_streak: number;
  today_minutes: number;
}

// ============================================
// CONSTANTS
// ============================================
const FOCUS_OPTIONS = [
  { label: 'Quick', minutes: 15, icon: Zap, color: 'from-yellow-500 to-orange-500' },
  { label: 'Standard', minutes: 25, icon: Brain, color: 'from-blue-500 to-cyan-500' },
  { label: 'Deep', minutes: 45, icon: Focus, color: 'from-purple-500 to-pink-500' },
  { label: 'Ultra', minutes: 90, icon: Target, color: 'from-green-500 to-emerald-500' },
];

// ============================================
// MAIN COMPONENT
// ============================================
export default function FocusMode() {
  const [isLocked, setIsLocked] = useState(false);
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [lockdownStatus, setLockdownStatus] = useState<LockdownStatus | null>(null);
  const [stats, setStats] = useState<FocusStats | null>(null);
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizMessage, setQuizMessage] = useState('');
  const [quizError, setQuizError] = useState(false);
  const [exitAttempts, setExitAttempts] = useState(0);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  // ============================================
  // BROWSER LOCKDOWN LOGIC
  // ============================================
  const enterFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    } else if ((el as any).webkitRequestFullscreen) {
      (el as any).webkitRequestFullscreen();
    } else if ((el as any).msRequestFullscreen) {
      (el as any).msRequestFullscreen();
    }
  }, []);

  const lockBrowser = useCallback(() => {
    enterFullscreen();
    setIsLocked(true);
    setShowExitWarning(false);
  }, [enterFullscreen]);

  // Block ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLocked) return;

      // Block ESC
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setExitAttempts(prev => prev + 1);
        setShowExitWarning(true);
        return;
      }

      // Block Alt+Tab / Alt+F4 / Ctrl+W / Ctrl+T
      if (
        (e.altKey && (e.key === 'Tab' || e.key === 'F4')) ||
        (e.ctrlKey && (e.key === 'w' || e.key === 'W' || e.key === 't' || e.key === 'T')) ||
        (e.metaKey && (e.key === 'w' || e.key === 'W'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        setExitAttempts(prev => prev + 1);
        setShowExitWarning(true);
        return;
      }

      // Block F11 (fullscreen toggle)
      if (e.key === 'F11') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isLocked]);

  // Block right-click
  useEffect(() => {
    if (!isLocked) return;
    const blockContext = (e: MouseEvent) => {
      e.preventDefault();
      setExitAttempts(prev => prev + 1);
      setShowExitWarning(true);
    };
    window.addEventListener('contextmenu', blockContext);
    return () => window.removeEventListener('contextmenu', blockContext);
  }, [isLocked]);

  // Detect fullscreen exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isLocked) {
        setExitAttempts(prev => prev + 1);
        setShowExitWarning(true);
        // Re-enter fullscreen after a brief delay
        setTimeout(() => enterFullscreen(), 500);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [isLocked, enterFullscreen]);

  // Warn before unload
  useEffect(() => {
    if (!isLocked) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      setExitAttempts(prev => prev + 1);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isLocked]);

  // ============================================
  // TIMER LOGIC
  // ============================================
  useEffect(() => {
    if (!activeSession || activeSession.completed) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(activeSession.start_time).getTime()) / 1000);
      const total = activeSession.target_minutes * 60;
      const remaining = Math.max(0, total - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        handleFocusComplete();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  // ============================================
  // API CALLS
  // ============================================
  const fetchActiveSession = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:5000/api/v1/lockscreen/focus/active', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setActiveSession(data);
        const elapsed = Math.floor((Date.now() - new Date(data.start_time).getTime()) / 1000);
        const remaining = Math.max(0, (data.target_minutes * 60) - elapsed);
        setTimeRemaining(remaining);
        lockBrowser();
      }
    } catch {}
  }, [lockBrowser]);

  const fetchLockdownStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:5000/api/v1/lockscreen/lockdown/status', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLockdownStatus(data);
        if (data.is_locked) {
          lockBrowser();
        }
      }
    } catch {}
  }, [lockBrowser]);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:5000/api/v1/lockscreen/focus/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchActiveSession();
    fetchLockdownStatus();
    fetchStats();
  }, []);

  // ============================================
  // HANDLERS
  // ============================================
  const handleStartFocus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:5000/api/v1/lockscreen/focus/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ target_minutes: selectedMinutes }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveSession(data);
        setTimeRemaining(data.target_minutes * 60);
        lockBrowser();
        fetchLockdownStatus();
      }
    } catch (err) {
      console.error('Failed to start focus:', err);
    }
  };

  const handleFocusComplete = async () => {
    if (!activeSession) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:5000/api/v1/lockscreen/focus/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          session_id: activeSession.id,
          actual_minutes: activeSession.target_minutes,
        }),
      });
      if (res.ok) {
        setActiveSession(null);
        setIsLocked(false);
        setExitAttempts(0);
        setShowExitWarning(false);
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to end focus:', err);
    }
  };

  const handleAttemptUnlock = async () => {
    if (!quizAnswer.trim()) {
      setQuizError(true);
      setQuizMessage('Please enter an answer');
      return;
    }
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:5000/api/v1/lockscreen/lockdown/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ answer: quizAnswer }),
      });
      const data = await res.json();
      setQuizMessage(data.message);
      setQuizError(!data.success);

      if (data.success) {
        setIsLocked(false);
        setActiveSession(null);
        setShowExitWarning(false);
        setExitAttempts(0);
        fetchLockdownStatus();
      }
      setQuizAnswer('');
    } catch (err) {
      setQuizError(true);
      setQuizMessage('Failed to verify answer');
    }
  };

  const handleGiveUp = () => {
    setShowExitWarning(false);
    setExitAttempts(prev => prev + 1);
  };

  // ============================================
  // FORMAT TIME
  // ============================================
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = activeSession
    ? Math.min(100, ((activeSession.target_minutes * 60 - timeRemaining) / (activeSession.target_minutes * 60)) * 100)
    : 0;

  // ============================================
  // RENDER
  // ============================================
  return (
    <div ref={fullscreenRef} className="min-h-screen bg-[#0D1117]">
      {/* Exit Warning Overlay */}
      <AnimatePresence>
        {showExitWarning && isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-md w-full bg-[#161B22] border border-[#30363D] rounded-2xl p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Stay Focused!</h2>
              <p className="text-[#8B949E] text-sm mb-2">
                You've attempted to exit {exitAttempts} time{exitAttempts > 1 ? 's' : ''}.
              </p>
              <p className="text-[#6E7681] text-xs mb-6">
                To unlock, answer the coding challenge below.
              </p>

              {lockdownStatus?.quiz_question && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2 justify-center">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">
                      {lockdownStatus.quiz_question}
                    </span>
                  </div>
                  <Input
                    value={quizAnswer}
                    onChange={(e) => { setQuizAnswer(e.target.value); setQuizError(false); }}
                    placeholder="Your answer..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAttemptUnlock()}
                    className={`text-center bg-[#0D1117] border-[#30363D] ${quizError ? 'border-red-500' : ''}`}
                  />
                  {quizMessage && (
                    <p className={`text-xs mt-2 ${quizError ? 'text-red-400' : 'text-green-400'}`}>
                      {quizMessage}
                    </p>
                  )}
                  <p className="text-xs text-[#6E7681] mt-1">
                    {lockdownStatus.attempts_remaining} attempts remaining
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={handleAttemptUnlock} className="flex-1 gap-2">
                  <Check className="w-4 h-4" /> Unlock
                </Button>
                <Button variant="ghost" onClick={handleGiveUp} className="gap-2 text-[#6E7681]">
                  <X className="w-4 h-4" /> Stay Locked
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#58A6FF] to-[#BC8CFF] bg-clip-text text-transparent">
              Focus Mode
            </h1>
            <p className="text-[#8B949E] text-sm mt-1">
              Lock in. Eliminate distractions. Build the habit.
            </p>
          </div>
          {!isLocked && (
            <Button variant="outline" onClick={() => fetchStats()} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          )}
        </div>

        {/* Active Lockdown Banner */}
        {isLocked && activeSession && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 font-semibold text-sm">LOCKDOWN ACTIVE</span>
              <span className="text-[#8B949E] text-xs">
                Browser locked • ESC blocked • Alt+Tab blocked
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#6E7681] text-xs">
              <Shield className="w-4 h-4" />
              {exitAttempts} exit attempt{exitAttempts !== 1 ? 's' : ''}
            </div>
          </motion.div>
        )}

        {/* Main Timer or Setup */}
        {!isLocked && !activeSession ? (
          <div className="space-y-8">
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Timer, label: 'Sessions', value: stats.total_sessions, color: 'text-blue-400' },
                  { icon: Target, label: 'Completed', value: stats.completed_sessions, color: 'text-green-400' },
                  { icon: AlarmClock, label: 'Total Minutes', value: stats.total_minutes, color: 'text-purple-400' },
                  { icon: TrendingUp, label: 'Today', value: `${stats.today_minutes}m`, color: 'text-yellow-400' },
                ].map((s, i) => (
                  <Card key={i} variant="glass" className="p-4 text-center bg-[#161B22] border-[#30363D]">
                    <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
                    <p className="text-2xl font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {s.value}
                    </p>
                    <p className="text-xs text-[#8B949E]">{s.label}</p>
                  </Card>
                ))}
              </div>
            )}

            {/* Focus Duration Selector */}
            <Card variant="glass" className="p-8 bg-[#161B22] border-[#30363D]">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#58A6FF]/20 to-[#BC8CFF]/20 flex items-center justify-center mx-auto mb-4">
                  <Focus className="w-8 h-8 text-[#58A6FF]" />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">Start Focus Session</h2>
                <p className="text-sm text-[#8B949E]">Choose your focus duration</p>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-8">
                {FOCUS_OPTIONS.map((opt) => (
                  <motion.button
                    key={opt.minutes}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedMinutes(opt.minutes)}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      selectedMinutes === opt.minutes
                        ? 'border-[#58A6FF] bg-[#58A6FF]/10'
                        : 'border-[#30363D] hover:border-[#30363D]/50 bg-[#0D1117]'
                    }`}
                  >
                    <opt.icon className={`w-6 h-6 mx-auto mb-2 ${
                      selectedMinutes === opt.minutes ? 'text-[#58A6FF]' : 'text-[#8B949E]'
                    }`} />
                    <p className="text-lg font-bold text-white">{opt.minutes}</p>
                    <p className="text-xs text-[#8B949E]">{opt.label}</p>
                  </motion.button>
                ))}
              </div>

              <Button
                onClick={handleStartFocus}
                className="w-full py-6 text-lg font-bold gap-3 bg-gradient-to-r from-[#2EA44F] to-[#238636] hover:from-[#2C974B] hover:to-[#1F7A30]"
              >
                <Lock className="w-5 h-5" />
                Lock In & Start Focus
              </Button>

              <p className="text-xs text-[#6E7681] text-center mt-4">
                Your browser will be locked. Notifications, ESC key, and Alt+Tab will be blocked.
              </p>
            </Card>
          </div>
        ) : activeSession ? (
          /* Active Focus Timer */
          <Card variant="glass" className="p-8 bg-[#161B22] border-[#30363D] text-center">
            <motion.div
              animate={{ scale: timeRemaining <= 60 ? [1, 1.05, 1] : 1 }}
              transition={{ repeat: timeRemaining <= 60 ? Infinity : 0, duration: 1 }}
              className="mb-8"
            >
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#30363D" strokeWidth="6" />
                  <circle
                    cx="50" cy="50" r="45" fill="none"
                    stroke={timeRemaining <= 60 ? '#F85149' : '#2EA44F'}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercent / 100)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="text-5xl font-bold text-white"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {formatTime(timeRemaining)}
                  </span>
                  <span className="text-xs text-[#8B949E] mt-1">remaining</span>
                </div>
              </div>
            </motion.div>

            <div className="flex items-center justify-center gap-2 mb-6">
              <Badge variant={timeRemaining <= 60 ? 'error' : 'success'} size="sm">
                {timeRemaining <= 60 ? 'Almost done!' : 'In progress'}
              </Badge>
              <Badge variant="outline" size="sm">
                {activeSession.target_minutes} min target
              </Badge>
            </div>

            <p className="text-[#8B949E] text-sm">
              Stay focused. Your browser is locked. Coding challenges await on unlock.
            </p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}