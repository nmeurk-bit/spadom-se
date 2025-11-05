// app/page.tsx
import Hero from '@/components/Hero';
import Pricing from '@/components/Pricing';

export default function HomePage() {
  return (
    <>
      <Hero />

      <Pricing />

      {/* Så funkar det */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Så funkar det
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Tre enkla steg till din spådom
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Steg 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-mystical-purple text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Välj paket
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Köp 1, 5 eller 10 spådomar beroende på dina behov. Betala säkert med kort via Stripe.
              </p>
            </div>

            {/* Steg 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-mystical-purple text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Ställ din fråga
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Formulera din fråga tydligt. Välj kategori: Kärlek, Karriär, Ekonomi eller Allmänt.
              </p>
            </div>

            {/* Steg 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-mystical-purple text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Få ditt svar
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Din AI-genererade spådom levereras inom 24 timmar. Se dina svar i ditt konto.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <a
              href="/#priser"
              className="inline-block bg-mystical-gold text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg"
            >
              Kom igång nu
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
