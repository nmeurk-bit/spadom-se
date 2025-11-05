// app/api/debug-ai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateProphecy } from '@/lib/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const debug = {
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    anthropicKeyPrefix: process.env.ANTHROPIC_API_KEY?.substring(0, 10) || 'not set',
    openaiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10) || 'not set',
  };

  console.log('🔍 AI Debug Info:', debug);

  // Test AI generation
  try {
    console.log('🧪 Testing AI generation...');
    const testProphecy = await generateProphecy({
      targetName: 'Test',
      category: 'love',
      question: 'Detta är en testfråga för att se om AI fungerar korrekt.',
    });

    return NextResponse.json({
      success: true,
      debug,
      testResult: {
        success: true,
        prophecyLength: testProphecy.length,
        prophecyPreview: testProphecy.substring(0, 100) + '...',
      },
    });
  } catch (error: any) {
    console.error('❌ AI test failed:', error);
    return NextResponse.json({
      success: false,
      debug,
      error: {
        message: error.message,
        stack: error.stack,
      },
    }, { status: 500 });
  }
}
