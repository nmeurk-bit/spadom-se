'use client';

import Image from 'next/image';

export default function HowItWorks() {
  const scrollToPricing = () => {
    const section = document.getElementById('priser');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const steps = [
    {
      iconSrc: '/ikon-vem.png',
      iconAlt: 'Ikon för att välja vem spådomen gäller',
      title: 'Välj vem spådomen gäller',
      description: 'Skriv namnet – det kan vara du själv eller någon annan.',
    },
    {
      iconSrc: '/ikon-kategori.png',
      iconAlt: 'Ikon för att välja kategori',
      title: 'Välj kategori',
      description: 'Välj det område du vill ha vägledning inom.',
      badges: ['❤️ Kärlek', '💰 Ekonomi', '🌈 Självutveckling', '🌙 Andlighet', '🕰️ Framtiden', '✨ Övrigt'],
    },
    {
      iconSrc: '/ikon-fraga.png',
      iconAlt: 'Ikon för att skriva fråga',
      title: 'Skriv din fråga',
      description: 'Formulera dig öppet men tydligt. Be gärna om vägledning istället för ja/nej.',
      example: 'Exempel: "Vad behöver jag förstå om min relation just nu?"',
      avoid: 'Undvik: bara ett ord eller enbart ja/nej-frågor.',
    },
    {
      iconSrc: '/ikon-vand.png',
      iconAlt: 'Ikon för att vända kortet',
      title: 'Vänd kortet',
      description: 'Du får ett digitalt spåkort. Klicka eller tryck för att vända det – svaret visas med ett poetiskt budskap.',
    },
    {
      iconSrc: '/ikon-historik.png',
      iconAlt: 'Ikon för historik och saldo',
      title: 'Din historik & saldo',
      description: 'Varje gång du använder en spådom dras 1 från ditt saldo. Du kan alltid se dina tidigare spådomar och ditt saldo på "Mitt konto".',
    },
  ];

  return (
    <section id="sa-fungerar-det" className="py-20 px-4 bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Rubrik */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-glow mb-4">
            Så fungerar det
          </h2>
          <p className="text-xl text-gray-400">
            Fem enkla steg till din personliga spådom
          </p>
        </div>

        {/* Steg */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm border border-mystical-purple/30 rounded-2xl p-8 hover:border-mystical-purple hover:mystical-glow transition-all duration-300"
            >
              {/* Ikon */}
              <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center mb-6 border-2 border-mystical-gold/30 p-3">
                <Image
                  src={step.iconSrc}
                  alt={step.iconAlt}
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Stegnummer */}
              <div className="text-mystical-gold font-bold text-sm mb-2">
                STEG {index + 1}
              </div>

              {/* Titel */}
              <h3 className="text-2xl font-bold text-white mb-4">
                {step.title}
              </h3>

              {/* Beskrivning */}
              <p className="text-gray-300 mb-4">
                {step.description}
              </p>

              {/* Badges för kategorier (Steg 2) */}
              {step.badges && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {step.badges.map((badge, i) => (
                    <span
                      key={i}
                      className="bg-mystical-purple/20 border border-mystical-purple/50 text-mystical-gold px-3 py-1 rounded-full text-xs font-semibold"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}

              {/* Exempel (Steg 3) */}
              {step.example && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 mb-2">
                  <p className="text-green-300 text-sm">
                    <span className="font-semibold">✓ </span>
                    {step.example}
                  </p>
                </div>
              )}

              {/* Undvik (Steg 3) */}
              {step.avoid && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-300 text-sm">
                    <span className="font-semibold">✗ </span>
                    {step.avoid}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Infobox */}
        <div className="max-w-3xl mx-auto bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Viktigt att veta</h4>
              <p className="text-blue-200 text-sm">
                För reflektion och personlig vägledning – inte medicinsk eller juridisk rådgivning.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={scrollToPricing}
            className="bg-gradient-to-r from-mystical-gold to-yellow-500 text-gray-900 px-10 py-5 rounded-lg text-xl font-bold hover:from-yellow-500 hover:to-mystical-gold transition-all shadow-lg hover:shadow-2xl transform hover:scale-105"
          >
            Gör din första spådom nu
          </button>
        </div>
      </div>
    </section>
  );
}
