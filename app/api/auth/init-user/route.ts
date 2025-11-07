// app/api/auth/init-user/route.ts
// Creates Firestore user and wallet for newly signed up user
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'Missing idToken' },
        { status: 400 }
      );
    }

    // Verify the Firebase ID token
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const email = decodedToken.email;

    if (!email) {
      return NextResponse.json(
        { error: 'No email found in token' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();

    // Check if user document already exists
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Create user document with the auth UID
      await userRef.set({
        email: email.toLowerCase(), // Normalize email to lowercase
        createdAt: FieldValue.serverTimestamp(),
      });

      console.log('Created Firestore user:', userId, email);
    }

    // Check if wallet already exists
    const walletRef = db.collection('wallets').doc(userId);
    const walletDoc = await walletRef.get();

    if (!walletDoc.exists) {
      // Create wallet with 0 balance
      await walletRef.set({
        balance: 0,
        updatedAt: FieldValue.serverTimestamp(),
      });

      console.log('Created wallet for user:', userId);
    }

    return NextResponse.json({
      success: true,
      userId,
    });
  } catch (error: any) {
    console.error('Init user error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize user', details: error.message },
      { status: 500 }
    );
  }
}
