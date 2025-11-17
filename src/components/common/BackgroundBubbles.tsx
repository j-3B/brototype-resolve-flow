import { memo } from 'react';
import { motion } from 'framer-motion';

const BackgroundBubbles = memo(() => {
  // Generate 20 bubbles with varied properties for performance
  const bubbles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: 30 + Math.random() * 100, // 30px to 130px
    duration: 15 + Math.random() * 25, // 15-40 seconds for slow motion
    delay: Math.random() * -20, // Negative delay for immediate start
    opacity: 0.1 + Math.random() * 0.2, // 0.1 to 0.3 opacity for subtlety
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full"
          style={{
            left: bubble.left,
            bottom: '-10%',
            width: bubble.size,
            height: bubble.size,
            background: `radial-gradient(circle at 30% 30%, 
              hsl(var(--primary) / ${bubble.opacity * 1.5}), 
              hsl(var(--secondary) / ${bubble.opacity}))`,
            boxShadow: `0 0 ${bubble.size * 0.5}px hsl(var(--primary) / ${bubble.opacity * 0.5}), 
                        inset 0 ${bubble.size * 0.1}px ${bubble.size * 0.2}px rgba(255,255,255,0.3)`,
            willChange: 'transform',
          }}
          animate={{
            y: [0, -window.innerHeight * 1.2],
            x: [0, (Math.random() - 0.5) * 200],
            scale: [1, 1.2, 0.8, 1],
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
