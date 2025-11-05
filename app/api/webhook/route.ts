// app/api/webhook/route.ts - Stripe webhook för Vercel
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ensureUserByEmail } from '@/lib/firestore';
import { firestore } from '@/lib/firebase';
import { doc, runTransaction, Timestamp, collection, setDoc, increment } from 'firebase/firestore';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found');
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Hantera checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      try {
        await handleCheckoutCompleted(session);
        console.log('Checkout completed successfully for session:', session.id);
      } catch (error: any) {
        console.error('Error handling checkout:', error);
        return NextResponse.json(
          { error: 'Error handling checkout' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Hantera completed checkout
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_details?.email || session.customer_email;
  const quantity = parseInt(session.metadata?.quantity || '0');
  const amount = session.amount_total || 0;

  if (!customerEmail) {
    throw new Error('No customer email found in session');
  }

  if (!quantity || quantity < 1) {
    throw new Error('Invalid quantity in session metadata');
  }

  console.log(`Processing order: ${quantity} readings for ${customerEmail}`);

  // Hitta eller skapa användare baserat på e-post
  const userId = await ensureUserByEmail(customerEmail);

  // Öka wallet balance atomiskt
  await runTransaction(firestore, async (transaction) => {
    const walletRef = doc(firestore, 'wallets', userId);
    const walletSnap = await transaction.get(walletRef);

    if (!walletSnap.exists()) {
      // Skapa wallet om den inte finns
      transaction.set(walletRef, {
        balance: quantity,
        updatedAt: Timestamp.now(),
      });
    } else {
      // Öka befintligt saldo
      const currentBalance = walletSnap.data()?.balance || 0;
      transaction.update(walletRef, {
        balance: currentBalance + quantity,
        updatedAt: Timestamp.now(),
      });
    }
  });

  // Skapa order-post
  const orderRef = doc(collection(firestore, 'orders'));
  await setDoc(orderRef, {
    userId,
    quantity,
    amount,
    stripeSessionId: session.id,
    createdAt: Timestamp.now(),
  });

  console.log(`Order created for user ${userId}: ${quantity} readings`);
}
