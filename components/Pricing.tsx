// components/Pricing.tsx (Uppdaterad för Vercel)
'use client';

import { useState } from 'react';
import { getFirebaseAuth } from '@/lib/firebase';

// Priser - dessa är exempel och kan ändras
const PRICING_TIERS = [
  {
    quantity: 1 as const,
    name: '1 spådom',
    description: 'Engångsköp',
    price: 20,
    popular: false,
  },
  {
    quantity: 5 as const,
    name: '5 spådomar',
    description: 'Bättre pris',
    price: 60,
    pricePerReading: 12,
    popular: true,
  },
  {
    quantity: 10 as const,
    name: '10 spådomar',
    description: 'Mest för pengarna',
    price: 100,
    pricePerReading: 10,
    popular: false,
  },
];

export default function Pricing() {
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (quantity: 1 | 5 | 10) => {
    setLoading(quantity);
    setError(null);

    try {
      // För 5 och 10, kontrollera att användaren är inloggad
      const user = getFirebaseAuth().currentUser;

      if (quantity !== 1 && !user) {
        setError('Du måste vara inloggad för att köpa detta paket.');
        setLoading(null);
        // Redirect till login
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
          userId: user?.uid || null, // Skicka userId om användaren är inloggad
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Något gick fel');
      }

      // Redirect till Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setLoading(null);
    }
  };

  return (
    <section id="priser" className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Välj ditt paket
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Köp spådomar och få svar när du behöver det
          </p>
        </div>

        {error && (
          <div className="mb-8 max-w-2xl mx-auto p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-center">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.quantity}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 ${
                tier.popular ? 'ring-2 ring-mystical-purple' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-mystical-purple text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Populärast
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {tier.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {tier.description}
                </p>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {tier.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400"> kr</span>
                </div>
                {tier.pricePerReading && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ({tier.pricePerReading} kr/spådom)
                  </p>
                )}
              </div>

              <button
                onClick={() => handlePurchase(tier.quantity)}
                disabled={loading !== null}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  tier.popular
                    ? 'bg-mystical-purple text-white hover:bg-opacity-90'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={`Köp ${tier.name}`}
              >
                {loading === tier.quantity ? 'Laddar...' : `Köp ${tier.name}`}
              </button>

              <ul className="mt-6 space-y-3">
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Svar inom 24 timmar
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    AI-genererade spådomar
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {tier.quantity === 1 ? 'Ingen inloggning krävs' : 'Spara i ditt konto'}
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
