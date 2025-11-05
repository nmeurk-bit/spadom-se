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
  const db = getAdminFirestore();
  const walletRef = db.collection('wallets').doc(userId);
  const walletDoc = await walletRef.get();

  if (walletDoc.exists) {
    return walletDoc.data() as AdminWallet;
  }

  // Create new wallet with 0 balance
  const newWallet: AdminWallet = {
    balance: 0,
    updatedAt: FieldValue.serverTimestamp() as any,
  };

  await walletRef.set(newWallet);
  return newWallet;
}

// Update wallet balance (admin only)
export async function adminIncWallet(userId: string, amount: number): Promise<void> {
  const db = getAdminFirestore();
  const walletRef = db.collection('wallets').doc(userId);

  await walletRef.set(
    {
      balance: FieldValue.increment(amount),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

// Create order (admin only)
export async function adminCreateOrder(orderData: Omit<AdminOrder, 'createdAt'>): Promise<string> {
  const db = getAdminFirestore();
  const orderRef = db.collection('orders').doc();

  await orderRef.set({
    ...orderData,
    createdAt: FieldValue.serverTimestamp(),
  });

  return orderRef.id;
}

// Get user by email
export async function adminGetUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
  const db = getAdminFirestore();
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email).limit(1).get();

  if (snapshot.empty) {
    return null;
  }

  const userDoc = snapshot.docs[0];
  return {
    id: userDoc.id,
    email: userDoc.data().email,
  };
}

// Ensure user exists by email (create if not exists)
export async function adminEnsureUserByEmail(email: string): Promise<string> {
  const existingUser = await adminGetUserByEmail(email);

  if (existingUser) {
    return existingUser.id;
  }

  // Create new user
  const db = getAdminFirestore();
  const userRef = db.collection('users').doc();

  await userRef.set({
    email,
    createdAt: FieldValue.serverTimestamp(),
  });

  // Create wallet for new user
  await getOrCreateWallet(userRef.id);

  return userRef.id;
}
