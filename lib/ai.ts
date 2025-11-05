// lib/ai.ts
// AI-service för att generera spådomar

export type Category = 'love' | 'economy' | 'self_development' | 'spirituality' | 'future' | 'other';

interface ProphecyRequest {
  targetName: string;
  category: Category;
  question: string;
}

// Kategori-namn på svenska
const categoryNames: Record<Category, string> = {
  love: 'Kärlek',
  economy: 'Ekonomi',
  self_development: 'Självutveckling',
  spirituality: 'Andlighet',
  future: 'Framtiden',
  other: 'Övrigt',
};

// Skapa systemprompt baserat på kategori
function getSystemPrompt(category: Category): string {
  const baseTone = `Du är en erfaren och intuitiv spådam som använder tarotkort, intuition och symbolik för att ge vägledning.
Tala på svenska, använd symbolik och känslor.
Undvik att säga "det kommer hända" – ge istället tolkningar som "tecknen tyder på", "korten visar", eller "energin antyder".
Max 3 stycken. Var empatisk och mystisk.`;

  const categoryGuidance: Record<Category, string> = {
    love: 'Var mjuk och emotionell i din ton. Fokusera på känslor, relationer och hjärtat.',
    economy: 'Var realistisk men uppmuntrande. Tala om resurser, flöde och praktiska steg.',
    self_development: 'Var insiktsfull och stärkande. Fokusera på personlig tillväxt och inre kraft.',
    spirituality: 'Var mystisk och drömsk. Tala om andlig väg, intuition och högre medvetande.',
    future: 'Var nyfiket hoppfull. Tala om möjligheter, riktningar och vägval.',
    other: 'Var neutral och intuitiv. Anpassa dig efter frågan.',
  };

  return `${baseTone}\n\n${categoryGuidance[category]}`;
}

// Generera spådom med Claude (Anthropic)
async function generateWithClaude(request: ProphecyRequest): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const systemPrompt = getSystemPrompt(request.category);
  const userPrompt = `Skapa en spådom baserat på denna information:

Namn: ${request.targetName}
Område: ${categoryNames[request.category]}
Fråga: "${request.question}"

Ge ett varmt, insiktsfullt budskap på svenska. Använd tarotsymbolik och avsluuta med ett råd.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Claude API error:', error);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// Generera spådom med OpenAI
async function generateWithOpenAI(request: ProphecyRequest): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const systemPrompt = getSystemPrompt(request.category);
  const userPrompt = `Skapa en spådom baserat på denna information:

Namn: ${request.targetName}
Område: ${categoryNames[request.category]}
Fråga: "${request.question}"

Ge ett varmt, insiktsfullt budskap på svenska. Använd tarotsymbolik och avsluta med ett råd.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      max_tokens: 1024,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Huvudfunktion: Generera spådom (väljer automatiskt vilken AI som finns tillgänglig)
export async function generateProphecy(request: ProphecyRequest): Promise<string> {
  console.log('🔮 Generating prophecy for:', request.targetName);
  console.log('📁 Category:', request.category);
  console.log('❓ Question:', request.question);

  // Försök med Claude först, sedan OpenAI
  if (process.env.ANTHROPIC_API_KEY) {
    console.log('✨ Using Claude (Anthropic)');
    return await generateWithClaude(request);
  } else if (process.env.OPENAI_API_KEY) {
    console.log('✨ Using OpenAI');
    return await generateWithOpenAI(request);
  } else {
    throw new Error('No AI API key configured. Set either ANTHROPIC_API_KEY or OPENAI_API_KEY');
  }
}
