import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './Hyperspeed.css';

const Hyperspeed = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene - Deep space/coding theme
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e17);
    scene.fog = new THREE.FogExp2(0x0a0e17, 0.0015);

    // Camera
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    camera.position.set(0, 2.2, 7);
    camera.lookAt(0, 0, -15);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // === CODE ROAD ===
    const roadGeo = new THREE.PlaneGeometry(16, 150);
    const roadMat = new THREE.MeshStandardMaterial({ 
      color: 0x0d1117, 
      side: THREE.DoubleSide,
      roughness: 0.6,
      metalness: 0.2,
      emissive: new THREE.Color(0x0a0e17)
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = Math.PI / 2;
    road.position.z = -50;
    road.position.y = -0.1;
    scene.add(road);

    // === GRID LINES (Like code editor grid) ===
    const gridMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e3a8a, 
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.6
    });
    
    const gridLines: THREE.Mesh[] = [];
    
    // Horizontal grid lines (like code lines)
    for (let z = -80; z < 30; z += 2) {
      const lineGeo = new THREE.BoxGeometry(0.15, 0.03, 1.2);
      const line = new THREE.Mesh(lineGeo, gridMat.clone());
      line.position.set(0, 0.05, z);
      scene.add(line);
      gridLines.push(line);
    }
    
    // Side brackets (like code braces)
    const bracketMat = new THREE.MeshStandardMaterial({ 
      color: 0x3b82f6, 
      emissive: 0x2563eb,
      emissiveIntensity: 0.8
    });
    
    for (let z = -80; z < 30; z += 3) {
      // Left bracket <
      const leftBracket = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.8), bracketMat.clone());
      leftBracket.position.set(-2.5, 0.05, z);
      scene.add(leftBracket);
      gridLines.push(leftBracket);
      
      // Left angle
      const leftAngle = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.05, 1.2), bracketMat.clone());
      leftAngle.position.set(-3, 0.05, z - 0.5);
      leftAngle.rotation.y = 0.3;
      scene.add(leftAngle);
      gridLines.push(leftAngle);
      
      // Right bracket >
      const rightBracket = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.8), bracketMat.clone());
      rightBracket.position.set(2.5, 0.05, z);
      scene.add(rightBracket);
      gridLines.push(rightBracket);
      
      // Right angle
      const rightAngle = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.05, 1.2), bracketMat.clone());
      rightAngle.position.set(3, 0.05, z - 0.5);
      rightAngle.rotation.y = -0.3;
      scene.add(rightAngle);
      gridLines.push(rightAngle);
    }

    // === SYNTAX HIGHLIGHTING POLES ===
    // Keywords (purple)
    const keywordMat = new THREE.MeshStandardMaterial({ 
      color: 0x8b5cf6, 
      emissive: 0x6d28d9,
      emissiveIntensity: 0.8
    });
    
    // Functions (blue)
    const functionMat = new THREE.MeshStandardMaterial({ 
      color: 0x3b82f6, 
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.8
    });
    
    // Strings (green)
    const stringMat = new THREE.MeshStandardMaterial({ 
      color: 0x10b981, 
      emissive: 0x047857,
      emissiveIntensity: 0.6
    });
    
    // Comments (gray)
    const commentMat = new THREE.MeshStandardMaterial({ 
      color: 0x6b7280, 
      emissive: 0x374151,
      emissiveIntensity: 0.4
    });
    
    const syntaxPoles: THREE.Mesh[] = [];
    
    for (let z = -80; z < 30; z += 2) {
      // Left side - Keywords (purple)
      const keywordPole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.8, 6), keywordMat);
      keywordPole.position.set(-3.8, 0.9, z);
      scene.add(keywordPole);
      syntaxPoles.push(keywordPole);
      
      // Right side - Functions (blue)
      const functionPole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.8, 6), functionMat);
      functionPole.position.set(3.8, 0.9, z);
      scene.add(functionPole);
      syntaxPoles.push(functionPole);
      
      // Far sides - Strings (green)
      if (z % 4 === 0) {
        const stringPoleLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6), stringMat);
        stringPoleLeft.position.set(-5, 0.6, z);
        scene.add(stringPoleLeft);
        syntaxPoles.push(stringPoleLeft);
        
        const stringPoleRight = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6), stringMat);
        stringPoleRight.position.set(5, 0.6, z);
        scene.add(stringPoleRight);
        syntaxPoles.push(stringPoleRight);
      }
      
      // Comments (gray) - scattered
      if (z % 5 === 0) {
        const commentPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 6), commentMat);
        commentPole.position.set(-1.5, 0.4, z + 1);
        scene.add(commentPole);
        syntaxPoles.push(commentPole);
      }
    }

    // === FLOATING CODE PARTICLES (like syntax tokens) ===
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 2500;
    const particlesPos = new Float32Array(particlesCount * 3);
    const particlesColors = new Float32Array(particlesCount * 3);
    
    const colors = [
      new THREE.Color(0x3b82f6), // blue
      new THREE.Color(0x8b5cf6), // purple
      new THREE.Color(0x10b981), // green
      new THREE.Color(0xf59e0b), // orange
      new THREE.Color(0xef4444), // red
      new THREE.Color(0x06b6d4), // cyan
    ];
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
      const r = 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      particlesPos[i] = Math.sin(phi) * Math.cos(theta) * r;
      particlesPos[i + 1] = Math.sin(phi) * Math.sin(theta) * r * 0.5;
      particlesPos[i + 2] = Math.cos(phi) * r;
      
      const color = colors[Math.floor(Math.random() * colors.length)];
      particlesColors[i] = color.r;
      particlesColors[i + 1] = color.g;
      particlesColors[i + 2] = color.b;
    }
    
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlesPos, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(particlesColors, 3));
    
    const particlesMat = new THREE.PointsMaterial({ 
      size: 0.25, 
      vertexColors: true, 
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // === LIGHTS ===
    const ambientLight = new THREE.AmbientLight(0x404060, 0.4);
    scene.add(ambientLight);
    
    const keyLight = new THREE.PointLight(0x3b82f6, 1.2, 40);
    keyLight.position.set(0, 3, 8);
    scene.add(keyLight);
    
    const purpleLight = new THREE.PointLight(0x8b5cf6, 0.8, 30);
    purpleLight.position.set(-3, 2, 5);
    scene.add(purpleLight);
    
    const cyanLight = new THREE.PointLight(0x06b6d4, 0.8, 30);
    cyanLight.position.set(3, 2, 5);
    scene.add(cyanLight);
    
    const fillLight = new THREE.PointLight(0x10b981, 0.4, 50);
    fillLight.position.set(0, 1, -20);
    scene.add(fillLight);

    // === ANIMATION ===
    let speed = 0.22;
    let animationId: number;
    
    function animate() {
      animationId = requestAnimationFrame(animate);
      
      // Move grid lines and poles toward camera
      [...gridLines, ...syntaxPoles].forEach(obj => {
        obj.position.z += speed;
        if (obj.position.z > 25) {
          obj.position.z = -80;
        }
      });
      
      // Rotate particles slowly
      particles.rotation.y += 0.0004;
      particles.rotation.x += 0.0001;
      
      renderer.render(scene, camera);
    }
    animate();

    // === RESIZE HANDLER ===
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // === CLEANUP ===
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="hyperspeed-container" />;
};

export default Hyperspeed;