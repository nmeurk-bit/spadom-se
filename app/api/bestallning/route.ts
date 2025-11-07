// app/api/bestallning/route.ts (Vercel-kompatibel version)
import { NextRequest, NextResponse } from 'next/server';
import { adminCreateReadingAtomic, adminUpdateReadingWithResponse } from '@/lib/firestore-admin';
import { generateFortune } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    // Hämta userId från request body istället för att verifiera token server-side
    // Frontend ska skicka userId efter att ha verifierat användaren där
    const body = await request.json();
    const { userId, personName, question, category } = body;

    // Validera userId
    if (!userId) {
      return NextResponse.json(
        { error: 'Du måste vara inloggad för att beställa en spådom.' },
        { status: 401 }
      );
    }

    // Validera personName
    if (!personName || typeof personName !== 'string' || personName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Namnet måste vara minst 2 tecken långt.' },
        { status: 400 }
      );
    }

    // Validera input
    if (!question || typeof question !== 'string' || question.trim().length < 10) {
      return NextResponse.json(
        { error: 'Frågan måste vara minst 10 tecken lång.' },
        { status: 400 }
      );
    }

    // Uppdaterade kategorier
    const validCategories = ['love', 'finance', 'self_development', 'spirituality', 'future', 'other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Ogiltig kategori.' },
        { status: 400 }
      );
    }

    // Skapa reading atomiskt (kontrollerar saldo och drar 1 kredit)
    const result = await adminCreateReadingAtomic(userId, {
      personName: personName.trim(),
      question: question.trim(),
      category,
    });

    if (!result.success) {
      console.error('createReadingAtomic failed:', result.error);

      if (result.error === 'insufficient_balance') {
        return NextResponse.json(
          { error: 'insufficient_balance' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: result.error || 'Kunde inte skapa beställning. Försök igen.' },
        { status: 500 }
      );
    }

    // Generera spådomen direkt med AI
    console.log('Genererar spådom för reading:', result.readingId);
    let fortune: string;

    try {
      fortune = await generateFortune(
        personName.trim(),
        question.trim(),
        category
      );
      console.log('Spådom genererad, längd:', fortune.length);
    } catch (error: any) {
      console.error('Kunde inte generera spådom:', error);
      return NextResponse.json(
        { error: 'Kunde inte generera spådom. Försök igen senare.' },
        { status: 500 }
      );
    }

    // Uppdatera reading med spådomen
    const updateResult = await adminUpdateReadingWithResponse(result.readingId!, fortune);

    if (!updateResult.success) {
      console.error('Kunde inte uppdatera reading med spådom:', updateResult.error);
      return NextResponse.json(
        { error: 'Spådom genererad men kunde inte sparas. Kontakta support.' },
        { status: 500 }
      );
    }

    // Returnera spådomen till frontend
    return NextResponse.json({
      success: true,
      readingId: result.readingId,
      fortune, // Den genererade spådomen
    });
  } catch (error: any) {
    console.error('Bestallning error:', error);
    return NextResponse.json(
      { error: 'Något gick fel vid beställning.' },
      { status: 500 }
    );
  }
}
