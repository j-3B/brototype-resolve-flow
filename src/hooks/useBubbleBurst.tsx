import { useState, useRef, useCallback, useEffect } from 'react';

interface Bubble {
  id: number;
  angle: number;
  distance: number;
  size: number;
  duration: number;
}

export function useBubbleBurst() {
  const [origin, setOrigin] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showBurst, setShowBurst] = useState(false);
  const [burstBubbles, setBurstBubbles] = useState<Bubble[]>([]);
  const elementRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const triggerBurst = useCallback((element: HTMLElement, callback?: () => void, delay = 1500) => {
    if (prefersReducedMotion) {
      callback?.();
      return;
    }

    const rect = element.getBoundingClientRect();
    setOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });

    // Generate MORE bubbles (50 instead of 26)
    const count = 50;
    const bubbles = Array.from({ length: count }, (_, i) => ({
      id: i,
      angle: (360 / count) * i + Math.random() * 12,
      distance: 120 + Math.random() * 200,
      size: 14 + Math.random() * 38,
      duration: 1.2 + Math.random() * 1.3, // SLOWER: 1.2-2.5 seconds
    }));

    setBurstBubbles(bubbles);
    setShowBurst(true);

    // Execute callback after animation
    if (callback) {
      timerRef.current = window.setTimeout(() => {
        callback();
      }, delay);
    }

    // Hide burst after animation completes
    timerRef.current = window.setTimeout(() => {
      setShowBurst(false);
    }, 2800);
  }, [prefersReducedMotion]);

  return {
    origin,
    showBurst,
    burstBubbles,
    elementRef,
    triggerBurst,
  };
}
