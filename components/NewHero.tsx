'use client';

import Image from 'next/image';
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 px-4">
      {/* Mörkare overlay för att lyfta innehållet */}
      <div className="absolute inset-0 bg-black/30 z-0" />

      {/* Innehåll */}
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Vänster sida - Logga & Text */}
          <div className="text-center lg:text-left space-y-8">
            {/* Logga */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative inline-block">
                <div className="absolute inset-0 blur-xl bg-mystical-purple/30 rounded-full" />
                <div className="relative bg-[#0a0a14] p-6 rounded-2xl mystical-glow">
                  <Image
                    src="/logo-spadommen.png"
                    alt="Spådommen.se"
                    width={300}
                    height={100}
                    className="w-auto h-24 object-contain"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Tagline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-glow mb-6">
              Andlig vägledning –<br />
              <span className="text-mystical-gold text-glow-gold">
                för underhållning och reflektion
              </span>
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
              För underhållning och reflektion – inte medicinsk eller juridisk rådgivning.
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
