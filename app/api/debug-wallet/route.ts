// app/api/debug-wallet/route.ts
// Debug endpoint to check wallet and user data
import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const email = searchParams.get('email');

  if (!userId && !email) {
    return NextResponse.json({
      error: 'Missing parameter',
      message: 'Provide either userId or email as query parameter',
      usage: '/api/debug-wallet?userId=xxx or /api/debug-wallet?email=xxx@example.com'
    }, { status: 400 });
  }

  try {
    const db = getAdminFirestore();
    let targetUserId = userId;

    // If email provided, find user by email
    if (email) {
      console.log('Looking up user by email:', email);
      const usersSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();

      if (usersSnapshot.empty) {
        return NextResponse.json({
          found: false,
          message: 'No user found with that email',
          email
        });
      }

      targetUserId = usersSnapshot.docs[0].id;
    }

    if (!targetUserId) {
      return NextResponse.json({
        error: 'No userId found',
        message: 'Could not determine userId'
      }, { status: 400 });
    }

    console.log('Checking data for userId:', targetUserId);

    // Get user document
    const userDoc = await db.collection('users').doc(targetUserId).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    // Get wallet
    const walletDoc = await db.collection('wallets').doc(targetUserId).get();
    const walletData = walletDoc.exists ? walletDoc.data() : null;

    // Get orders
    const ordersSnapshot = await db.collection('orders')
      .where('userId', '==', targetUserId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const orders = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get readings
    const readingsSnapshot = await db.collection('readings')
      .where('userId', '==', targetUserId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const readings = readingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      found: true,
      userId: targetUserId,
      user: {
        exists: userDoc.exists,
        data: userData
      },
      wallet: {
        exists: walletDoc.exists,
        data: walletData,
        balance: walletData?.balance || 0
      },
      orders: {
        count: orders.length,
        data: orders
      },
      readings: {
        count: readings.length,
        data: readings
      },
      summary: {
        userExists: userDoc.exists,
        walletExists: walletDoc.exists,
        currentBalance: walletData?.balance || 0,
        totalOrders: orders.length,
        totalReadings: readings.length
      }
    });

  } catch (error: any) {
    console.error('Debug wallet error:', error);
    return NextResponse.json({
      error: 'Failed to fetch wallet data',
      message: error.message,
      code: error.code
    }, { status: 500 });
  }
}
