// lib/admin-auth.ts
// Helper functions for verifying admin access in API routes

import { cookies } from 'next/headers';
import { getAdminAuth } from './firebase-admin';
import { isAdmin } from './firestore-admin';

export interface AdminUser {
  uid: string;
  email: string;
}

/**
 * Verify that the request comes from an authenticated admin user
 * Returns the admin user if valid, null otherwise
 */
export async function verifyAdminAuth(request: Request): Promise<AdminUser | null> {
  try {
    // Get the session cookie or Authorization header
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    const authHeader = request.headers.get('Authorization');

    let idToken: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      idToken = authHeader.substring(7);
    } else if (sessionCookie) {
      // If using session cookies, verify them
      const auth = getAdminAuth();
      try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        const isUserAdmin = await isAdmin(decodedClaims.uid);

        if (!isUserAdmin) {
          return null;
        }

        return {
          uid: decodedClaims.uid,
          email: decodedClaims.email || '',
        };
      } catch (error) {
        console.error('Session cookie verification failed:', error);
        return null;
      }
    }

    // If we have an ID token, verify it
    if (idToken) {
      const auth = getAdminAuth();
      const decodedToken = await auth.verifyIdToken(idToken);
      const isUserAdmin = await isAdmin(decodedToken.uid);

      if (!isUserAdmin) {
        return null;
      }

      return {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
      };
    }

    return null;
  } catch (error) {
    console.error('Admin auth verification error:', error);
    return null;
  }
}

/**
 * Get admin user from Firebase Auth token in request
 * This is a simpler version that doesn't check admin status
 */
export async function getAuthUser(request: Request): Promise<AdminUser | null> {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const idToken = authHeader.substring(7);
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);

    return {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
    };
  } catch (error) {
    console.error('Auth user retrieval error:', error);
    return null;
  }
}
