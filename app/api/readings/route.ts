// app/api/readings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateProphecy, type Category } from '@/lib/ai';
import { adminGetWallet, adminCreateReadingAtomic } from '@/lib/firestore-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CreateReadingRequest {
  userId: string;
  targetName: string;
  category: Category;
  question: string;
}

export async function POST(request: NextRequest) {
  console.log('📖 POST /api/readings - Creating new prophecy');

  try {
    const body: CreateReadingRequest = await request.json();
    const { userId, targetName, category, question } = body;

    // Validera input
    if (!userId || !targetName || !category || !question) {
      return NextResponse.json(
        { error: 'Missing required fields', missing: { userId: !userId, targetName: !targetName, category: !category, question: !question } },
        { status: 400 }
      );
    }

    // Validera question length
    if (question.length < 10) {
      return NextResponse.json(
        { error: 'Question too short', message: 'Frågan måste vara minst 10 tecken lång' },
        { status: 400 }
      );
    }

    if (question.length > 500) {
      return NextResponse.json(
        { error: 'Question too long', message: 'Frågan får vara max 500 tecken' },
        { status: 400 }
      );
    }

    // Validera category
    const validCategories: Category[] = ['love', 'economy', 'self_development', 'spirituality', 'future', 'other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category', validCategories },
        { status: 400 }
      );
    }

    console.log('✅ Input validated');
    console.log('👤 User ID:', userId);
    console.log('🎯 Target:', targetName);
    console.log('📁 Category:', category);

    // Kolla saldo (innan vi genererar AI-svar för att spara resurser)
    console.log('💰 Checking wallet balance...');
    const wallet = await adminGetWallet(userId);

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found', message: 'Ditt konto hittades inte. Försök logga in igen.' },
        { status: 404 }
      );
    }

    if (wallet.balance < 1) {
      console.log('❌ Insufficient balance:', wallet.balance);
      return NextResponse.json(
        { error: 'Insufficient balance', message: 'Du har inga spådomar kvar. Köp fler först.', balance: wallet.balance },
        { status: 402 }
      );
    }

    console.log('✅ Balance OK:', wallet.balance);

    // Generera AI-svar
    console.log('🤖 Generating AI prophecy...');
    let answer: string;

    try {
      answer = await generateProphecy({
        targetName,
        category,
        question,
      });
      console.log('✅ AI prophecy generated');
      console.log('📝 Answer preview:', answer.substring(0, 100) + '...');
    } catch (aiError: any) {
      console.error('❌ AI generation failed:', aiError);
      return NextResponse.json(
        { error: 'AI generation failed', message: 'Något gick fel vid skapandet av spådomen. Försök igen.', details: aiError.message },
        { status: 500 }
      );
    }

    // Spara i Firestore med atomisk transaktion (skapar reading + drar -1 från wallet)
    console.log('💾 Saving reading to Firestore...');
    const result = await adminCreateReadingAtomic(userId, {
      targetName,
      category,
      question,
      answer, // Inkludera AI-svaret direkt
    });

    if (!result.success) {
      console.error('❌ Failed to create reading:', result.error);

      if (result.error === 'insufficient_balance') {
        return NextResponse.json(
          { error: 'Insufficient balance', message: 'Du har inga spådomar kvar. Köp fler först.' },
          { status: 402 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create reading', message: 'Något gick fel. Försök igen.' },
        { status: 500 }
      );
    }

    console.log('✅ Reading created with ID:', result.readingId);
    console.log('🎉 Prophecy creation complete!');

    // Returnera spådomen
    return NextResponse.json({
      success: true,
      readingId: result.readingId,
      answer,
      message: 'Spådom skapad!',
    });

  } catch (error: any) {
    console.error('❌ Unexpected error in /api/readings:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Något gick fel. Försök igen.', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint för att hämta en specifik reading
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const readingId = searchParams.get('id');

  if (!readingId) {
    return NextResponse.json(
      { error: 'Missing reading ID' },
      { status: 400 }
    );
  }

  // TODO: Implementera hämtning av reading
  // För nu returnerar vi bara ett placeholder-svar
  return NextResponse.json({
    message: 'GET /api/readings not fully implemented yet',
    readingId,
  });
}
