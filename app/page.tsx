// app/page.tsx
'use client';

import { useEffect } from 'react';
import MysticalBackground from '@/components/MysticalBackground';
import NewHero from '@/components/NewHero';
import HowItWorks from '@/components/HowItWorks';
import NewPricing from '@/components/NewPricing';
import { trackViewContent } from '@/lib/metaPixel';

export default function HomePage() {
  // Track ViewContent när startsidan laddas
  useEffect(() => {
    trackViewContent({
      content_name: 'Startsida - Spådom.se',
      content_category: 'homepage',
    });
  }, []);

  return (
    <>
      {/* Mystisk bakgrund med stjärnor och dimma */}
      <MysticalBackground />

      {/* Hero-sektion med logga, interaktivt tarotkort och CTA */}
      <NewHero />

      {/* Så fungerar det - pedagogisk sektion med 5 steg */}
      <HowItWorks />

      {/* Prissektion med nya priser och mörk stil */}
      <NewPricing />
    </>
  );
}
