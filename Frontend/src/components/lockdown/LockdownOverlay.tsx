import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLockdownStore } from '../../stores/lockdownStore';
import { BlockedContent } from './BlockedContent';
import { ExitVerification } from './ExitVerification';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

export const LockdownOverlay = () => {
  const { isLocked, lockReason, unlockQuiz } = useLockdownStore();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isLocked) {
      // Apply grayscale/frosted filter to main app
      const appElement = document.getElementById('app-root');
      if (appElement) {
        appElement.style.filter = 'grayscale(0.8) blur(4px) brightness(0.6)';
        appElement.style.transition = 'filter 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      }

      // Show content after shutter animation
      const timer = setTimeout(() => setShowContent(true), 600);
      return () => clearTimeout(timer);
    } else {
      // Remove filters when unlocked
      const appElement = document.getElementById('app-root');
      if (appElement) {
        appElement.style.filter = 'none';
      }
      setShowContent(false);
    }
  }, [isLocked]);

  return (
    <AnimatePresence>
      {isLocked && (
        <>
          {/* SVG Filters for Frosted Glass Effect */}
          <svg className="hidden">
            <defs>
              <filter id="frosted-glass" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
                <feColorMatrix
                  in="blur"
                  mode="matrix"
                  values="
                    0.3 0.3 0.3 0 0
                    0.3 0.3 0.3 0 0
                    0.3 0.3 0.3 0 0
                    0 0 0 0.6 0"
                  result="frosted"
                />
                <feComposite in="SourceGraphic" in2="frosted" operator="over" />
              </filter>
              
              <filter id="noise">
                <feTurbulence 
                  type="fractalNoise" 
                  baseFrequency="0.65" 
                  numOctaves="3" 
                  stitchTiles="stitch"
                />
                <feColorMatrix type="saturate" values="0" />
              </filter>
              
              <filter id="scanline">
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.1" intercept="0" />
                </feComponentTransfer>
              </filter>
            </defs>
          </svg>

          {/* Shutter Animation - Top Bar */}
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ 
              type: 'spring', 
              stiffness: 100, 
              damping: 20,
              mass: 1.5
            }}
            className="fixed top-0 left-0 right-0 h-[50vh] z-[10000]"
            style={{
              background: 'linear-gradient(180deg, #0a0f1a 0%, rgba(10, 15, 26, 0.95) 100%)',
              borderBottom: '2px solid rgba(239, 68, 68, 0.3)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Lock Icon on Shutter */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2"
            >
              <div className="flex items-center gap-2 text-red-500/80">
                <Lock className="w-6 h-6" />
                <span className="text-sm font-mono tracking-wider">LOCKDOWN ACTIVE</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Shutter Animation - Bottom Bar */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ 
              type: 'spring', 
              stiffness: 100, 
              damping: 20,
              mass: 1.5
            }}
            className="fixed bottom-0 left-0 right-0 h-[50vh] z-[10000]"
            style={{
              background: 'linear-gradient(0deg, #0a0f1a 0%, rgba(10, 15, 26, 0.95) 100%)',
              borderTop: '2px solid rgba(239, 68, 68, 0.3)',
              boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.5)',
            }}
          />

          {/* Noise Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.03 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
            className="fixed inset-0 z-[10001] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Scanline Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.05 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
            className="fixed inset-0 z-[10001] pointer-events-none"
            style={{
              background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0px, transparent 2px, transparent 4px)',
            }}
          />

          {/* Warning Lights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ 
              delay: 0.8,
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="fixed top-4 left-4 z-[10002] flex items-center gap-2"
          >
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-500/80 text-xs font-mono tracking-wider">SECURITY LOCK</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ 
              delay: 0.8,
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="fixed top-4 right-4 z-[10002] flex items-center gap-2"
          >
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-500/80 text-xs font-mono tracking-wider">FOCUS MODE</span>
          </motion.div>

          {/* Main Content Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: showContent ? 1 : 0,
              scale: showContent ? 1 : 0.9,
              y: showContent ? 0 : 20
            }}
            transition={{ 
              type: 'spring',
              stiffness: 300,
              damping: 30,
              delay: 0.4
            }}
            className="fixed inset-0 z-[10002] flex items-center justify-center p-4"
          >
            <div className="relative max-w-md w-full">
              {/* Red Glow Behind Modal */}
              <div 
                className="absolute inset-0 bg-red-500/20 blur-3xl rounded-2xl"
                style={{ transform: 'scale(1.2)' }}
              />
              
              {/* Modal Content */}
              <div className="relative glass-heavy rounded-2xl border-2 border-red-500/30 shadow-2xl shadow-red-500/20 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-red-500/20 bg-gradient-to-r from-red-500/10 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
                      <Shield className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-red-400">System Lockdown</h2>
                      <p className="text-xs text-red-300/60">Focus Mode Active</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {unlockQuiz ? (
                    <ExitVerification />
                  ) : (
                    <BlockedContent reason={lockReason || 'Focus mode is active'} />
                  )}
                </div>

                {/* Footer Warning */}
                <div className="px-6 py-3 border-t border-red-500/20 bg-black/20">
                  <div className="flex items-center justify-center gap-2 text-xs text-red-400/60">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Complete your daily goal to unlock</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Corner Brackets */}
          <CornerBracket position="top-left" delay={0.6} />
          <CornerBracket position="top-right" delay={0.6} />
          <CornerBracket position="bottom-left" delay={0.6} />
          <CornerBracket position="bottom-right" delay={0.6} />
        </>
      )}
    </AnimatePresence>
  );
};

// Corner Bracket Component
const CornerBracket = ({ position, delay }: { position: string; delay: number }) => {
  const getStyles = () => {
    switch (position) {
      case 'top-left':
        return 'top-8 left-8 border-t-2 border-l-2';
      case 'top-right':
        return 'top-8 right-8 border-t-2 border-r-2';
      case 'bottom-left':
        return 'bottom-8 left-8 border-b-2 border-l-2';
      case 'bottom-right':
        return 'bottom-8 right-8 border-b-2 border-r-2';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      className={`fixed w-12 h-12 z-[10002] border-red-500/30 ${getStyles()}`}
    />
  );
};