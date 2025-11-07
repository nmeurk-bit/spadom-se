// app/api/checkout/route.ts (Vercel-kompatibel version)
import { NextRequest, NextResponse } from 'next/server';
import { stripe, getPriceIdForQuantity } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quantity, userId } = body; // Ta emot userId från frontend istället

    // Validera quantity
    if (![1, 5, 10].includes(quantity)) {
      return NextResponse.json(
        { error: 'Ogiltigt antal. Välj 1, 5 eller 10 spådomar.' },
        { status: 400 }
      );
    }

    // Alla paket kräver userId (användaren måste vara inloggad i frontend)
    if (!userId) {
      return NextResponse.json(
        { error: 'Du måste vara inloggad för att köpa spådomar.' },
        { status: 401 }
      );
    }

    // Hämta price ID baserat på quantity
    const priceId = getPriceIdForQuantity(quantity as 1 | 5 | 10);

    if (!priceId) {
      console.error('Missing price ID for quantity:', quantity);
      return NextResponse.json(
        { error: 'Pris-ID saknas. Kontakta support.' },
        { status: 500 }
      );
    }

    // Kontrollera att NEXT_PUBLIC_BASE_URL är satt
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      console.error('NEXT_PUBLIC_BASE_URL is not set');
      return NextResponse.json(
        { error: 'Server-konfigurationsfel. Kontakta support.' },
        { status: 500 }
      );
    }

    // URL-encode base URL för att hantera svenska tecken som "å" i spådommen.se
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const successUrl = encodeURI(`${baseUrl}/tack?typ=betalning`);
    const cancelUrl = encodeURI(`${baseUrl}/`);

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
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        quantity: quantity.toString(),
        userId: userId, // userId krävs nu för alla paket
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
