// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import express from 'express';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Express app för webhooks
const app = express();

// Stripe webhook endpoint
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    console.error('No Stripe signature found');
    return res.status(400).send('No signature');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Hantera checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    try {
      await handleCheckoutCompleted(session);
      console.log('Checkout completed successfully for session:', session.id);
    } catch (error: any) {
      console.error('Error handling checkout:', error);
      return res.status(500).send('Error handling checkout');
    }
  }

  res.json({ received: true });
});

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
  const walletRef = admin.firestore().doc(`wallets/${userId}`);
  await admin.firestore().runTransaction(async (transaction) => {
    const walletDoc = await transaction.get(walletRef);
    
    if (!walletDoc.exists) {
      // Skapa wallet om den inte finns
      transaction.set(walletRef, {
        balance: quantity,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      // Öka befintligt saldo
      const currentBalance = walletDoc.data()?.balance || 0;
      transaction.update(walletRef, {
        balance: currentBalance + quantity,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });

  // Skapa order-post
  await admin.firestore().collection('orders').add({
    userId,
    quantity,
    amount,
    stripeSessionId: session.id,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Order created for user ${userId}: ${quantity} readings`);
}

// Hitta eller skapa användare baserat på e-post
async function ensureUserByEmail(email: string): Promise<string> {
  // Sök efter befintlig användare
  const usersRef = admin.firestore().collection('users');
  const querySnapshot = await usersRef.where('email', '==', email).limit(1).get();

  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].id;
  }

  // Skapa ny användare
  const newUserRef = await usersRef.add({
    email,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Skapa wallet
  await admin.firestore().doc(`wallets/${newUserRef.id}`).set({
    balance: 0,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Created new user: ${newUserRef.id} (${email})`);
  return newUserRef.id;
}

// Exportera Cloud Function
export const stripeWebhook = functions
  .region('europe-west1') // Använd EU-region
  .https.onRequest(app);
