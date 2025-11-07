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

  const systemPrompt = `Du är en erfaren tarotläsare som ger autentiska tarotläsningar.
Din uppgift är att dra specifika tarotkort och tolka dem för att ge personlig vägledning.

Stil:
- Börja alltid med att nämna vilka tarotkort som dragits (3 kort: Dåtid, Nutid, Framtid)
- Använd riktiga tarotkort-namn (både Major och Minor Arcana)
- Ge en djupgående tolkning av varje kort i relation till frågan
- Skriv poetiskt och mystiskt, men ändå tydligt
- Var positiv och uppmuntrande, men också ärlig
- Skriv på svenska
- Längd: 300-400 ord
- Avsluta med konkret vägledning eller råd

Struktur:
1. Inledning: "Jag har dragit tre tarotkort för dig..."
2. Korten: Lista de tre korten (Dåtid, Nutid, Framtid)
3. Tolkning: Förklara varje korts betydelse och budskap
4. Sammanfattning: En helhetsbild av läsningen
5. Vägledning: Konkreta råd framåt (2-3 meningar)

Exempel på kort att använda:
Major Arcana: Dåren, Magikern, Högprästen, Kejsarinnan, Kejsaren, Hierofanten, Älskarna, Vagnen, Styrkan, Eremiten, Ödeshjulet, Rättvisan, Den Hängde, Döden, Måttfullheten, Djävulen, Tornet, Stjärnan, Månen, Solen, Domen, Världen

Minor Arcana: Stavar (Ess - Tio, Page, Riddare, Drottning, Kung), Bägare, Svärd, Mynt

Viktigt: Variera vilka kort som dras baserat på frågans natur och kategori. Detta är för underhållning och reflektion.`;

  const userPrompt = `Ge en autentisk tarotläsning till ${personName} om ${categoryDesc}.

Fråga: "${question}"

Dra tre relevanta tarotkort (Dåtid, Nutid, Framtid) och ge en djupgående tolkning som känns som en riktig tarotläsning.`;

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
