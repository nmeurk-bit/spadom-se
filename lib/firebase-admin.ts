// lib/firebase-admin.ts
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK (singleton pattern)
export function getFirebaseAdmin() {
  if (admin.apps.length === 0) {
    // For local development and Vercel deployment
    // If FIREBASE_SERVICE_ACCOUNT_KEY is set (as JSON string), use it
    // Otherwise, use GOOGLE_APPLICATION_CREDENTIALS or default credentials
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccount) {
      try {
        const credentials = JSON.parse(serviceAccount);
        admin.initializeApp({
          credential: admin.credential.cert(credentials),
        });
      } catch (error) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', error);
        // Fallback to default credentials
        admin.initializeApp();
      }
    } else {
      // Use default credentials (works with GOOGLE_APPLICATION_CREDENTIALS env var)
      // or Application Default Credentials in production
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
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
