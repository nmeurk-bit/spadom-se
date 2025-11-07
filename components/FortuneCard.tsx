'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

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
    if (!isFlipped) {
      setIsFlipped(true);
    }
  };

  const categoryLabel = categoryLabels[category as keyof typeof categoryLabels] || '🌙 Spådom';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      <div className="w-full max-w-[380px]">
        {/* Spådomskort med 3D flip - Tarot-proportioner 3:5 */}
        <div
          className="perspective-1000"
          style={{ perspective: '1500px' }}
        >
          <motion.div
            className="relative w-full cursor-pointer"
            style={{
              transformStyle: 'preserve-3d',
              aspectRatio: '3/5' // Tarot-proportioner
            }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 80 }}
            onClick={handleFlip}
          >
            {/* Baksida - Tarot-back image */}
            <div
              className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="w-full h-full relative border-4 border-mystical-gold">
                {/* Tarot back image */}
                <Image
                  src="/tarot-back.png"
                  alt="Tarot back"
                  fill
                  className="object-cover"
                  priority
                />

                {/* Overlay med text */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/40 to-purple-900/60 flex flex-col items-center justify-end pb-12">
                  <motion.div
                    className="text-center"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <p className="text-white text-2xl font-serif mb-2">
                      Visa din spådom
                    </p>
                    {/* Pulserande klick-ikon */}
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-mystical-gold text-4xl"
                    >
                      ✨
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Framsida - Spådomstext */}
            <div
              className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-900 via-purple-900/40 to-gray-900 border-4 border-mystical-gold flex flex-col">
                {/* Dekorativa hörn */}
                <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-mystical-gold opacity-50" />
                <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-mystical-gold opacity-50" />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-mystical-gold opacity-50" />
                <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-mystical-gold opacity-50" />

                {/* Scrollbart innehåll inne i kortet */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8" style={{ scrollbarWidth: 'thin', scrollbarColor: '#D4AF37 transparent' }}>
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="text-2xl mb-2">{categoryLabel}</div>
                    <h3 className="text-2xl md:text-3xl font-serif text-mystical-gold mb-2">
                      Din Spådom
                    </h3>
                    <p className="text-gray-400 text-sm">
                      För {personName}
                    </p>
                    <div className="h-px bg-gradient-to-r from-transparent via-mystical-gold to-transparent my-4" />
                  </div>

                  {/* Spådomstext - med generösa marginaler */}
                  <div className="text-gray-200 text-base md:text-lg leading-relaxed font-serif space-y-4 px-2">
                    {fortune.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="text-center">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-8 text-center">
                    <div className="h-px bg-gradient-to-r from-transparent via-mystical-gold to-transparent mb-4" />
                    <p className="text-mystical-gold text-xs md:text-sm">
                      ✧ Din spådom sparas i ditt konto ✧
                    </p>
                  </div>
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
              className="inline-block px-6 py-3 bg-gradient-to-r from-mystical-purple to-mystical-gold text-white font-bold rounded-lg hover:scale-105 transition-transform shadow-lg text-sm md:text-base"
            >
              Gå till Mitt Konto →
            </a>
          </motion.div>
        )}

        {/* CSS för snygg scrollbar */}
        <style jsx global>{`
          .overflow-y-auto::-webkit-scrollbar {
            width: 6px;
          }
          .overflow-y-auto::-webkit-scrollbar-track {
            background: transparent;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: #D4AF37;
            border-radius: 3px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: #B8941F;
          }
        `}</style>
      </div>
    </div>
  );
}
