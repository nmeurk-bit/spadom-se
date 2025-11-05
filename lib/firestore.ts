// lib/firestore.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  runTransaction,
  increment,
} from 'firebase/firestore';
import { getFirebaseFirestore } from './firebase';

// Helper to get firestore instance
const getDb = () => getFirebaseFirestore();

// Typer
export interface User {
  email: string;
  createdAt: Timestamp;
}

export interface Wallet {
  balance: number;
  updatedAt: Timestamp;
}

export interface Order {
  userId: string;
  quantity: number;
  amount: number;
  stripeSessionId: string;
  createdAt: Timestamp;
}

export interface Reading {
  userId: string;
  question: string;
  category: 'love' | 'career' | 'finance' | 'general';
  birthdate?: string;
  status: 'received' | 'processing' | 'completed';
  createdAt: Timestamp;
}

// Hämta användare baserat på email
export async function getUserByEmail(email: string): Promise<{ id: string; data: User } | null> {
  const usersRef = collection(getDb(), 'users');
  const q = query(usersRef, where('email', '==', email), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const userDoc = snapshot.docs[0];
  return {
    id: userDoc.id,
    data: userDoc.data() as User,
  };
}

// Säkerställ att användare finns, skapa om inte
export async function ensureUserByEmail(email: string): Promise<string> {
  const existingUser = await getUserByEmail(email);
  
  if (existingUser) {
    return existingUser.id;
  }

  // Skapa ny användare
  const userRef = doc(collection(getDb(), 'users'));
  const userId = userRef.id;

  await setDoc(userRef, {
    email,
    createdAt: Timestamp.now(),
  });

  // Skapa wallet för användaren
  const walletRef = doc(getDb(), 'wallets', userId);
  await setDoc(walletRef, {
    balance: 0,
    updatedAt: Timestamp.now(),
  });

  return userId;
}

// Hämta wallet
export async function getWallet(userId: string): Promise<Wallet | null> {
  const walletRef = doc(getDb(), 'wallets', userId);
  const walletSnap = await getDoc(walletRef);

  if (!walletSnap.exists()) {
    return null;
  }

  return walletSnap.data() as Wallet;
}

// Öka wallet balance (används endast av Cloud Functions)
// Denna funktion ska INTE anropas från klient-kod
export async function incWallet(userId: string, amount: number): Promise<void> {
  const walletRef = doc(getDb(), 'wallets', userId);
  await updateDoc(walletRef, {
    balance: increment(amount),
    updatedAt: Timestamp.now(),
  });
}

// Skapa order
export async function createOrder(orderData: Omit<Order, 'createdAt'>): Promise<string> {
  const orderRef = doc(collection(getDb(), 'orders'));
  await setDoc(orderRef, {
    ...orderData,
    createdAt: Timestamp.now(),
  });
  return orderRef.id;
}

// Skapa reading med atomisk kredit-dekrementering
export async function createReadingAtomic(
  userId: string,
  readingData: Omit<Reading, 'userId' | 'status' | 'createdAt'>
): Promise<{ success: boolean; readingId?: string; error?: string }> {
  try {
    const result = await runTransaction(getDb(), async (transaction) => {
      const walletRef = doc(getDb(), 'wallets', userId);
      const walletSnap = await transaction.get(walletRef);

      if (!walletSnap.exists()) {
        throw new Error('Wallet not found');
      }

      const wallet = walletSnap.data() as Wallet;

      if (wallet.balance < 1) {
        throw new Error('Insufficient balance');
      }

      // Skapa reading
      const readingRef = doc(collection(getDb(), 'readings'));
      transaction.set(readingRef, {
        userId,
        ...readingData,
        status: 'received',
        createdAt: Timestamp.now(),
      });

      // Dra 1 kredit
      transaction.update(walletRef, {
        balance: increment(-1),
        updatedAt: Timestamp.now(),
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

// Lista orders för användare
export async function listOrdersForUser(userId: string, limitCount: number = 10): Promise<Array<Order & { id: string }>> {
  const ordersRef = collection(getDb(), 'orders');
  // Remove orderBy to avoid requiring composite index - sort in JS instead
  const q = query(
    ordersRef,
    where('userId', '==', userId),
    limit(limitCount * 2) // Get more to ensure we have enough after sorting
  );

  const snapshot = await getDocs(q);
  const orders = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as Order,
  }));

  // Sort by createdAt descending (newest first) in JavaScript
  return orders
    .sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || 0;
      const timeB = b.createdAt?.toMillis?.() || 0;
      return timeB - timeA;
    })
    .slice(0, limitCount); // Take only the requested number
}

// Lista readings för användare
export async function listReadingsForUser(userId: string, limitCount: number = 10): Promise<Array<Reading & { id: string }>> {
  const readingsRef = collection(getDb(), 'readings');
  // Remove orderBy to avoid requiring composite index - sort in JS instead
  const q = query(
    readingsRef,
    where('userId', '==', userId),
    limit(limitCount * 2) // Get more to ensure we have enough after sorting
  );

  const snapshot = await getDocs(q);
  const readings = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as Reading,
  }));

  // Sort by createdAt descending (newest first) in JavaScript
  return readings
    .sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || 0;
      const timeB = b.createdAt?.toMillis?.() || 0;
      return timeB - timeA;
    })
    .slice(0, limitCount); // Take only the requested number
}
