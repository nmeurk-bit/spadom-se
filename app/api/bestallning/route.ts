// app/api/bestallning/route.ts (Vercel-kompatibel version)
import { NextRequest, NextResponse } from 'next/server';
import { createReadingAtomic } from '@/lib/firestore';

export async function POST(request: NextRequest) {
  try {
    // Hämta userId från request body istället för att verifiera token server-side
    // Frontend ska skicka userId efter att ha verifierat användaren där
    const body = await request.json();
    const { userId, question, category, birthdate } = body;

    // Validera userId
    if (!userId) {
      return NextResponse.json(
        { error: 'Du måste vara inloggad för att beställa en spådom.' },
        { status: 401 }
      );
    }

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
