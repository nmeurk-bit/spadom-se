// lib/firestore-admin.ts
// Admin functions for server-side operations (webhooks, Cloud Functions, etc.)

import { getAdminFirestore } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Types matching client-side types
export interface AdminOrder {
  userId: string;
  quantity: number;
  amount: number;
  stripeSessionId: string;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface AdminWallet {
  balance: number;
  updatedAt: FirebaseFirestore.Timestamp;
}

// Get or create wallet for user
export async function getOrCreateWallet(userId: string): Promise<AdminWallet> {
  try {
    console.log('📂 Getting/creating wallet for user:', userId);
    const db = getAdminFirestore();
    const walletRef = db.collection('wallets').doc(userId);
    const walletDoc = await walletRef.get();

    if (walletDoc.exists) {
      console.log('✅ Wallet found for user:', userId);
      return walletDoc.data() as AdminWallet;
    }

    // Create new wallet with 0 balance
    console.log('📝 Creating new wallet for user:', userId);
    const newWallet: AdminWallet = {
      balance: 0,
      updatedAt: FieldValue.serverTimestamp() as any,
    };

    await walletRef.set(newWallet);
    console.log('✅ Wallet created for user:', userId);
    return newWallet;
  } catch (error: any) {
    console.error('❌ Error in getOrCreateWallet:', error);
    console.error('Error code:', error.code);
    console.error('Error details:', error.details);
    throw new Error(`Failed to get/create wallet: ${error.message}`);
  }
}

// Update wallet balance (admin only)
export async function adminIncWallet(userId: string, amount: number): Promise<void> {
  try {
    console.log(`💰 Incrementing wallet for user ${userId} by ${amount}`);
    const db = getAdminFirestore();
    const walletRef = db.collection('wallets').doc(userId);

    await walletRef.set(
      {
        balance: FieldValue.increment(amount),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.log('✅ Wallet incremented successfully');
  } catch (error: any) {
    console.error('❌ Error in adminIncWallet:', error);
    console.error('Error code:', error.code);
    console.error('Error details:', error.details);
    throw new Error(`Failed to increment wallet: ${error.message}`);
  }
}

// Create order (admin only)
export async function adminCreateOrder(orderData: Omit<AdminOrder, 'createdAt'>): Promise<string> {
  try {
    console.log('📝 Creating order:', JSON.stringify(orderData));
    const db = getAdminFirestore();
    const orderRef = db.collection('orders').doc();

    await orderRef.set({
      ...orderData,
      createdAt: FieldValue.serverTimestamp(),
    });

    console.log('✅ Order created with ID:', orderRef.id);
    return orderRef.id;
  } catch (error: any) {
    console.error('❌ Error in adminCreateOrder:', error);
    console.error('Error code:', error.code);
    console.error('Error details:', error.details);
    throw new Error(`Failed to create order: ${error.message}`);
  }
}

// Get user by email
export async function adminGetUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
  try {
    console.log('🔍 Looking up user by email:', email);
    const db = getAdminFirestore();
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).limit(1).get();

    if (snapshot.empty) {
      console.log('ℹ️  No user found with email:', email);
      return null;
    }

    const userDoc = snapshot.docs[0];
    console.log('✅ User found with ID:', userDoc.id);
    return {
      id: userDoc.id,
      email: userDoc.data().email,
    };
  } catch (error: any) {
    console.error('❌ Error in adminGetUserByEmail:', error);
    console.error('Error code:', error.code);
    console.error('Error details:', error.details);
    throw new Error(`Failed to get user by email: ${error.message}`);
  }
}

// Ensure user exists by email (create if not exists)
export async function adminEnsureUserByEmail(email: string): Promise<string> {
  try {
    console.log('👤 Ensuring user exists for email:', email);
    const existingUser = await adminGetUserByEmail(email);

    if (existingUser) {
      console.log('✅ User already exists:', existingUser.id);
      return existingUser.id;
    }

    // Create new user
    console.log('📝 Creating new user for email:', email);
    const db = getAdminFirestore();
    const userRef = db.collection('users').doc();

    await userRef.set({
      email,
      createdAt: FieldValue.serverTimestamp(),
    });

    console.log('✅ User created with ID:', userRef.id);

    // Create wallet for new user
    await getOrCreateWallet(userRef.id);

    return userRef.id;
  } catch (error: any) {
    console.error('❌ Error in adminEnsureUserByEmail:', error);
    console.error('Error code:', error.code);
    console.error('Error details:', error.details);
    throw new Error(`Failed to ensure user exists: ${error.message}`);
  }
}
