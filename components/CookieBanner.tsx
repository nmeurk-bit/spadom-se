// components/CookieBanner.tsx
'use client';

import { useState, useEffect } from 'react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

/**
 * Cookie Banner med GDPR-kompatibel samtyckes-hantering
 *
 * Hanterar tre kategorier av cookies:
 * - Nödvändiga (alltid aktiverade)
 * - Analys (Google Analytics, etc.)
 * - Marknadsföring (Meta Pixel, etc.)
 */
export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Alltid aktiverade
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Kontrollera om användaren redan har accepterat
    const consent = localStorage.getItem('cookie-consent-preferences');
    if (!consent) {
      setShowBanner(true);
    } else {
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
      } catch {
        setShowBanner(true);
      }
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent-preferences', JSON.stringify(prefs));
    setShowBanner(false);
    setShowSettings(false);

    // Dispatcha custom event så MetaPixel kan reagera
    window.dispatchEvent(new CustomEvent('cookie-consent-changed', { detail: prefs }));

    // Ladda om sidan för att aktivera/deaktivera scripts
    window.location.reload();
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
  };

  const acceptNecessaryOnly = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    savePreferences(necessaryOnly);
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {!showSettings ? (
          // Enkel banner
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vi använder cookies för att förbättra din upplevelse och för marknadsföring. Läs vår{' '}
              <a href="/cookies" className="underline hover:text-mystical-purple">
                cookiepolicy
              </a>
              .
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Anpassa cookies"
              >
                Anpassa
              </button>
              <button
                onClick={acceptNecessaryOnly}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Endast nödvändiga"
              >
                Endast nödvändiga
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 text-sm bg-mystical-purple text-white rounded-lg hover:bg-opacity-90 transition-colors"
                aria-label="Acceptera alla"
              >
                Acceptera alla
              </button>
            </div>
          </div>
        ) : (
          // Detaljerade inställningar
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cookie-inställningar
            </h3>

            <div className="space-y-3">
              {/* Nödvändiga cookies */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Nödvändiga cookies</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Krävs för att webbplatsen ska fungera
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="h-5 w-5"
                  aria-label="Nödvändiga cookies (alltid aktiverade)"
                />
              </div>

              {/* Analyscookies */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Analyscookies</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Hjälper oss förstå hur besökare använder webbplatsen
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences({ ...preferences, analytics: e.target.checked })
                  }
                  className="h-5 w-5 accent-mystical-purple"
                  aria-label="Analyscookies"
                />
              </div>

              {/* Marknadsföringscookies */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Marknadsföringscookies</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Används för att visa relevanta annonser (Meta Pixel)
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) =>
                    setPreferences({ ...preferences, marketing: e.target.checked })
                  }
                  className="h-5 w-5 accent-mystical-purple"
                  aria-label="Marknadsföringscookies"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Avbryt"
              >
                Avbryt
              </button>
              <button
                onClick={saveCustomPreferences}
                className="px-4 py-2 text-sm bg-mystical-purple text-white rounded-lg hover:bg-opacity-90 transition-colors"
                aria-label="Spara inställningar"
              >
                Spara inställningar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
