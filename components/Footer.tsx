// components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-t from-gray-900 via-gray-800 to-transparent border-t border-mystical-purple/20 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Om oss */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Om Spådom.se
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI-driven andlig vägledning för underhållning och reflektion.
            </p>
          </div>

          {/* Juridiska länkar */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Juridiskt
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="/villkor" 
                  className="text-gray-600 dark:text-gray-400 hover:text-mystical-purple transition-colors"
                >
                  Användarvillkor
                </Link>
              </li>
              <li>
                <Link 
                  href="/integritet" 
                  className="text-gray-600 dark:text-gray-400 hover:text-mystical-purple transition-colors"
                >
                  Integritetspolicy
                </Link>
              </li>
              <li>
                <Link 
                  href="/cookies" 
                  className="text-gray-600 dark:text-gray-400 hover:text-mystical-purple transition-colors"
                >
                  Cookiepolicy
                </Link>
              </li>
              <li>
                <Link 
                  href="/aterbetalning" 
                  className="text-gray-600 dark:text-gray-400 hover:text-mystical-purple transition-colors"
                >
                  Återbetalningspolicy
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Kontakt
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              support@spadom.se
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-8 border-t border-gray-300 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-4xl mx-auto">
            <strong>Viktigt:</strong> Spådomar genereras av AI och erbjuds för underhållning och reflektion. 
            Innehållet utgör inte medicinsk, juridisk eller finansiell rådgivning. Åldersgräns 18 år.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            © {new Date().getFullYear()} Spådom.se. Alla rättigheter förbehållna.
          </p>
        </div>
      </div>
    </footer>
  );
}
