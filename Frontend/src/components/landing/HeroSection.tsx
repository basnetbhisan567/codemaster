import { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Float, 
  MeshDistortMaterial, 
  MeshWobbleMaterial,
  Sphere,
  Torus,
  Sparkles,
  Environment
} from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// 🧬 Digital DNA Strand Component
const DigitalDNA = ({ scrollY = 0 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 40;
    const radius = 2.5;
    const height = 6;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 8;
      const y = (t - 0.5) * height;
      
      // Helix 1
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
      
      // Helix 2 (opposite)
      pts.push(new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius));
    }
    return pts;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.05) * 0.1;
      groupRef.current.position.y = -scrollY * 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      {points.map((point, i) => (
        <mesh key={i} position={[point.x, point.y, point.z]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial 
            color={i % 2 === 0 ? '#3b82f6' : '#8b5cf6'} 
            emissive={i % 2 === 0 ? '#1e3a8a' : '#4c1d95'}
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
};

// 💫 Floating Code Cubes
const CodeCubes = ({ count = 15 }) => {
  const cubes = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      position: [
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 5
      ] as [number, number, number],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ] as [number, number, number],
      scale: Math.random() * 0.5 + 0.3,
      speed: Math.random() * 0.5 + 0.2,
      color: Math.random() > 0.5 ? '#3b82f6' : '#8b5cf6'
    }));
  }, [count]);

  return (
    <>
      {cubes.map((cube, i) => (
        <Float key={i} speed={cube.speed} rotationIntensity={1.5} floatIntensity={0.8}>
          <mesh position={cube.position} rotation={cube.rotation} scale={cube.scale}>
            <boxGeometry args={[1, 1, 1]} />
            <MeshWobbleMaterial
              color={cube.color}
              factor={0.5}
              speed={2}
              transparent
              opacity={0.15}
              wireframe
            />
          </mesh>
        </Float>
      ))}
    </>
  );
};

// 🌟 Particle Field
const ParticleField = () => {
  const count = 2000;
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      const radius = 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      p[i] = Math.sin(phi) * Math.cos(theta) * radius;
      p[i + 1] = Math.sin(phi) * Math.sin(theta) * radius;
      p[i + 2] = Math.cos(phi) * radius;
    }
    return p;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.01) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#60a5fa"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// 🎯 Mouse-Responsive Core Sphere
const CoreSphere = ({ mouse }: { mouse: { x: number; y: number } }) => {
  const sphereRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += (mouse.x * 2 - groupRef.current.rotation.y) * 0.05;
      groupRef.current.rotation.x += (mouse.y * 1.5 - groupRef.current.rotation.x) * 0.05;
    }
    if (sphereRef.current) {
      sphereRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <Sphere ref={sphereRef} args={[1.2, 64, 64]}>
        <MeshDistortMaterial
          color="#3b82f6"
          distort={0.4}
          speed={1.5}
          roughness={0.2}
          metalness={0.8}
          emissive="#1e3a8a"
          emissiveIntensity={0.5}
        />
      </Sphere>
      
      <Torus args={[1.8, 0.03, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#60a5fa" emissive="#2563eb" emissiveIntensity={0.5} wireframe />
      </Torus>
      <Torus args={[2.0, 0.02, 16, 100]} rotation={[Math.PI / 3, 0, 0]}>
        <meshStandardMaterial color="#8b5cf6" emissive="#6d28d9" emissiveIntensity={0.3} wireframe />
      </Torus>
      <Torus args={[2.2, 0.02, 16, 100]} rotation={[Math.PI / 4, Math.PI / 2, 0]}>
        <meshStandardMaterial color="#3b82f6" emissive="#1e3a8a" emissiveIntensity={0.4} wireframe />
      </Torus>
    </group>
  );
};

// 🎨 Scene Content
const SceneContent = ({ scrollY = 0, mouseRef }: { scrollY: number; mouseRef: React.MutableRefObject<{ x: number; y: number }> }) => {
  return (
    <>
      <color attach="background" args={['#0a0f1a']} />
      <fog attach="fog" args={['#0a0f1a', 8, 20]} />
      
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#3b82f6" />
      <pointLight position={[-10, -5, -10]} intensity={0.3} color="#8b5cf6" />
      <spotLight position={[0, 5, 10]} angle={0.3} penumbra={1} intensity={1} color="#60a5fa" />
      
      <DigitalDNA scrollY={scrollY} />
      <CodeCubes count={12} />
      <ParticleField />
      <CoreSphere mouse={mouseRef.current} />
      <Sparkles count={200} scale={10} size={2} speed={0.3} color="#60a5fa" />
      
      <Environment preset="night" />
    </>
  );
};

// 📦 Main Hero Component
export const HeroSection = () => {
  const hours = new Date().getHours();
  const greeting = hours < 12 ? 'Good Morning' : hours < 18 ? 'Good Afternoon' : 'Good Evening';
  const [scrollY, setScrollY] = useState(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      };
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
        >
          <Suspense fallback={null}>
            <SceneContent scrollY={scrollY} mouseRef={mouseRef} />
          </Suspense>
        </Canvas>
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-background/20 to-background/80 pointer-events-none" />
      
      {/* Content Overlay */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
              {greeting}
            </span>
            <span className="text-white">, Developer!</span>
          </h1>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="text-xl md:text-2xl text-white/70 mb-8"
        >
          Ready to code today?
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          className="flex gap-4"
        >
          <button className="px-8 py-3 bg-primary text-white rounded-xl font-medium hover:scale-105 transition-transform shadow-lg shadow-primary/30">
            Start Coding
          </button>
          <button className="px-8 py-3 glass text-white rounded-xl font-medium hover:scale-105 transition-transform">
            View Roadmap
          </button>
        </motion.div>
        
        {/* Scroll Indicator */}
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