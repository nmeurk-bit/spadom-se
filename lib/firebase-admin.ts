// lib/firebase-admin.ts
import * as admin from 'firebase-admin';

let initError: Error | null = null;

// Initialize Firebase Admin SDK (singleton pattern)
export function getFirebaseAdmin() {
  if (admin.apps.length === 0) {
    try {
      // For local development and Vercel deployment
      // If FIREBASE_SERVICE_ACCOUNT_KEY is set (as JSON string), use it
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

      if (serviceAccount) {
        try {
          const credentials = JSON.parse(serviceAccount);
          console.log('Initializing Firebase Admin with service account credentials');
          admin.initializeApp({
            credential: admin.credential.cert(credentials),
          });
          console.log('Firebase Admin initialized successfully');
        } catch (error) {
          console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', error);
          throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format');
        }
      } else {
        console.warn('FIREBASE_SERVICE_ACCOUNT_KEY not found, attempting default credentials');
        // Try to use default credentials (works with GOOGLE_APPLICATION_CREDENTIALS env var)
        // This will likely fail in Vercel but might work locally or in GCP
        try {
          admin.initializeApp({
            credential: admin.credential.applicationDefault(),
          });
          console.log('Firebase Admin initialized with default credentials');
        } catch (error) {
          console.error('Failed to initialize Firebase Admin with default credentials:', error);
          throw new Error('Firebase Admin credentials not configured. Set FIREBASE_SERVICE_ACCOUNT_KEY environment variable.');
        }
      }
    } catch (error) {
      initError = error as Error;
      throw error;
    }
  }

  if (initError) {
    throw initError;
  }

  return admin;
}

// Get Firestore instance
export function getAdminFirestore() {
  return getFirebaseAdmin().firestore();
}

// Get Auth instance
export function getAdminAuth() {
  return getFirebaseAdmin().auth();
}

// Check if Firebase Admin is properly configured
export function isFirebaseAdminConfigured(): boolean {
  return !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
}
