import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrailPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface CurveTrail {
  id: number;
  points: TrailPoint[];
  color: string;
  offset: { x: number; y: number };
}

const TRAIL_COLORS = [
  'hsl(271, 91%, 70%)', // violet
  'hsl(330, 90%, 65%)', // pink
  'hsl(350, 85%, 60%)', // red-pink
  'hsl(259, 94%, 65%)', // deep violet
];

export default function MouseTrail() {
  const [trails, setTrails] = useState<CurveTrail[]>([]);
  const trailIdRef = useRef(0);
  const pointHistoryRef = useRef<TrailPoint[]>([]);
  const lastTimeRef = useRef(Date.now());

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const addTrailPoint = useCallback((x: number, y: number) => {
    if (prefersReducedMotion) return;

    const now = Date.now();
    const timeDiff = now - lastTimeRef.current;
    
    // Throttle to every 15ms for ultra-smooth trails
    if (timeDiff < 15) return;

    lastTimeRef.current = now;

    const newPoint: TrailPoint = { x, y, timestamp: now };
    pointHistoryRef.current.push(newPoint);

    // Keep last 12 points for smooth curves
    if (pointHistoryRef.current.length > 12) {
      pointHistoryRef.current.shift();
    }

    // Create multiple overlapping curve trails with offsets
    if (pointHistoryRef.current.length >= 4) {
      const numTrails = 3;
      for (let i = 0; i < numTrails; i++) {
        const angle = (Math.random() - 0.5) * Math.PI * 0.3; // Random curve variation
        const distance = 15 + Math.random() * 20;
        
        const newTrail: CurveTrail = {
          id: trailIdRef.current++,
          points: [...pointHistoryRef.current],
          color: TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)],
          offset: {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
          },
        };

        setTrails((prev) => {
          const updated = [...prev, newTrail];
          // Keep max 25 trails for performance
          return updated.slice(-25);
        });

        // Auto-remove trail after animation
        setTimeout(() => {
          setTrails((prev) => prev.filter((t) => t.id !== newTrail.id));
        }, 1200);
      }
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      addTrailPoint(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [addTrailPoint, prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  // Generate smooth curved path from points
  const generateCurvePath = (points: TrailPoint[], offset: { x: number; y: number }) => {
    if (points.length < 2) return '';

    const adjustedPoints = points.map(p => ({
      x: p.x + offset.x,
      y: p.y + offset.y,
    }));

    let path = `M ${adjustedPoints[0].x} ${adjustedPoints[0].y}`;

    for (let i = 1; i < adjustedPoints.length - 1; i++) {
      const current = adjustedPoints[i];
      const next = adjustedPoints[i + 1];
      const controlX = (current.x + next.x) / 2;
      const controlY = (current.y + next.y) / 2;
      
      // Quadratic curve for smooth, flowing lines
      path += ` Q ${current.x} ${current.y}, ${controlX} ${controlY}`;
    }

    // Final point
    const last = adjustedPoints[adjustedPoints.length - 1];
    path += ` L ${last.x} ${last.y}`;

    return path;
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998]" aria-hidden="true">
      <svg className="w-full h-full">
        <defs>
          {/* Glow filter for neon effect */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient for tapering effect */}
          <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopOpacity="0" />
            <stop offset="20%" stopOpacity="0.3" />
            <stop offset="50%" stopOpacity="0.25" />
            <stop offset="80%" stopOpacity="0.2" />
            <stop offset="100%" stopOpacity="0" />
          </linearGradient>
        </defs>

        <AnimatePresence>
          {trails.map((trail) => (
            <motion.path
              key={trail.id}
              d={generateCurvePath(trail.points, trail.offset)}
              fill="none"
              stroke={`url(#trailGradient)`}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              style={{
                stroke: trail.color,
              }}
              initial={{ 
                opacity: 0.3,
                pathLength: 0,
              }}
              animate={{ 
                opacity: 0,
                pathLength: 1,
              }}
              exit={{ 
                opacity: 0,
              }}
              transition={{
                duration: 1.2,
                opacity: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
                pathLength: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
              }}
            />
          ))}
        </AnimatePresence>
      </svg>
    </div>
  );
}

