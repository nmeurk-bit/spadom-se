// app/api/admin/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/admin-auth';
import { isAdmin } from '@/lib/firestore-admin';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(user.uid);

    return NextResponse.json({
      isAdmin: userIsAdmin,
      userId: user.uid,
      email: user.email,
    });
  } catch (error: any) {
    console.error('Admin check error:', error);
    return NextResponse.json(
      { error: 'Failed to check admin status', isAdmin: false },
      { status: 500 }
    );
  }
}
