import confetti from 'canvas-confetti';

// Confetti Effects
export const triggerConfetti = (type: 'success' | 'certification' | 'levelUp' = 'success') => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval: any = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    switch (type) {
      case 'certification':
        // Golden confetti for certification
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#FFD700', '#FFA500', '#FFD700', '#FFC0CB'],
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#FFD700', '#FFA500', '#FFD700', '#FFC0CB'],
        });
        break;
        
      case 'levelUp':
        // Blue/purple confetti for level up
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#3b82f6', '#8b5cf6', '#60a5fa', '#a78bfa'],
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#3b82f6', '#8b5cf6', '#60a5fa', '#a78bfa'],
        });
        break;
        
      default:
        // Green success confetti
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#22c55e', '#16a34a', '#4ade80', '#86efac'],
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#22c55e', '#16a34a', '#4ade80', '#86efac'],
        });
    }
  }, 250);
};

// Side Cannon Confetti
export const triggerSideCannons = () => {
  const end = Date.now() + 2000;
  const colors = ['#3b82f6', '#8b5cf6', '#60a5fa'];

  (function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
};

// Glitch Effect
export const triggerGlitch = (element: HTMLElement, duration: number = 500) => {
  element.style.animation = `glitch ${duration}ms ease-in-out`;
  element.classList.add('glitch-active');
  
  setTimeout(() => {
    element.style.animation = '';
    element.classList.remove('glitch-active');
  }, duration);
};

// Success Pulse
export const triggerSuccessPulse = (element: HTMLElement) => {
  element.style.animation = 'successPulse 1s ease-out';
  setTimeout(() => {
    element.style.animation = '';
  }, 1000);
};