// filepath: app/api/webhook/route.ts
import { NextResponse } from 'next/server';
import { adminIncWallet, adminCreateOrder, adminEnsureUserByEmail } from '@/lib/firestore-admin';
import { isFirebaseAdminConfigured } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  console.log('=== Webhook POST request received ===');

  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Om nycklar saknas: gör inget men låt build gå igenom
  if (!secret || !webhookSecret) {
    console.warn('Stripe keys not configured, webhook disabled');
    return NextResponse.json({ ok: true, disabled: 'stripe', message: 'Stripe not configured' });
  }

  // Check if Firebase Admin is configured
  if (!isFirebaseAdminConfigured()) {
    console.error('❌ Firebase Admin credentials not configured!');
    console.error('Set FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
    return NextResponse.json(
      {
        error: 'Firebase Admin not configured',
        message: 'Set FIREBASE_SERVICE_ACCOUNT_KEY environment variable in your deployment settings'
      },
      { status: 500 }
    );
  }

  console.log('✅ Firebase Admin is configured');

  // ✅ Lazy import och ingen apiVersion (undviker TS-literal-fel)
  const Stripe = (await import('stripe')).default as any;
  const stripe = new Stripe(secret as string);

  const signature = req.headers.get('stripe-signature') || '';
  const rawBody = await req.text();

  try {
    let event;

    if (signature) {
      console.log('Verifying webhook signature...');
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret as string);
      console.log('✅ Webhook signature verified');
    } else {
      console.warn('⚠️  No signature provided, parsing raw body (development mode only)');
      // For testing without signature verification
      event = JSON.parse(rawBody);
    }

    console.log('📥 Webhook event type:', event.type);

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      console.log('🎯 Processing checkout.session.completed');
      console.log('Session ID:', session.id);
      console.log('Metadata:', JSON.stringify(session.metadata, null, 2));
      console.log('Customer email:', session.customer_details?.email || session.customer_email);
      console.log('Amount total:', session.amount_total);

      // Get metadata from session
      const quantity = parseInt(session.metadata?.quantity || '0', 10);
      let userId = session.metadata?.userId;
      const customerEmail = session.customer_details?.email || session.customer_email;

      console.log('Parsed quantity:', quantity);
      console.log('Parsed userId:', userId);

      // Validate quantity
      if (![1, 5, 10].includes(quantity)) {
        console.error('❌ Invalid quantity:', quantity);
        return NextResponse.json(
          { error: 'Invalid quantity in metadata', quantity },
          { status: 400 }
        );
      }

      // If userId is 'guest' or not provided, find/create user by email
      if (!userId || userId === 'guest') {
        if (!customerEmail) {
          console.error('❌ No customer email found in session');
          return NextResponse.json(
            { error: 'No customer email found' },
            { status: 400 }
          );
        }

        console.log('👤 Finding/creating user for email:', customerEmail);
        try {
          userId = await adminEnsureUserByEmail(customerEmail);
          console.log('✅ User found/created with ID:', userId);
        } catch (error) {
          console.error('❌ Failed to ensure user:', error);
          throw error;
        }
      }

      console.log('📝 Creating order in Firestore...');
      try {
        // Create order in Firestore
        const orderId = await adminCreateOrder({
          userId,
          quantity,
          amount: session.amount_total || 0,
          stripeSessionId: session.id,
        });
        console.log('✅ Order created with ID:', orderId);

        // Update wallet balance
        console.log('💰 Updating wallet balance...');
        await adminIncWallet(userId, quantity);
        console.log(`✅ Wallet updated! Added ${quantity} prophecies to user ${userId}`);

        console.log('🎉 Purchase processing completed successfully!');

        return NextResponse.json({
          received: true,
          success: true,
          orderId,
          userId,
          quantity,
          message: `Successfully added ${quantity} prophecies to user account`
        });
      } catch (error) {
        console.error('❌ Failed to create order or update wallet:', error);
        throw error;
      }
    }

    // Return success for other event types
    console.log('ℹ️  Event type not handled:', event.type);
    return NextResponse.json({ received: true, eventType: event.type });
  } catch (err: any) {
    console.error('❌ Webhook error:', err);
    console.error('Error stack:', err.stack);
    return NextResponse.json(
      {
        error: 'webhook processing failed',
        message: err?.message ?? 'unknown',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      },
      { status: 400 }
    );
  }
}
