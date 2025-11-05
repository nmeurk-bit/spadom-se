// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe, getPriceIdForQuantity } from '@/lib/stripe';
import { auth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin (server-side)
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quantity } = body;

    // Validera quantity
    if (![1, 5, 10].includes(quantity)) {
      return NextResponse.json(
        { error: 'Ogiltigt antal. Välj 1, 5 eller 10 spådomar.' },
        { status: 400 }
      );
    }

    // För 5 och 10 spådomar, kräv inloggning
    if (quantity !== 1) {
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Du måste vara inloggad för att köpa detta paket.' },
          { status: 401 }
        );
      }

      const token = authHeader.split('Bearer ')[1];
      
      try {
        await auth().verifyIdToken(token);
      } catch (error) {
        return NextResponse.json(
          { error: 'Ogiltig inloggning. Vänligen logga in igen.' },
          { status: 401 }
        );
      }
    }

    // Hämta price ID baserat på quantity
    const priceId = getPriceIdForQuantity(quantity as 1 | 5 | 10);

    if (!priceId) {
      return NextResponse.json(
        { error: 'Pris-ID saknas. Kontakta support.' },
        { status: 500 }
      );
    }

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
