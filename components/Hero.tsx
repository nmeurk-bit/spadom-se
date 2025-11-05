// components/Hero.tsx
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
      {/* Bakgrundsbild 
          OBS: Ersätt hero-tarot.jpg med en egen licensierad bild
          Rekommenderad storlek: minst 1920x1080px
      */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: 'url(/hero-tarot.jpg)' }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>

      {/* Innehåll */}
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
          Köp en spådom
        </h1>
        <p className="text-xl md:text-2xl text-white mb-8 drop-shadow-md">
          AI-driven andlig vägledning för underhållning och reflektion.
        </p>
        <Link
          href="/#priser"
          className="inline-block bg-mystical-gold text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl"
          aria-label="Köp en spådom"
        >
          Köp en spådom
        </Link>
      </div>
    </section>
  );
}
