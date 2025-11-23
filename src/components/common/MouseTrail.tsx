import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrailParticle {
  id: number;
  x: number;
  y: number;
  angle: number;
}

export default function MouseTrail() {
  const [particles, setParticles] = useState<TrailParticle[]>([]);
  const particleIdRef = useRef(0);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(Date.now());

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const addParticle = useCallback((x: number, y: number) => {
    if (prefersReducedMotion) return;

    const now = Date.now();
    const timeDiff = now - lastTimeRef.current;
    
    // Throttle particle creation to every 30ms for performance
    if (timeDiff < 30) return;

    const dx = x - lastPositionRef.current.x;
    const dy = y - lastPositionRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only create particles if mouse has moved significantly
    if (distance < 5) return;

    const angle = Math.atan2(dy, dx);

    lastPositionRef.current = { x, y };
    lastTimeRef.current = now;

    const newParticle: TrailParticle = {
      id: particleIdRef.current++,
      x,
      y,
      angle,
    };

    setParticles((prev) => {
      const updated = [...prev, newParticle];
      // Keep only last 15 particles for performance
      return updated.slice(-15);
    });

    // Auto-remove particle after animation
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 800);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      addParticle(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [addParticle, prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998]" aria-hidden="true">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute"
            style={{
              left: particle.x,
              top: particle.y,
              width: '6rem', // ~6cm long
              height: '0.75rem', // ~2cm thick
              background: `linear-gradient(90deg, 
                transparent, 
                hsl(259, 94%, 65%) 20%, 
                hsl(271, 91%, 70%) 50%, 
                hsl(259, 94%, 65%) 80%, 
                transparent
              )`,
              boxShadow: `
                0 0 20px hsl(259, 94%, 65%, 0.8),
                0 0 40px hsl(259, 94%, 65%, 0.5),
                0 0 60px hsl(271, 91%, 70%, 0.3)
              `,
              filter: 'blur(4px)',
              borderRadius: '9999px',
              transformOrigin: 'left center',
              transform: `rotate(${particle.angle}rad) translateX(-50%)`,
              willChange: 'opacity, transform',
            }}
            initial={{ 
              opacity: 0.9, 
              scale: 0.8,
            }}
            animate={{ 
              opacity: 0,
              scale: 1.1,
              x: Math.cos(particle.angle) * 20,
              y: Math.sin(particle.angle) * 20,
            }}
            exit={{ 
              opacity: 0,
              scale: 0.8,
            }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

