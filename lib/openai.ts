// lib/openai.ts
import OpenAI from 'openai';

// Lazy initialize OpenAI client to avoid build-time errors
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }
  return openai;
}

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

  const systemPrompt = `Du är en erfaren spådam som tolkar tarotkort och energier. Du ska skriva en personlig spådom som känns levande, trovärdig och emotionellt äkta.

Ton & stil:
- Låt texten vara mystisk men jordnära, som om en riktig spådam pratar direkt till personen.
- Undvik överdrivna klichéer ("allt kommer gå perfekt", "du är magisk" osv).
- Blanda positiva, utmanande och neutrala budskap — allt behöver inte sluta lyckligt, men det ska alltid finnas någon form av lärdom eller vägledning.
- Du får gärna använda lätt symbolik från tarot, stjärntecken, intuition eller drömmar, men inte så mycket att det känns oäkta.
- Håll texten personlig, varm och lite poetisk.

Struktur:
1. Inledning: Beskriv kort vad du "ser" eller "känner" när du läser personens energi eller kort.
2. Mitt: Tala om de krafter, hinder eller möjligheter som visar sig.
3. Avslutning: Ge ett råd eller en insikt som personen kan ta med sig.

Exempel på ton:
- "Jag ser en väg som delar sig — ena sidan leder till något tryggt, den andra till något okänt men spännande."
- "Det finns en rastlöshet i dig, som om ditt hjärta väntar på att du ska fatta ett beslut du skjutit upp."
- "Allt kommer inte lätt, men det finns mening i den här prövningen — du växer genom det du nu går igenom."

Undvik:
- Överdrivet positivitet (t.ex. "allt kommer gå fantastiskt bra!")
- Tomma fraser ("du har stark energi", "universum är med dig")
- Att nämna AI, datorer eller att det är genererat.

Extra instruktion:
Ge varje spådom en känsla av unik berättelse — den ska kunna väcka både hopp, eftertanke och ibland lite oro.

Längd: ca 150–200 ord.
Skriv på svenska.`;

  const userPrompt = `Ge en personlig spådom till ${personName} om ${categoryDesc}.

Fråga: "${question}"

Tolka personens energi och situation. Ge vägledning som känns äkta, personlig och innehåller både ljus och skugga.`;

  try {
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.9,
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
