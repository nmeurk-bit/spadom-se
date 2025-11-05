// app/api/checkout/route.ts (Vercel-kompatibel version med soft-off)
import { NextRequest, NextResponse } from 'next/server';
import { getPriceIdForQuantity } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    // Soft-off: Om Stripe-nyckel saknas, returnera OK utan att köra Stripe-kod
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ ok: true, disabled: 'stripe' }, { status: 200 });
    }

    const body = await request.json();
    const { quantity, userId } = body;

    // Validera quantity
    if (![1, 5, 10].includes(quantity)) {
      return NextResponse.json(
        { error: 'Ogiltigt antal. Välj 1, 5 eller 10 spådomar.' },
        { status: 400 }
      );
    }

    // För 5 och 10 spådomar, kräv userId (användaren måste vara inloggad i frontend)
    if (quantity !== 1 && !userId) {
      return NextResponse.json(
        { error: 'Du måste vara inloggad för att köpa detta paket.' },
        { status: 401 }
      );
    }

    // Hämta price ID baserat på quantity
    const priceId = getPriceIdForQuantity(quantity as 1 | 5 | 10);

    if (!priceId) {
      return NextResponse.json(
        { error: 'Pris-ID saknas. Kontakta support.' },
        { status: 500 }
      );
    }

    // Lazy import av Stripe (endast om nyckel finns)
    const Stripe = (await import('stripe')).default as any;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Skapa Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: undefined, // Stripe kommer att fråga efter e-post
      billing_address_collection: 'required',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tack?typ=betalning`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
      metadata: {
        quantity: quantity.toString(),
        userId: userId || 'guest', // Skicka userId om tillgängligt
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Något gick fel vid skapande av betalningssession.' },
      { status: 500 }
    );
  }
}
