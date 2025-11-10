// lib/metaPixel.ts
/**
 * Meta (Facebook) Pixel tracking utilities
 *
 * Denna fil hanterar Meta Pixel events med respekt för användarens samtycke.
 * Events skickas endast om användaren har accepterat marknadsföringscookies.
 */

export type MetaPixelEventName =
  | 'PageView'
  | 'ViewContent'
  | 'InitiateCheckout'
  | 'Purchase'
  | 'Lead';

interface MetaPixelEventParams {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  contents?: Array<{ id: string; quantity: number }>;
  currency?: string;
  value?: number;
  num_items?: number;
}

// Deklarera fbq på window-objektet
declare global {
  interface Window {
    fbq?: (
      command: 'track' | 'trackCustom' | 'init',
      eventName: string,
      params?: MetaPixelEventParams
    ) => void;
    _fbq?: typeof window.fbq;
  }
}

/**
 * Kontrollera om användaren har gett marknadsföringssamtycke
 */
export function hasMarketingConsent(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const consent = localStorage.getItem('cookie-consent-preferences');
    if (!consent) return false;

    const preferences = JSON.parse(consent);
    return preferences.marketing === true;
  } catch {
    return false;
  }
}

/**
 * Skicka event till Meta Pixel (endast om samtycke finns)
 */
export function trackMetaPixelEvent(
  eventName: MetaPixelEventName,
  params?: MetaPixelEventParams
): void {
  // Kontrollera samtycke
  if (!hasMarketingConsent()) {
    console.log(`[Meta Pixel] Event "${eventName}" skippades - inget marknadsföringssamtycke`);
    return;
  }

  // Kontrollera om fbq finns
  if (typeof window === 'undefined' || !window.fbq) {
    console.warn(`[Meta Pixel] fbq är inte laddat ännu för event "${eventName}"`);
    return;
  }

  try {
    console.log(`[Meta Pixel] Tracking event: ${eventName}`, params);
    window.fbq('track', eventName, params);
  } catch (error) {
    console.error(`[Meta Pixel] Fel vid tracking av ${eventName}:`, error);
  }
}

/**
 * Track PageView event
 */
export function trackPageView(): void {
  trackMetaPixelEvent('PageView');
}

/**
 * Track ViewContent event (för startsidan)
 */
export function trackViewContent(params?: {
  content_name?: string;
  content_category?: string;
}): void {
  trackMetaPixelEvent('ViewContent', params);
}

/**
 * Track InitiateCheckout event
 */
export function trackInitiateCheckout(params: {
  value: number;
  currency: string;
  num_items: number;
  content_ids?: string[];
}): void {
  trackMetaPixelEvent('InitiateCheckout', params);
}

/**
 * Track Purchase event
 */
export function trackPurchase(params: {
  value: number;
  currency: string;
  num_items: number;
  content_ids?: string[];
}): void {
  trackMetaPixelEvent('Purchase', params);
}
