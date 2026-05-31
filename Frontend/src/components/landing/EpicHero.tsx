import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Hyperspeed from '../effects/Hyperspeed';
import Galaxy from '../effects/Galaxy';
import { Button } from '../ui/Button';
import { Play, ArrowRight, Sparkles } from 'lucide-react';

export const EpicHero = () => {
  const [greeting, setGreeting] = useState('');
  const [effectMode, setEffectMode] = useState<'galaxy' | 'hyperspeed'>('galaxy');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const hyperspeedOptions = {
    onSpeedUp: () => {},
    onSlowDown: () => {},
    distortion: 'turbulentDistortion' as const,
    length: 400,
    roadWidth: 12,
    islandWidth: 2,
    lanesPerRoad: 3,
    fov: 90,
    fovSpeedUp: 150,
    speedUp: 2,
    carLightsFade: 0.4,
    totalSideLightSticks: 20,
    lightPairsPerRoadWay: 40,
    shoulderLinesWidthPercentage: 0.05,
    brokenLinesWidthPercentage: 0.1,
    brokenLinesLengthPercentage: 0.5,
    lightStickWidth: [0.12, 0.5] as [number, number],
    lightStickHeight: [1.3, 1.7] as [number, number],
    movingAwaySpeed: [60, 80] as [number, number],
    movingCloserSpeed: [-120, -160] as [number, number],
    carLightsLength: [12, 80] as [number, number],
    carLightsRadius: [0.05, 0.14] as [number, number],
    carWidthPercentage: [0.3, 0.5] as [number, number],
    carShiftX: [-0.8, 0.8] as [number, number],
    carFloorSeparation: [0, 5] as [number, number],
    colors: {
      roadColor: 0x0a0a1a,
      islandColor: 0x0d0d25,
      background: 0x050510,
      shoulderLines: 0x3b82f6,
      brokenLines: 0x60a5fa,
      leftCars: [0x8b5cf6, 0x6366f1, 0xa78bfa],
      rightCars: [0x06b6d4, 0x0ea5e9, 0x38bdf8],
      sticks: 0x3b82f6
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        {effectMode === 'galaxy' ? (
          <Galaxy
            density={1.2}
            glowIntensity={0.5}
            saturation={0.3}
            hueShift={220}
            mouseInteraction={true}
            mouseRepulsion={true}
            repulsionStrength={2.5}
            rotationSpeed={0.08}
            twinkleIntensity={0.4}
          />
        ) : (
          <Hyperspeed effectOptions={hyperspeedOptions} />
        )}
      </div>

      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

      <div className="absolute top-24 right-8 z-30">
        <div className="glass-card p-2 flex gap-2">
          <button
            onClick={() => setEffectMode('galaxy')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              effectMode === 'galaxy'
                ? 'bg-primary text-white shadow-glow'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Galaxy
          </button>
          <button
            onClick={() => setEffectMode('hyperspeed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              effectMode === 'hyperspeed'
                ? 'bg-primary text-white shadow-glow'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            <Play className="w-4 h-4 inline mr-2" />
            Hyperspeed
          </button>
        </div>
      </div>

      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-4">
            <span className="text-gradient">{greeting}</span>
            <br />
            <span className="text-white">Welcome to CodeMaster</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="text-xl md:text-2xl text-white/70 mb-8 max-w-2xl"
        >
          Master programming with AI-powered guidance, immersive learning, and real-world projects
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          className="flex gap-4"
        >
          <Button size="lg" className="gap-2 shadow-glow">
            <Play className="w-5 h-5" />
            Start Learning
          </Button>
          <Button variant="outline" size="lg" className="gap-2 glass">
            View Roadmap
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-8 md:gap-12 glass-card px-6 md:px-8 py-4"
        >
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-primary">500+</p>
            <p className="text-xs md:text-sm text-muted-foreground">Problems</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-green-400">50+</p>
            <p className="text-xs md:text-sm text-muted-foreground">Projects</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-yellow-400">10k+</p>
            <p className="text-xs md:text-sm text-muted-foreground">Students</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-purple-400">100+</p>
            <p className="text-xs md:text-sm text-muted-foreground">Jobs</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1 h-3 bg-white/50 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};