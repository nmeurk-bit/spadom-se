'use client';

import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { getFirebaseAuth } from '@/lib/firebase';
import Image from 'next/image';

export default function HeroTarotCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Motion values för 3D tilt-effekt (endast desktop)
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  useEffect(() => {
    // Kontrollera om användaren föredrar reducerad rörelse
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    // Kontrollera om det är mobil
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Göm hint efter 3 sekunder
    const timer = setTimeout(() => setShowHint(false), 3000);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timer);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || prefersReducedMotion) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    x.set((e.clientX - centerX) / 10);
    y.set((e.clientY - centerY) / 10);
  };

  const handleMouseLeave = () => {
    if (isMobile || prefersReducedMotion) return;
    x.set(0);
    y.set(0);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowHint(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFlip();
    }
  };

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const user = getFirebaseAuth().currentUser;

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: 1,
          userId: user?.uid || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Något gick fel');

      window.location.href = data.url;
    } catch (err: any) {
      console.error(err);
      setLoading(false);
    }
  };

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('priser');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto relative" style={{ perspective: '1200px' }}>
      {/* Hint för mobil */}
      {isMobile && showHint && !isFlipped && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-mystical-purple text-white px-4 py-2 rounded-lg text-sm z-20"
        >
          Tryck för att vända kortet
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-mystical-purple"></div>
        </motion.div>
      )}

      <motion.div
        className="relative w-full h-[500px] preserve-3d"
        style={
          !isMobile && !prefersReducedMotion
            ? { rotateX, rotateY, cursor: isFlipped ? 'default' : 'pointer' }
            : { cursor: isFlipped ? 'default' : 'pointer' }
        }
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={!isFlipped ? handleFlip : undefined}
        onKeyDown={!isFlipped ? handleKeyDown : undefined}
        role={!isFlipped ? "button" : undefined}
        tabIndex={!isFlipped ? 0 : undefined}
        aria-label={isFlipped ? 'Tarotkort vänt - visa CTA' : 'Tarotkort - klicka för att vända'}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.8, ease: 'easeInOut' }
        }
      >
        {/* Framsida (baksidan av tarotkortet) */}
        <div
          className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden mystical-glow"
        >
          <Image
            src="/tarot-back.png"
            alt="Baksidan av tarotkort"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Baksida (CTA-innehåll) */}
        <div
          className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 mystical-glow"
        >
          <div className="w-full h-full p-8 flex flex-col items-center justify-center text-center space-y-6">
            <h3 className="text-3xl font-bold text-white text-glow-gold">
              Köp en spådom
            </h3>

            <p className="text-lg text-gray-300 max-w-xs">
              Andlig vägledning – snabbt och personligt.
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePurchase();
              }}
              disabled={loading}
              className="bg-gradient-to-r from-mystical-gold to-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-bold hover:from-yellow-500 hover:to-mystical-gold transition-all shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading ? 'Laddar...' : 'Köp 1 spådom (20 kr)'}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                scrollToPricing();
              }}
              className="text-mystical-gold hover:text-yellow-400 underline text-sm transition-colors"
            >
              Se paket
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
