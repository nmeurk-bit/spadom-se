// app/api/readings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verifiera autentisering
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const readingId = params.id;
    const db = getAdminFirestore();

    // Hämta reading för att verifiera ägande
    const readingRef = db.collection('readings').doc(readingId);
    const readingDoc = await readingRef.get();

    if (!readingDoc.exists) {
      return NextResponse.json({ error: 'Reading not found' }, { status: 404 });
    }

    const reading = readingDoc.data();

    // Verifiera att användaren äger denna reading
    if (reading?.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Radera reading
    await readingRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete reading error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
