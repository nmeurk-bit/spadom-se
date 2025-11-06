// app/api/admin/balance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { adminAdjustBalance } from '@/lib/firestore-admin';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request);

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { userId, action, amount, note } = body;

    // Validate input
    if (!userId || !action || typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: userId, action, amount' },
        { status: 400 }
      );
    }

    if (!['add', 'subtract', 'set'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: add, subtract, or set' },
        { status: 400 }
      );
    }

    if (amount < 0) {
      return NextResponse.json(
        { error: 'Amount must be non-negative' },
        { status: 400 }
      );
    }

    // Adjust balance
    const result = await adminAdjustBalance(
      admin.uid,
      admin.email,
      userId,
      action,
      amount,
      note
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to adjust balance' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      newBalance: result.newBalance,
    });
  } catch (error: any) {
    console.error('Admin balance adjustment error:', error);
    return NextResponse.json(
      { error: 'Failed to adjust balance' },
      { status: 500 }
    );
  }
}
