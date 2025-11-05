// app/api/webhook/test/route.ts
// Test endpoint to verify webhook configuration
import { NextResponse } from 'next/server';
import { isFirebaseAdminConfigured } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: {
    timestamp: string;
    stripe: {
      secretKeyConfigured: boolean;
      webhookSecretConfigured: boolean;
      priceId1Configured: boolean;
      priceId5Configured: boolean;
      priceId10Configured: boolean;
    };
    firebase: {
      adminConfigured: boolean;
      publicApiKeyConfigured: boolean;
      projectIdConfigured: boolean;
      adminInitialized?: boolean;
      adminError?: string;
    };
    environment: {
      nodeEnv: string | undefined;
      baseUrl: string | undefined;
    };
  } = {
    timestamp: new Date().toISOString(),
    stripe: {
      secretKeyConfigured: !!process.env.STRIPE_SECRET_KEY,
      webhookSecretConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
      priceId1Configured: !!process.env.STRIPE_PRICE_ID_1,
      priceId5Configured: !!process.env.STRIPE_PRICE_ID_5,
      priceId10Configured: !!process.env.STRIPE_PRICE_ID_10,
    },
    firebase: {
      adminConfigured: isFirebaseAdminConfigured(),
      publicApiKeyConfigured: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      projectIdConfigured: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    }
  };

  // Test Firebase Admin initialization
  if (isFirebaseAdminConfigured()) {
    try {
      const { getAdminFirestore } = await import('@/lib/firebase-admin');
      getAdminFirestore();
      checks.firebase.adminInitialized = true;
    } catch (error: any) {
      checks.firebase.adminInitialized = false;
      checks.firebase.adminError = error.message;
    }
  }

  const allGood =
    checks.stripe.secretKeyConfigured &&
    checks.stripe.webhookSecretConfigured &&
    checks.firebase.adminConfigured;

  return NextResponse.json({
    status: allGood ? 'ready' : 'incomplete',
    message: allGood
      ? '✅ All systems configured and ready'
      : '⚠️  Some configuration is missing',
    checks,
    nextSteps: !allGood ? [
      !checks.stripe.secretKeyConfigured && 'Set STRIPE_SECRET_KEY environment variable',
      !checks.stripe.webhookSecretConfigured && 'Set STRIPE_WEBHOOK_SECRET environment variable',
      !checks.firebase.adminConfigured && 'Set FIREBASE_SERVICE_ACCOUNT_KEY environment variable',
    ].filter(Boolean) : []
  });
}
