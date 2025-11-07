// lib/openai.ts
import OpenAI from 'openai';

// Skapa OpenAI-klient
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Kategori till svenska beskrivningar
const categoryDescriptions = {
  love: 'kärlek och relationer',
  finance: 'ekonomi och karriär',
  self_development: 'personlig utveckling',
  spirituality: 'andlighet och själslig växt',
  future: 'framtiden och kommande möjligheter',
  other: 'livet och ditt inre',
};

/**
 * Generera en spådom baserat på användarens fråga och kategori
 */
export async function generateFortune(
  personName: string,
  question: string,
  category: 'love' | 'finance' | 'self_development' | 'spirituality' | 'future' | 'other'
): Promise<string> {
  const categoryDesc = categoryDescriptions[category];

  const systemPrompt = `Du är en vis och erfaren spåkunnig som ger insiktsfulla och personliga spådomar.
Din uppgift är att ge vägledning och perspektiv på frågor om livet.

Stil:
- Skriv poetiskt och mystiskt, men ändå tydligt
- Använd metaforer och symbolik från tarot, astrologi och naturens element
- Var positiv och uppmuntrande, men också ärlig
- Skriv på svenska
- Längd: 200-300 ord
- Undvik uppenbara klyschor
- Anpassa tonen efter frågan - allvarlig för djupa frågor, lättare för vardagliga

Struktur:
1. Inledning: Bekräfta frågan och sätt scenen (2-3 meningar)
2. Vägledning: Ge djupare insikter och perspektiv (huvuddel)
3. Avslutning: Konkret råd eller uppmuntran (2-3 meningar)

Viktigt: Detta är för underhållning och reflektion, inte faktisk spådom.`;

  const userPrompt = `Ge en spådom till ${personName} om ${categoryDesc}.

Fråga: "${question}"

Skapa en personlig, poetisk och insiktsfull spådom som ger perspektiv och vägledning.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const fortune = completion.choices[0]?.message?.content;

    if (!fortune) {
      throw new Error('Ingen spådom genererades');
    }

    return fortune.trim();
  } catch (error: any) {
    console.error('Error generating fortune:', error);
    throw new Error(`Kunde inte generera spådom: ${error.message}`);
  }
}
