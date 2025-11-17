import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

const BackgroundBubbles = memo(() => {
  // Respect reduced motion for accessibility and performance
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Cache screen height once to avoid layout thrash
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 1000;

  // Generate once per mount for stable, smooth animation
  const bubbles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: 24 + Math.random() * 96, // 24px to 120px
        duration: 20 + Math.random() * 30, // 20-50s slow, premium feel
        delay: Math.random() * -30, // start at different offsets
        opacity: 0.08 + Math.random() * 0.22, // subtle transparency
        drift: (Math.random() - 0.5) * 240, // horizontal drift
      })),
    []
  );

  if (prefersReducedMotion) {
    // Subtle static dots (no animation) for reduced motion users
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {bubbles.slice(0, 10).map((b) => (
          <div
            key={b.id}
            className="absolute rounded-full"
            style={{
              left: b.left,
              bottom: `${10 + Math.random() * 80}%`,
              width: b.size,
              height: b.size,
              background: `radial-gradient(circle at 30% 30%, hsl(var(--primary) / ${b.opacity * 1.5}), hsl(var(--secondary) / ${b.opacity}))`,
              filter: 'blur(1px)',
              opacity: b.opacity,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full"
          style={{
            left: bubble.left,
            bottom: '-12%',
            width: bubble.size,
            height: bubble.size,
            background: `radial-gradient(circle at 30% 30%, 
              hsl(var(--primary) / ${bubble.opacity * 1.5}), 
              hsl(var(--secondary) / ${bubble.opacity}))`,
            boxShadow: `0 0 ${bubble.size * 0.5}px hsl(var(--primary) / ${bubble.opacity * 0.5}), 
                        inset 0 ${bubble.size * 0.1}px ${bubble.size * 0.2}px rgba(255,255,255,0.28)`,
            willChange: 'transform, opacity',
            transform: 'translateZ(0)',
          }}
          animate={{
            y: [0, -screenHeight * 1.3],
            x: [0, bubble.drift],
            scale: [1, 1.08, 0.96, 1],
            opacity: [0, bubble.opacity, bubble.opacity, 0],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
});

BackgroundBubbles.displayName = 'BackgroundBubbles';

export default BackgroundBubbles;
