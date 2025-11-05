// components/CookieBanner.tsx
'use client';

import { useState, useEffect } from 'react';

/**
 * TODO: Cookie Banner
 * 
 * Detta är en enkel placeholder för cookie-samtycke.
 * 
 * För produktionsmiljö bör du:
 * 1. Implementera riktig samtyckes-hantering enligt GDPR
 * 2. Inte ladda någon analys (Google Analytics, etc.) före samtycke
 * 3. Spara användarens val i localStorage eller cookies
 * 4. Visa detaljerade kategorier (nödvändiga, analys, marknadsföring)
 * 5. Tillhandahålla en inställningssida där användare kan ändra sitt val
 * 
 * Överväg att använda ett bibliotek som:
 * - react-cookie-consent
 * - @cookie3/banner
 * - eller egen implementation med detaljerad kontroll
 */

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Kontrollera om användaren redan har accepterat
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
    // TODO: Aktivera analys och tracking här
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowBanner(false);
    // Ladda endast nödvändiga cookies
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Vi använder cookies för att förbättra din upplevelse. Läs vår{' '}
            <a href="/cookies" className="underline hover:text-mystical-purple">
              cookiepolicy
            </a>
            .
          </p>
          <div className="flex gap-3">
            <button
              onClick={declineCookies}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Neka cookies"
            >
              Neka
            </button>
            <button
              onClick={acceptCookies}
              className="px-4 py-2 text-sm bg-mystical-purple text-white rounded-lg hover:bg-opacity-90 transition-colors"
              aria-label="Acceptera cookies"
            >
              Acceptera
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
