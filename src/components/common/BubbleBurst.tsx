import { motion, AnimatePresence } from 'framer-motion';

interface Bubble {
  id: number;
  angle: number;
  distance: number;
  size: number;
  duration: number;
}

interface BubbleBurstProps {
  show: boolean;
  origin: { x: number; y: number };
  bubbles: Bubble[];
}

export default function BubbleBurst({ show, origin, bubbles }: BubbleBurstProps) {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true">
          {bubbles.map((bubble) => {
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
                  boxShadow: `0 0 ${bubble.size * 1.2}px hsl(var(--primary) / 0.7), 0 0 ${bubble.size * 2}px hsl(var(--secondary) / 0.4)`,
                  willChange: 'transform, opacity',
                }}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x,
                  y,
                  scale: [0, 1.2, 0.8, 0],
                  opacity: [1, 0.9, 0.6, 0],
                }}
                transition={{
                  duration: bubble.duration,
                  ease: [0.25, 0.46, 0.45, 0.94], // Smooth easing
                }}
                exit={{ opacity: 0 }}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}
