// app/layout.tsx
import type { Metadata } from 'next';
// Temporarily using system fonts to avoid Google Fonts network dependency during build
// import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';

// const inter = Inter({
//   subsets: ['latin'],
//   display: 'swap',
//   fallback: ['system-ui', 'arial'],
// });

export const metadata: Metadata = {
  title: 'Spådommen.se - AI-driven andlig vägledning',
  description: 'Köp AI-genererade spådomar för underhållning och reflektion. Få svar på dina frågor om kärlek, karriär, ekonomi och mer.',
  keywords: ['spådom', 'tarot', 'AI', 'andlighet', 'vägledning', 'framtid'],
  authors: [{ name: 'Spådommen.se' }],
  openGraph: {
    title: 'Spådommen.se - AI-driven andlig vägledning',
    description: 'Köp AI-genererade spådomar för underhållning och reflektion.',
    url: 'https://www.xn--spdommen-b0a.se',
    siteName: 'Spådommen.se',
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
      <body className="font-sans">
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
