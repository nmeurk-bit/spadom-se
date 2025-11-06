// app/api/admin/sync-users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { getAdminAuth } from '@/lib/firebase-admin';
import { adminEnsureUserByEmail } from '@/lib/firestore-admin';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request);

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    console.log('[SyncUsers] Starting user sync from Firebase Auth to Firestore...');

    const auth = getAdminAuth();
    let syncedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // List all users from Firebase Authentication
    const listUsersResult = await auth.listUsers();

    console.log(`[SyncUsers] Found ${listUsersResult.users.length} users in Firebase Auth`);

    // Sync each user to Firestore
    for (const userRecord of listUsersResult.users) {
      if (userRecord.email) {
        try {
          await adminEnsureUserByEmail(userRecord.email);
          syncedCount++;
          console.log(`[SyncUsers] Synced user: ${userRecord.email}`);
        } catch (error: any) {
          errorCount++;
          const errorMsg = `Failed to sync ${userRecord.email}: ${error.message}`;
          errors.push(errorMsg);
          console.error(`[SyncUsers] ${errorMsg}`);
        }
      }
    }

    console.log(`[SyncUsers] Sync complete: ${syncedCount} synced, ${errorCount} errors`);

    return NextResponse.json({
      success: true,
      totalUsers: listUsersResult.users.length,
      syncedCount,
      errorCount,
      errors: errorCount > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Sync users error:', error);
    return NextResponse.json(
      { error: 'Failed to sync users' },
      { status: 500 }
    );
  }
}
