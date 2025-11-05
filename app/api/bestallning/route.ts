// app/api/bestallning/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { createReadingAtomic } from '@/lib/firestore';

// Initialize Firebase Admin (server-side)
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: NextRequest) {
  try {
    // Verifiera autentisering
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Du måste vara inloggad för att beställa en spådom.' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await auth().verifyIdToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Ogiltig inloggning. Vänligen logga in igen.' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // Hämta body
    const body = await request.json();
    const { question, category, birthdate } = body;

    // Validera input
    if (!question || typeof question !== 'string' || question.trim().length < 10) {
      return NextResponse.json(
        { error: 'Frågan måste vara minst 10 tecken lång.' },
        { status: 400 }
      );
    }

    if (!['love', 'career', 'finance', 'general'].includes(category)) {
      return NextResponse.json(
        { error: 'Ogiltig kategori.' },
        { status: 400 }
      );
    }

    // Skapa reading atomiskt (kontrollerar saldo och drar 1 kredit)
    const result = await createReadingAtomic(userId, {
      question: question.trim(),
      category,
      birthdate: birthdate || undefined,
    });

    if (!result.success) {
      if (result.error === 'insufficient_balance') {
        return NextResponse.json(
          { error: 'insufficient_balance' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Kunde inte skapa beställning. Försök igen.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      readingId: result.readingId,
    });
  } catch (error: any) {
    console.error('Bestallning error:', error);
    return NextResponse.json(
      { error: 'Något gick fel vid beställning.' },
      { status: 500 }
    );
  }
}
