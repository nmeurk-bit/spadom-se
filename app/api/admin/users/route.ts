// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { adminGetAllUsers, adminSearchUsersByEmail } from '@/lib/firestore-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request);

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const startAfter = searchParams.get('startAfter') || undefined;

    // If search term is provided, search users
    if (search) {
      const users = await adminSearchUsersByEmail(search);
      return NextResponse.json({ users });
    }

    // Otherwise, get all users with pagination
    const users = await adminGetAllUsers(limit, startAfter);
    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Admin users list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
