import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface BubbleBackButtonProps {
  to?: string;
}

export default function BubbleBackButton({ to = '/' }: BubbleBackButtonProps) {
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navTimerRef = useRef<number | null>(null);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [origin, setOrigin] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showBurst, setShowBurst] = useState(false);
  const [burstBubbles, setBurstBubbles] = useState<Array<{
    id: number;
    angle: number;
    distance: number;
    size: number;
    duration: number;
  }>>([]);

  useEffect(() => {
    return () => {
      if (navTimerRef.current) window.clearTimeout(navTimerRef.current);
    };
  }, []);

  const handleClick = () => {
    if (prefersReducedMotion) {
      navigate(to);
      return;
    }

    // Compute burst origin at the button center for perfect alignment
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) setOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });

    // Generate burst bubbles
    const count = 26;
    const bubbles = Array.from({ length: count }, (_, i) => ({
      id: i,
      angle: (360 / count) * i + Math.random() * 8,
      distance: 110 + Math.random() * 160,
      size: 12 + Math.random() * 32,
      duration: 0.55 + Math.random() * 0.45,
    }));

    setBurstBubbles(bubbles);
    setShowBurst(true);

    // Navigate after animation completes
    navTimerRef.current = window.setTimeout(() => {
      navigate(to);
    }, 900);
  };

  return (
    <>
      <motion.button
        ref={buttonRef}
        type="button"
        aria-label="Back to home"
        title="Back"
        onClick={handleClick}
        className="fixed top-6 left-6 z-50 w-14 h-14 rounded-full flex items-center justify-center group overflow-hidden"
        whileHover={{
          scale: 1.1,
          boxShadow: '0 0 30px hsl(var(--primary) / 0.6)'
        }}
        whileTap={{ scale: 0.92 }}
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))',
          boxShadow:
            '0 8px 25px hsl(var(--primary) / 0.4), inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.2)',
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent)',
          }}
          transition={{ duration: 0.3 }}
        />
        <ArrowLeft className="h-6 w-6 text-white relative z-10" />
      </motion.button>

      {/* Burst Animation */}
      <AnimatePresence>
        {showBurst && (
          <div className="fixed inset-0 pointer-events-none z-40" aria-hidden="true">
            {burstBubbles.map((bubble) => {
              const radian = (bubble.angle * Math.PI) / 180;
              const x = Math.cos(radian) * bubble.distance;
              const y = Math.sin(radian) * bubble.distance;

              return (
                <motion.div
                  key={bubble.id}
                  className="absolute rounded-full"
                  style={{
                    left: origin.x,
                    top: origin.y,
                    width: bubble.size,
                    height: bubble.size,
                    background: `radial-gradient(circle at 30% 30%, hsl(var(--primary) / 0.8), hsl(var(--secondary) / 0.6))`,
                    boxShadow: `0 0 ${bubble.size * 0.8}px hsl(var(--primary) / 0.6)`,
                    willChange: 'transform, opacity',
                  }}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{
                    x,
                    y,
                    scale: [0, 1.15, 0],
                    opacity: [1, 0.8, 0],
                  }}
                  transition={{
                    duration: bubble.duration,
                    ease: 'easeOut',
                  }}
                  exit={{ opacity: 0 }}
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
