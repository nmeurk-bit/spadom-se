// lib/metaConversionAPI.ts
/**
 * Meta Conversion API (CAPI) för server-side event tracking
 *
 * Skickar Purchase-events från servern till Meta för bättre tracking-noggrannhet.
 * Detta kompletterar client-side pixel tracking och hjälper till att undvika ad blockers.
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '730651153385469';
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;

interface PurchaseEventData {
  email: string;
  value: number; // Belopp i kronor
  currency: string; // 'SEK'
  numItems: number; // Antal spådomar
  orderId: string; // Order ID från Firestore
  eventSourceUrl?: string;
}

/**
 * Skicka Purchase event till Meta Conversion API
 */
export async function sendMetaPurchaseEvent(data: PurchaseEventData): Promise<void> {
  // Om ingen access token finns, skippa (för utveckling/test)
  if (!ACCESS_TOKEN) {
    console.log('[Meta CAPI] Ingen ACCESS_TOKEN - skippar Purchase event');
    return;
  }

  try {
    const eventTime = Math.floor(Date.now() / 1000); // Unix timestamp i sekunder

    // Hash email för användardata (GDPR-kompatibelt)
    const hashedEmail = await hashSHA256(data.email.toLowerCase().trim());

    const payload = {
      data: [
        {
          event_name: 'Purchase',
          event_time: eventTime,
          event_source_url: data.eventSourceUrl || 'https://spadom.se',
          action_source: 'website',
          user_data: {
            em: [hashedEmail], // Hashed email
          },
          custom_data: {
            value: data.value / 100, // Konvertera från öre till kronor (Stripe använder öre)
            currency: data.currency,
            num_items: data.numItems,
            content_ids: [`spadom_${data.numItems}`],
            content_type: 'product',
            order_id: data.orderId,
          },
        },
      ],
    };

    const url = `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[Meta CAPI] Fel vid skickning av Purchase event:', result);
      throw new Error(`Meta CAPI error: ${JSON.stringify(result)}`);
    }

    console.log('[Meta CAPI] Purchase event skickat:', {
      orderId: data.orderId,
      value: data.value / 100,
      currency: data.currency,
      numItems: data.numItems,
      eventsReceived: result.events_received,
      fbtrace_id: result.fbtrace_id,
    });
  } catch (error) {
    console.error('[Meta CAPI] Fel vid skickning av Purchase event:', error);
    // Vi kastar inte felet vidare så att webhook kan fortsätta även om Meta CAPI failar
  }
}

/**
 * Hash en sträng med SHA-256 (för GDPR-kompatibilitet)
 */
async function hashSHA256(text: string): Promise<string> {
  // Använd Web Crypto API (finns i Node.js 15+)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback för äldre Node.js-versioner
  const nodeCrypto = await import('crypto');
  return nodeCrypto.createHash('sha256').update(text).digest('hex');
}
