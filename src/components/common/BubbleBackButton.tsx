import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useBubbleBurst } from '@/hooks/useBubbleBurst';
import BubbleBurst from './BubbleBurst';

interface BubbleBackButtonProps {
  to?: string;
}

export default function BubbleBackButton({ to = '/' }: BubbleBackButtonProps) {
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { origin, showBurst, burstBubbles, triggerBurst } = useBubbleBurst();

  const handleClick = () => {
    if (buttonRef.current) {
      triggerBurst(buttonRef.current, () => navigate(to), 1800);
    }
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

      <BubbleBurst show={showBurst} origin={origin} bubbles={burstBubbles} />
    </>
  );
}
