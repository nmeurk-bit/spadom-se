'use client';

export default function HowItWorks() {
  const scrollToPricing = () => {
    const section = document.getElementById('priser');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const steps = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: 'Välj vem spådomen gäller',
      description: 'Skriv namnet – det kan vara du själv eller någon annan.',
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      title: 'Välj kategori',
      description: 'Välj det område du vill ha vägledning inom.',
      badges: ['❤️ Kärlek', '💰 Ekonomi', '🌈 Självutveckling', '🌙 Andlighet', '🕰️ Framtiden', '✨ Övrigt'],
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      title: 'Skriv din fråga',
      description: 'Formulera dig öppet men tydligt. Be gärna om vägledning istället för ja/nej.',
      example: 'Exempel: "Vad behöver jag förstå om min relation just nu?"',
      avoid: 'Undvik: bara ett ord eller enbart ja/nej-frågor.',
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      title: 'Vänd kortet',
      description: 'Du får ett digitalt spåkort. Klicka eller tryck för att vända det – svaret visas med ett poetiskt AI-budskap.',
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
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
              <div className="w-16 h-16 bg-gradient-to-br from-mystical-purple to-purple-700 text-white rounded-xl flex items-center justify-center mb-6 mystical-glow">
                {step.icon}
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
                För underhållning och reflektion – inte medicinsk eller juridisk rådgivning.
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
