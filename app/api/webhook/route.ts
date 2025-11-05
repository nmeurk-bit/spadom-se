// filepath: app/api/webhook/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Saknas nycklar? Kör mjukt läge så build alltid funkar
  if (!secret || !webhookSecret) {
    return NextResponse.json({ ok: true, disabled: 'stripe' });
  }

  // ✅ Lazy-import och ingen apiVersion (undviker TS-literal-fel)
  const Stripe = (await import('stripe')).default as any;
  const stripe = new Stripe(secret as string);

  const signature = req.headers.get('stripe-signature') || '';
  const rawBody = await req.text();

  try {
    if (signature) {
      stripe.webhooks.constructEvent(rawBody, signature, webhookSecret as string);
    }
    // här kan du hantera eventet om du vill
    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'invalid webhook', message: err?.message ?? 'unknown' },
      { status: 400 }
    );
  }
}
