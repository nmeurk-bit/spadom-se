// app/tack/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function TackContent() {
  const searchParams = useSearchParams();
  const typ = searchParams.get('typ'); // 'betalning' eller 'bestallning'

  const isPayment = typ === 'betalning';

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        {/* Checkmark icon */}
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-12 h-12 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Tack!
        </h1>

        {isPayment ? (
          <>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Ditt köp har genomförts framgångsrikt. Dina spådomar har lagts till ditt konto.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Du kan nu beställa spådomar när du vill genom att gå till ditt konto.
            </p>
          </>
        ) : (
          <>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Din beställning har mottagits!
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Din spådom behandlas och levereras inom 24 timmar. Du kommer att kunna se svaret i ditt konto.
            </p>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/konto"
            className="inline-block bg-mystical-purple text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
          >
            Till kontot
          </Link>
          {!isPayment && (
            <Link
              href="/bestallning"
              className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Gör en ny beställning
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TackPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-mystical-purple"></div>
        </div>
      </div>
    }>
      <TackContent />
    </Suspense>
  );
}
