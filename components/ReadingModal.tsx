'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Reading } from '@/lib/firestore';

interface ReadingModalProps {
  reading: (Reading & { id: string }) | null;
  onClose: () => void;
}

const categoryLabels = {
  love: '❤️ Kärlek',
  finance: '💰 Ekonomi',
  self_development: '🌱 Utveckling',
  spirituality: '✨ Andlighet',
  future: '🔮 Framtiden',
  other: '🌙 Spådom',
};

export default function ReadingModal({ reading, onClose }: ReadingModalProps) {
  if (!reading) return null;

  const categoryLabel = categoryLabels[reading.category as keyof typeof categoryLabels] || '🌙 Spådom';

  const formatDate = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Content - Tarotkort-stil */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-[380px] z-10"
          style={{ aspectRatio: '3/5' }}
        >
          <div className="w-full h-full bg-gradient-to-br from-gray-900 via-purple-900/40 to-gray-900 border-4 border-mystical-gold rounded-xl shadow-2xl flex flex-col">
            {/* Dekorativa hörn */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-mystical-gold opacity-50" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-mystical-gold opacity-50" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-mystical-gold opacity-50" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-mystical-gold opacity-50" />

            {/* Stäng-knapp */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-gray-800/80 hover:bg-gray-700 rounded-full text-white transition-colors"
              aria-label="Stäng"
            >
              ✕
            </button>

            {/* Scrollbart innehåll */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8" style={{ scrollbarWidth: 'thin', scrollbarColor: '#D4AF37 transparent' }}>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-2xl mb-2">{categoryLabel}</div>
                <h3 className="text-2xl md:text-3xl font-serif text-mystical-gold mb-2">
                  {reading.response ? 'Din Spådom' : 'Din Tidigare Spådom'}
                </h3>
                <p className="text-gray-400 text-sm">
                  För {reading.personName}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {formatDate(reading.createdAt)}
                </p>
                <div className="h-px bg-gradient-to-r from-transparent via-mystical-gold to-transparent my-4" />
              </div>

              {/* Fråga */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-mystical-gold mb-2">Din fråga:</h4>
                <p className="text-gray-300 text-sm italic">
                  "{reading.question}"
                </p>
              </div>

              {/* Spådomstext eller status */}
              {reading.response ? (
                <div className="text-gray-200 text-base md:text-lg leading-relaxed font-serif space-y-4 px-2">
                  {reading.response.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-center">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 text-center">
                  <p className="text-yellow-200 text-sm">
                    {reading.status === 'processing'
                      ? '⏳ Din spådom bearbetas...'
                      : '📝 Din spådom är mottagen och kommer snart'}
                  </p>
                </div>
              )}

              {/* Footer */}
              {reading.response && (
                <div className="mt-8 text-center">
                  <div className="h-px bg-gradient-to-r from-transparent via-mystical-gold to-transparent mb-4" />
                  <p className="text-mystical-gold text-xs">
                    ✧ Sparad i ditt konto ✧
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

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
    </AnimatePresence>
  );
}
