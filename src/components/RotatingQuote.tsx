import { useEffect, useState } from 'react';
import { motivationalQuotes } from '@/data/motivationalQuotes';

export default function RotatingQuote() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false);
      
      // After fade out, change quote
      setTimeout(() => {
        setCurrentQuoteIndex((prevIndex) => 
          (prevIndex + 1) % motivationalQuotes.length
        );
        setIsVisible(true);
      }, 500);
    }, 10000); // Change every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[200px] p-8">
      <blockquote
        className={`text-center max-w-3xl transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <p className="text-xl md:text-2xl font-medium text-foreground italic leading-relaxed">
          "{motivationalQuotes[currentQuoteIndex]}"
        </p>
      </blockquote>
    </div>
  );
}
