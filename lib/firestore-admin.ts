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

export interface AdminUser {
  email: string;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface AdminReading {
  userId: string;
  personName: string;
  question: string;
  category: 'love' | 'finance' | 'self_development' | 'spirituality' | 'future' | 'other';
  status: 'received' | 'processing' | 'completed';
  createdAt: FirebaseFirestore.Timestamp;
}

export interface AdminLog {
  adminId: string;
  adminEmail: string;
  targetUserId: string;
  targetUserEmail: string;
  action: string; // e.g., "+5", "-1", "set=10"
  prevBalance: number;
  newBalance: number;
  note?: string;
  createdAt: FirebaseFirestore.Timestamp;
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

// ============================================================================
// ADMIN FUNCTIONS
// ============================================================================

// Check if user is admin
export async function isAdmin(userId: string): Promise<boolean> {
  const db = getAdminFirestore();
  const adminDoc = await db.collection('admins').doc(userId).get();
  return adminDoc.exists && adminDoc.data()?.isAdmin === true;
}

// Set admin status for a user
export async function setAdminStatus(userId: string, isAdmin: boolean): Promise<void> {
  const db = getAdminFirestore();
  await db.collection('admins').doc(userId).set({
    isAdmin,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
}

// Get all users with pagination
export async function adminGetAllUsers(
  limit: number = 50,
  startAfterEmail?: string
): Promise<Array<{ id: string; email: string; createdAt: FirebaseFirestore.Timestamp }>> {
  const db = getAdminFirestore();
  let query = db.collection('users').orderBy('email').limit(limit);

  if (startAfterEmail) {
    query = query.startAfter(startAfterEmail);
  }

  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    email: doc.data().email,
    createdAt: doc.data().createdAt,
  }));
}

// Search users by email
export async function adminSearchUsersByEmail(searchTerm: string): Promise<Array<{ id: string; email: string; createdAt: FirebaseFirestore.Timestamp }>> {
  const db = getAdminFirestore();
  // Firestore doesn't support full-text search, so we use range queries
  const snapshot = await db
    .collection('users')
    .where('email', '>=', searchTerm)
    .where('email', '<=', searchTerm + '\uf8ff')
    .limit(20)
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    email: doc.data().email,
    createdAt: doc.data().createdAt,
  }));
}

// Get user details with wallet, orders, and readings
export async function adminGetUserDetails(userId: string): Promise<{
  user: { id: string; email: string; createdAt: FirebaseFirestore.Timestamp } | null;
  wallet: AdminWallet | null;
  orders: Array<AdminOrder & { id: string }>;
  readings: Array<AdminReading & { id: string }>;
}> {
  const db = getAdminFirestore();

  // Get user
  const userDoc = await db.collection('users').doc(userId).get();
  const user = userDoc.exists ? {
    id: userDoc.id,
    email: userDoc.data()!.email,
    createdAt: userDoc.data()!.createdAt,
  } : null;

  // Get wallet
  const walletDoc = await db.collection('wallets').doc(userId).get();
  const wallet = walletDoc.exists ? walletDoc.data() as AdminWallet : null;

  // Get orders
  const ordersSnapshot = await db
    .collection('orders')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get();
  const orders = ordersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as AdminOrder,
  }));

  // Get readings
  const readingsSnapshot = await db
    .collection('readings')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get();
  const readings = readingsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as AdminReading,
  }));

  return { user, wallet, orders, readings };
}

// Adjust user balance (with audit logging)
export async function adminAdjustBalance(
  adminId: string,
  adminEmail: string,
  targetUserId: string,
  action: 'add' | 'subtract' | 'set',
  amount: number,
  note?: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  const db = getAdminFirestore();

  try {
    // Get target user email
    const userDoc = await db.collection('users').doc(targetUserId).get();
    if (!userDoc.exists) {
      return { success: false, error: 'User not found' };
    }
    const targetUserEmail = userDoc.data()!.email;

    // Get current wallet
    const walletRef = db.collection('wallets').doc(targetUserId);
    const walletDoc = await walletRef.get();
    const currentBalance = walletDoc.exists ? (walletDoc.data() as AdminWallet).balance : 0;

    // Calculate new balance
    let newBalance: number;
    let actionString: string;

    if (action === 'add') {
      newBalance = currentBalance + amount;
      actionString = `+${amount}`;
    } else if (action === 'subtract') {
      newBalance = Math.max(0, currentBalance - amount);
      actionString = `-${amount}`;
    } else if (action === 'set') {
      newBalance = amount;
      actionString = `set=${amount}`;
    } else {
      return { success: false, error: 'Invalid action' };
    }

    // Update wallet
    await walletRef.set({
      balance: newBalance,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    // Create audit log
    await db.collection('admin_logs').add({
      adminId,
      adminEmail,
      targetUserId,
      targetUserEmail,
      action: actionString,
      prevBalance: currentBalance,
      newBalance,
      note: note || '',
      createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true, newBalance };
  } catch (error: any) {
    console.error('Error adjusting balance:', error);
    return { success: false, error: error.message };
  }
}

// Get admin logs
export async function adminGetLogs(limit: number = 50): Promise<Array<AdminLog & { id: string }>> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection('admin_logs')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as AdminLog,
  }));
}

// Get stats for admin overview
export async function adminGetStats(): Promise<{
  totalUsers: number;
  totalOrders: number;
  totalReadings: number;
  totalBalance: number;
  recentOrders: Array<AdminOrder & { id: string; userEmail: string }>;
}> {
  const db = getAdminFirestore();

  // Count users
  const usersSnapshot = await db.collection('users').count().get();
  const totalUsers = usersSnapshot.data().count;

  // Count orders
  const ordersSnapshot = await db.collection('orders').count().get();
  const totalOrders = ordersSnapshot.data().count;

  // Count readings
  const readingsSnapshot = await db.collection('readings').count().get();
  const totalReadings = readingsSnapshot.data().count;

  // Calculate total balance (sum of all wallets)
  const walletsSnapshot = await db.collection('wallets').get();
  let totalBalance = 0;
  walletsSnapshot.docs.forEach(doc => {
    totalBalance += (doc.data() as AdminWallet).balance;
  });

  // Get recent orders with user emails
  const recentOrdersSnapshot = await db
    .collection('orders')
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get();

  const recentOrders = await Promise.all(
    recentOrdersSnapshot.docs.map(async (doc) => {
      const orderData = doc.data() as AdminOrder;
      const userDoc = await db.collection('users').doc(orderData.userId).get();
      const userEmail = userDoc.exists ? userDoc.data()!.email : 'Unknown';

      return {
        id: doc.id,
        ...orderData,
        userEmail,
      };
    })
  );

  return {
    totalUsers,
    totalOrders,
    totalReadings,
    totalBalance,
    recentOrders,
  };
}

// Create reading with atomic credit decrement (admin version)
export async function adminCreateReadingAtomic(
  userId: string,
  readingData: Omit<AdminReading, 'userId' | 'status' | 'createdAt'>
): Promise<{ success: boolean; readingId?: string; error?: string }> {
  const db = getAdminFirestore();

  try {
    const result = await db.runTransaction(async (transaction) => {
      const walletRef = db.collection('wallets').doc(userId);
      const walletDoc = await transaction.get(walletRef);

      if (!walletDoc.exists) {
        throw new Error('Wallet not found');
      }

      const wallet = walletDoc.data() as AdminWallet;

      if (wallet.balance < 1) {
        throw new Error('Insufficient balance');
      }

      // Create reading
      const readingRef = db.collection('readings').doc();
      transaction.set(readingRef, {
        userId,
        ...readingData,
        status: 'received',
        createdAt: FieldValue.serverTimestamp(),
      });

      // Deduct 1 credit
      transaction.update(walletRef, {
        balance: FieldValue.increment(-1),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return readingRef.id;
    });

    return { success: true, readingId: result };
  } catch (error: any) {
    if (error.message === 'Insufficient balance') {
      return { success: false, error: 'insufficient_balance' };
    }
    console.error('Error creating reading:', error);
    return { success: false, error: 'unknown_error' };
  }
}
