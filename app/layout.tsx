// app/layout.tsx
import type { Metadata } from 'next';
// Temporarily using system fonts to avoid Google Fonts network dependency during build
// import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import MetaPixel from '@/components/MetaPixel';

// const inter = Inter({
//   subsets: ['latin'],
//   display: 'swap',
//   fallback: ['system-ui', 'arial'],
// });

export const metadata: Metadata = {
  title: 'Spådom.se - Personliga spådomar när du behöver vägledning',
  description: 'Få personliga spådomar för reflektion och vägledning. Utforska frågor om kärlek, ekonomi, självutveckling och din framtid.',
  keywords: ['spådom', 'tarot', 'personlig vägledning', 'andlighet', 'kärlek', 'ekonomi', 'framtid', 'självutveckling'],
  authors: [{ name: 'Spådom.se' }],
  openGraph: {
    title: 'Spådom.se - Personliga spådomar när du behöver vägledning',
    description: 'Få personliga spådomar för reflektion och vägledning. Utforska frågor om kärlek, ekonomi, självutveckling och din framtid.',
    url: 'https://spadom.se',
    siteName: 'Spådom.se',
    locale: 'sv_SE',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <body className="font-sans bg-gray-900">
        <MetaPixel />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <CookieBanner />
        </div>
      </body>
    </html>
  );
}
