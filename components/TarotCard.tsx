// components/TarotCard.tsx
'use client';

import { useState } from 'react';

interface TarotCardProps {
  answer: string;
  question: string;
  targetName: string;
  category: string;
}

const categoryEmojis: Record<string, string> = {
  love: '❤️',
  economy: '💰',
  self_development: '🌈',
  spirituality: '🌙',
  future: '🕰️',
  other: '✨',
};

const categoryNames: Record<string, string> = {
  love: 'Kärlek',
  economy: 'Ekonomi',
  self_development: 'Självutveckling',
  spirituality: 'Andlighet',
  future: 'Framtiden',
  other: 'Övrigt',
};

export default function TarotCard({ answer, question, targetName, category }: TarotCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Flip container */}
      <div
        className="relative w-full max-w-md h-[600px] cursor-pointer perspective"
        onClick={handleFlip}
        style={{ perspective: '1000px' }}
      >
        <div
          className={`relative w-full h-full transition-transform duration-700 preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Baksida (kort med baksida upp) */}
          <div
            className="absolute w-full h-full backface-hidden rounded-2xl shadow-2xl"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Mystiskt mönster */}
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <pattern id="stars" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="1" fill="white" />
                    <circle cx="5" cy="15" r="0.5" fill="white" />
                    <circle cx="15" cy="5" r="0.7" fill="white" />
                  </pattern>
                  <rect width="100" height="100" fill="url(#stars)" />
                </svg>
              </div>

              {/* Centralt symbol */}
              <div className="relative z-10 text-center">
                <div className="text-8xl mb-6 animate-pulse">
                  🌙
                </div>
                <div className="text-2xl text-white font-serif mb-2">
                  Ditt svar väntar
                </div>
                <div className="text-white/70 text-sm">
                  Klicka för att vända kortet
                </div>
              </div>

              {/* Dekorativa hörn */}
              <div className="absolute top-4 left-4 text-white/30 text-2xl">✦</div>
              <div className="absolute top-4 right-4 text-white/30 text-2xl">✦</div>
              <div className="absolute bottom-4 left-4 text-white/30 text-2xl">✦</div>
              <div className="absolute bottom-4 right-4 text-white/30 text-2xl">✦</div>
            </div>
          </div>

          {/* Framsida (spådomen) */}
          <div
            className="absolute w-full h-full backface-hidden rounded-2xl shadow-2xl"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="w-full h-full bg-gradient-to-br from-amber-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 rounded-2xl p-8 flex flex-col overflow-auto">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">
                  {categoryEmojis[category] || '✨'}
                </div>
                <h3 className="text-xl font-serif text-gray-800 dark:text-white mb-1">
                  {categoryNames[category] || 'Spådom'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  För {targetName}
                </p>
              </div>

              {/* Spådomen */}
              <div className="flex-1 overflow-auto mb-6">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap font-serif">
                    {answer}
                  </div>
                </div>
              </div>

              {/* Footer med frågan */}
              <div className="border-t border-gray-300 dark:border-gray-600 pt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold">
                  Din fråga:
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  "{question}"
                </p>
              </div>

              {/* Instruktion */}
              <div className="text-center mt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Klicka för att vända tillbaka kortet
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status-text under kortet */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isFlipped ? '🔮 Spådomen är avslöjad' : '🌙 Kortet väntar på dig...'}
        </p>
      </div>
    </div>
  );
}
