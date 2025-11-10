// components/MetaPixel.tsx
'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { trackPageView, hasMarketingConsent } from '@/lib/metaPixel';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '730651153385469';

export default function MetaPixel() {
  const pathname = usePathname();

  // Track PageView när route ändras
  useEffect(() => {
    // Skicka endast PageView om användaren har gett samtycke
    if (hasMarketingConsent()) {
      trackPageView();
    }
  }, [pathname]);

  // Ladda endast pixel-scriptet om användaren har gett samtycke
  // Vi lyssnar på custom event från CookieBanner
  useEffect(() => {
    const handleConsentChange = () => {
      if (hasMarketingConsent()) {
        // Initiera pixel om det inte redan är gjort
        if (window.fbq && !window._fbq) {
          window.fbq('init', PIXEL_ID);
          console.log('[Meta Pixel] Initialized after consent');
        }
      }
    };

    // Lyssna på consent-ändringar
    window.addEventListener('cookie-consent-changed', handleConsentChange);

    return () => {
      window.removeEventListener('cookie-consent-changed', handleConsentChange);
    };
  }, []);

  // Ladda endast script om samtycke redan finns
  const shouldLoadScript = typeof window !== 'undefined' && hasMarketingConsent();

  if (!shouldLoadScript) {
    return null;
  }

  return (
    <>
      {/* Meta Pixel Code */}
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
          `,
        }}
      />
      {/* Noscript Pixel */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
