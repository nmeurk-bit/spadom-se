// app/page.tsx
import MysticalBackground from '@/components/MysticalBackground';
import NewHero from '@/components/NewHero';
import HowItWorks from '@/components/HowItWorks';
import NewPricing from '@/components/NewPricing';

export default function HomePage() {
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
