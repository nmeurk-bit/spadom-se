'use client';

import HeroTarotCard from './HeroTarotCard';

export default function NewHero() {
  const scrollToHowItWorks = () => {
    const section = document.getElementById('sa-fungerar-det');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToPricing = () => {
    const section = document.getElementById('priser');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 sm:pt-28 pb-20 px-4">
      {/* Mörkare overlay för att lyfta innehållet */}
      <div className="absolute inset-0 bg-black/30 z-0" />

      {/* Innehåll */}
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Vänster sida - Text */}
          <div className="text-center lg:text-left space-y-8">
            {/* Tagline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-glow mb-6">
              <span className="text-mystical-gold text-glow-gold">
                Personliga spådomar
              </span>
              <br />
              när du behöver vägledning
            </h1>

            {/* CTA-knappar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={scrollToPricing}
                className="bg-gradient-to-r from-mystical-gold to-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-bold hover:from-yellow-500 hover:to-mystical-gold transition-all shadow-lg hover:shadow-2xl transform hover:scale-105"
              >
                Köp spådom
              </button>

              <button
                onClick={scrollToHowItWorks}
                className="bg-transparent border-2 border-mystical-purple text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-mystical-purple/20 transition-all shadow-lg"
              >
                Läs mer
              </button>
            </div>

            {/* Info-text */}
            <p className="text-gray-400 text-sm max-w-md mx-auto lg:mx-0">
              För reflektion och personlig vägledning – inte medicinsk eller juridisk rådgivning.
            </p>
          </div>

          {/* Höger sida - Interaktivt tarotkort */}
          <div className="flex justify-center items-center">
            <HeroTarotCard />
          </div>
        </div>
      </div>
    </section>
  );
}
