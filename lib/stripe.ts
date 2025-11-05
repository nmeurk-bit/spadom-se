// lib/stripe.ts
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

// Price constants - dessa ska matcha dina Stripe Price IDs
export const PRICE_IDS = {
  ONE: process.env.STRIPE_PRICE_ID_1 || '',
  FIVE: process.env.STRIPE_PRICE_ID_5 || '',
  TEN: process.env.STRIPE_PRICE_ID_10 || '',
};

// Mapping för quantity till price ID
export function getPriceIdForQuantity(quantity: 1 | 5 | 10): string {
  switch (quantity) {
    case 1:
      return PRICE_IDS.ONE;
    case 5:
      return PRICE_IDS.FIVE;
    case 10:
      return PRICE_IDS.TEN;
    default:
      throw new Error(`Invalid quantity: ${quantity}`);
  }
}
