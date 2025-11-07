'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface FortuneCardProps {
  fortune: string;
  personName: string;
  category: string;
}

const categoryLabels = {
  love: '❤️ Kärlek',
  finance: '💰 Ekonomi',
  self_development: '🌱 Utveckling',
  spirituality: '✨ Andlighet',
  future: '🔮 Framtiden',
  other: '🌙 Spådom',
};

export default function FortuneCard({ fortune, personName, category }: FortuneCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(true);
  };

  const categoryLabel = categoryLabels[category as keyof typeof categoryLabels] || '🌙 Spådom';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      <div className="max-w-2xl w-full">
        {/* Instruktioner */}
        {!isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Din spådom är klar! ✨
            </h2>
            <p className="text-xl text-gray-300 mb-2">
              Klicka på kortet för att avslöja din spådom
            </p>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-mystical-gold text-4xl"
            >
              👇
            </motion.div>
          </motion.div>
        )}

        {/* Spådomskort med 3D flip */}
        <div
          className="perspective-1000"
          style={{ perspective: '1000px' }}
        >
          <motion.div
            className="relative w-full aspect-[3/4] cursor-pointer"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
            onClick={!isFlipped ? handleFlip : undefined}
          >
            {/* Baksida - Mystisk tarot-design */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="w-full h-full bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 p-8 flex flex-col items-center justify-center border-4 border-mystical-gold relative">
                {/* Dekorativa hörn */}
                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-mystical-gold" />
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-mystical-gold" />
                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-mystical-gold" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-mystical-gold" />

                {/* Central mystisk symbol */}
                <div className="text-center">
                  <div className="text-8xl mb-4">🔮</div>
                  <div className="text-mystical-gold text-4xl mb-4">✨</div>
                  <div className="text-white text-2xl font-serif">Spådommen</div>
                  <div className="text-mystical-gold text-lg mt-2">✧･ﾟ: *✧･ﾟ:*</div>
                </div>

                {/* Pulserande glow */}
                <motion.div
                  className="absolute inset-0 bg-mystical-purple opacity-20 rounded-2xl"
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </div>

            {/* Framsida - Spådomstext */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 p-8 flex flex-col border-4 border-mystical-gold relative overflow-y-auto">
                {/* Dekorativa hörn */}
                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-mystical-gold" />
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-mystical-gold" />
                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-mystical-gold" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-mystical-gold" />

                {/* Header */}
                <div className="text-center mb-6">
                  <div className="text-3xl mb-2">{categoryLabel}</div>
                  <h3 className="text-2xl font-serif text-mystical-gold mb-2">
                    Din Spådom
                  </h3>
                  <p className="text-gray-400 text-sm">
                    För {personName}
                  </p>
                  <div className="h-px bg-gradient-to-r from-transparent via-mystical-gold to-transparent my-4" />
                </div>

                {/* Spådomstext */}
                <div className="flex-1 overflow-y-auto">
                  <div className="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap font-serif">
                    {fortune}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                  <div className="h-px bg-gradient-to-r from-transparent via-mystical-gold to-transparent mb-4" />
                  <p className="text-mystical-gold text-sm">
                    ✧･ﾟ: *✧･ﾟ:*  Din spådom sparas i ditt konto  *:･ﾟ✧*:･ﾟ✧
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Knapp för att gå vidare efter flip */}
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <a
              href="/konto"
              className="inline-block px-8 py-4 bg-gradient-to-r from-mystical-purple to-mystical-gold text-white font-bold rounded-lg hover:scale-105 transition-transform shadow-lg"
            >
              Gå till Mitt Konto →
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
}
