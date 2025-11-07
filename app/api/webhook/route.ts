// filepath: app/api/webhook/route.ts
import { NextResponse } from 'next/server';
import { adminIncWallet, adminCreateOrder, adminEnsureUserByEmail } from '@/lib/firestore-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Om nycklar saknas: gör inget men låt build gå igenom
  if (!secret || !webhookSecret) {
    return NextResponse.json({ ok: true, disabled: 'stripe' });
  }

  // ✅ Lazy import och ingen apiVersion (undviker TS-literal-fel)
  const Stripe = (await import('stripe')).default as any;
  const stripe = new Stripe(secret as string);

  const signature = req.headers.get('stripe-signature') || '';
  const rawBody = await req.text();

  try {
    let event;

    if (signature) {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret as string);
    } else {
      // For testing without signature verification
      event = JSON.parse(rawBody);
    }

    console.log('Webhook received:', event.type);

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      console.log('Processing checkout session:', session.id);
      console.log('Metadata:', session.metadata);

      // Get metadata from session
      const quantity = parseInt(session.metadata?.quantity || '0', 10);
      let userId = session.metadata?.userId;
      const customerEmail = session.customer_details?.email || session.customer_email;

      // Validate quantity
      if (![1, 5, 10].includes(quantity)) {
        console.error('Invalid quantity:', quantity);
        return NextResponse.json(
          { error: 'Invalid quantity in metadata' },
          { status: 400 }
        );
      }

      if (!customerEmail) {
        console.error('No customer email found in session');
        return NextResponse.json(
          { error: 'No customer email found' },
          { status: 400 }
        );
      }

      console.log('Processing payment for email:', customerEmail);
      console.log('Metadata userId:', userId);

      // If userId is provided in metadata, verify it exists and matches the email
      // Otherwise, ensure user exists by email (for backward compatibility)
      if (userId) {
        // Verify the userId exists and matches the email
        const { getAdminFirestore } = await import('@/lib/firebase-admin');
        const db = getAdminFirestore();
        const userDoc = await db.collection('users').doc(userId).get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          const userEmail = userData?.email?.toLowerCase();
          const customerEmailLower = customerEmail.toLowerCase();

          if (userEmail === customerEmailLower) {
            console.log('Using userId from metadata:', userId);
            // userId is valid and matches email, use it
          } else {
            console.warn('userId from metadata does not match email. userId email:', userEmail, 'customer email:', customerEmailLower);
            // Email mismatch - find user by email instead
            userId = await adminEnsureUserByEmail(customerEmail);
          }
        } else {
          console.warn('userId from metadata does not exist:', userId);
          // userId doesn't exist - find user by email instead
          userId = await adminEnsureUserByEmail(customerEmail);
        }
      } else {
        console.log('No userId in metadata, ensuring user by email');
        // No userId in metadata - find or create user by email
        userId = await adminEnsureUserByEmail(customerEmail);
      }

      console.log('Final User ID:', userId);

      // Create order in Firestore
      const orderId = await adminCreateOrder({
        userId,
        quantity,
        amount: session.amount_total || 0,
        stripeSessionId: session.id,
      });

      console.log('Order created:', orderId);

      // Update wallet balance
      await adminIncWallet(userId, quantity);

      console.log('Wallet updated. Added', quantity, 'prophecies to user', userId);

      return NextResponse.json({
        received: true,
        orderId,
        userId,
        quantity,
      });
    }

    // Return success for other event types
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json(
      { error: 'webhook processing failed', message: err?.message ?? 'unknown' },
      { status: 400 }
    );
  }
}
