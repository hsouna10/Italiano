import confetti from 'canvas-confetti';

export const triggerSuccessConfetti = () => {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f97316', '#3b82f6', '#f59e0b', '#ec4899']
    });
  } catch (e) {
    // Canvas confetti fallback
  }
};

export const triggerGrandCelebration = () => {
  try {
    const end = Date.now() + 1200;
    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10b981', '#f97316', '#22c55e']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#10b981', '#f97316', '#38bdf8']
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  } catch (e) {
    // Canvas confetti fallback
  }
};
