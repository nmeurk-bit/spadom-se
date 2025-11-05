// app/api/firestore-test/route.ts
// Test endpoint to verify Firestore connectivity
import { NextResponse } from 'next/server';
import { isFirebaseAdminConfigured } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('=== Firestore Test Started ===');

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Firebase Admin not configured',
      message: 'Set FIREBASE_SERVICE_ACCOUNT_KEY environment variable'
    }, { status: 500 });
  }

  try {
    const { getAdminFirestore } = await import('@/lib/firebase-admin');
    const db = getAdminFirestore();

    // Test 1: List collections
    console.log('Test 1: Listing collections...');
    const collections = await db.listCollections();
    const collectionNames = collections.map(col => col.id);
    console.log('Collections found:', collectionNames);

    // Test 2: Try to read from users collection
    console.log('Test 2: Reading from users collection...');
    const usersSnapshot = await db.collection('users').limit(5).get();
    console.log('Users found:', usersSnapshot.size);

    // Test 3: Try to read from wallets collection
    console.log('Test 3: Reading from wallets collection...');
    const walletsSnapshot = await db.collection('wallets').limit(5).get();
    console.log('Wallets found:', walletsSnapshot.size);

    // Test 4: Try to create a test document
    console.log('Test 4: Creating test document...');
    const testRef = db.collection('_test').doc('test-doc');
    await testRef.set({
      test: true,
      timestamp: new Date().toISOString()
    });
    console.log('Test document created');

    // Test 5: Read it back
    console.log('Test 5: Reading test document...');
    const testDoc = await testRef.get();
    console.log('Test document exists:', testDoc.exists);

    // Test 6: Delete it
    console.log('Test 6: Deleting test document...');
    await testRef.delete();
    console.log('Test document deleted');

    return NextResponse.json({
      success: true,
      message: 'All Firestore tests passed!',
      results: {
        collections: collectionNames,
        usersCount: usersSnapshot.size,
        walletsCount: walletsSnapshot.size,
        writeTest: 'passed',
        readTest: 'passed',
        deleteTest: 'passed'
      }
    });

  } catch (error: any) {
    console.error('Firestore test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    console.error('Error stack:', error.stack);

    return NextResponse.json({
      success: false,
      error: 'Firestore test failed',
      errorCode: error.code,
      errorMessage: error.message,
      errorDetails: error.details || 'No additional details',
      possibleCauses: [
        'Firestore database not created in Firebase Console',
        'Wrong project ID in service account credentials',
        'Insufficient permissions for service account',
        'Firestore in wrong mode (should be Native mode, not Datastore mode)'
      ]
    }, { status: 500 });
  }
}
