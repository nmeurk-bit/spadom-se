// components/NewPricing.tsx
'use client';

import { useState } from 'react';
import { getFirebaseAuth } from '@/lib/firebase';

const PRICING_TIERS = [
  {
    quantity: 1 as const,
    name: '1 spådom',
    description: 'Perfekt för att testa',
    price: 20,
    popular: false,
  },
  {
    quantity: 5 as const,
    name: '5 spådomar',
    description: 'Populärast val',
    price: 60,
    pricePerReading: 12,
    popular: true,
    savings: 'Spara 40 kr',
  },
  {
    quantity: 10 as const,
    name: '10 spådomar',
    description: 'Bästa värdet',
    price: 100,
    pricePerReading: 10,
    popular: false,
    savings: 'Spara 100 kr',
  },
];

export default function NewPricing() {
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (quantity: 1 | 5 | 10) => {
    setLoading(quantity);
    setError(null);

    try {
      const user = getFirebaseAuth().currentUser;

      if (quantity !== 1 && !user) {
        setError('Du måste vara inloggad för att köpa detta paket.');
        setLoading(null);
        window.location.href = '/login';
        return;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity,
          userId: user?.uid || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Något gick fel');
      }

      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setLoading(null);
    }
  };

  return (
    <section id="priser" className="py-20 px-4 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Rubrik */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-glow mb-4">
            Välj ditt paket
          </h2>
          <p className="text-xl text-gray-400">
            Köp spådomar och få andlig vägledning när du behöver det
          </p>
        </div>

        {/* Felmeddelande */}
        {error && (
          <div className="mb-8 max-w-2xl mx-auto p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
            <p className="text-red-200 text-center">{error}</p>
          </div>
        )}

        {/* Prispaket */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.quantity}
              className={`relative bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-2xl p-8 transition-all duration-300 ${
                tier.popular
                  ? 'border-2 border-mystical-purple mystical-glow transform scale-105'
                  : 'border border-gray-700 hover:border-mystical-gold hover:mystical-glow-gold'
              }`}
            >
              {/* Populärast badge */}
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-mystical-purple to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    ⭐ Populärast
                  </span>
                </div>
              )}

              {/* Sparar badge */}
              {tier.savings && (
                <div className="absolute -top-4 right-4">
                  <span className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                    {tier.savings}
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-2">
                  {tier.name}
                </h3>
                <p className="text-gray-400 mb-6">
                  {tier.description}
                </p>

                {/* Pris */}
                <div className="mb-4">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold bg-gradient-to-r from-mystical-gold to-yellow-500 bg-clip-text text-transparent">
                      {tier.price}
                    </span>
                    <span className="text-2xl text-gray-400">kr</span>
                  </div>
                  {tier.pricePerReading && (
                    <p className="text-sm text-mystical-gold mt-2">
                      ({tier.pricePerReading} kr/spådom)
                    </p>
                  )}
                </div>
              </div>

              {/* Köpknapp */}
              <button
                onClick={() => handlePurchase(tier.quantity)}
                disabled={loading !== null}
                className={`w-full py-4 rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg ${
                  tier.popular
                    ? 'bg-gradient-to-r from-mystical-purple to-purple-600 text-white hover:from-purple-600 hover:to-mystical-purple'
                    : 'bg-gradient-to-r from-mystical-gold to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-mystical-gold'
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                {loading === tier.quantity ? 'Laddar...' : `Köp ${tier.name}`}
              </button>

              {/* Features */}
              <ul className="mt-8 space-y-4">
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-300 text-sm">
                    AI-genererade personliga spådomar
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-300 text-sm">
                    Poetiska och djupgående budskap
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-300 text-sm">
                    {tier.quantity === 1
                      ? 'Ingen inloggning krävs'
                      : 'Sparas i ditt konto för evigt'}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-300 text-sm">
                    Säker betalning via Stripe
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        {/* Extra info */}
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-mystical-purple/30 rounded-xl p-6">
            <h4 className="text-white font-semibold mb-2 flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-mystical-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Säker och trygg betalning
            </h4>
            <p className="text-gray-300 text-sm">
              Alla betalningar hanteras säkert av Stripe. Vi sparar aldrig dina kortuppgifter.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
