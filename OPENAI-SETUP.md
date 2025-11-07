# OpenAI Setup för AI-Genererade Spådomar

Detta projekt använder OpenAI's GPT-4 för att generera personliga spådomar direkt när användaren beställer en spådom.

## Installera OpenAI Package

Kör följande kommando i projektmappen:

```bash
npm install openai
```

## Konfigurera API-Nyckel

### 1. Skaffa API-Nyckel från OpenAI

1. Gå till [OpenAI Platform](https://platform.openai.com/)
2. Logga in eller skapa ett konto
3. Gå till [API Keys](https://platform.openai.com/api-keys)
4. Klicka på "Create new secret key"
5. Kopiera nyckeln (den börjar med `sk-`)

### 2. Lägg till i Environment Variables

#### För Local Development

Skapa eller uppdatera `.env.local` filen i projektmappen:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

#### För Vercel Production

1. Gå till ditt projekt på [Vercel Dashboard](https://vercel.com/)
2. Gå till **Settings** → **Environment Variables**
3. Lägg till en ny variabel:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** `sk-your-actual-api-key-here`
   - **Environment:** Production (och eventuellt Preview/Development)
4. Klicka "Save"
5. **Redeploya projektet** för att ändringarna ska träda i kraft

## Hur det Fungerar

### 1. Användaren Beställer en Spådom

När användaren fyller i formuläret på `/bestallning` och klickar "Beställ spådom":

1. Backend drar 1 kredit från användarens wallet
2. Skapar en reading i Firestore med status `'received'`
3. **Anropar OpenAI's API** för att generera spådomen direkt
4. Uppdaterar reading med spådomen och sätter status till `'completed'`
5. Returnerar spådomen till frontend

### 2. Visuell Upplevelse

Frontend visar ett interaktivt spådomskort:

- **Baksida:** Mystisk tarot-design med guldram och symboler
- **Användaren klickar:** Kortet flippar med 3D-animation
- **Framsida:** Visar den genererade spådomen i elegant design
- **Sparas automatiskt:** Spådomen finns sedan i "Mina Spådomar"

### 3. AI-Prompt

Spådomen genereras med en fin prompt som ger:

- Poetisk och mystisk stil
- Personligt anpassad efter namn, fråga och kategori
- 200-300 ord lång
- Uppdelad i: Inledning, Vägledning, Avslutning
- Använder metaforer från tarot, astrologi och naturens element

## Kostnad

OpenAI's API kostar per token. Med GPT-4 Turbo:

- **Input:** ~$0.01 per 1000 tokens
- **Output:** ~$0.03 per 1000 tokens

En typisk spådom (300 ord) kostar cirka **$0.02-0.03** per generation.

### Uppskattad Månadskostnad

Om du genererar:
- **100 spådomar/månad:** ~$2-3
- **500 spådomar/månad:** ~$10-15
- **1000 spådomar/månad:** ~$20-30

## Felsökning

### "Module not found: Can't resolve 'openai'"

**Lösning:** Kör `npm install openai` i projektmappen.

### "Error: OPENAI_API_KEY is not set"

**Lösning:** Kontrollera att:
1. Du har lagt till `OPENAI_API_KEY` i `.env.local` (local) eller Vercel Environment Variables (production)
2. API-nyckeln är korrekt (börjar med `sk-`)
3. Du har restartat dev-servern (local) eller redeployat (Vercel)

### "Error: Incorrect API key provided"

**Lösning:** API-nyckeln är felaktig eller har revokats. Skapa en ny nyckel på OpenAI Platform.

### "Error: You exceeded your current quota"

**Lösning:** Ditt OpenAI-konto har slut på credits. Lägg till betalningsmetod på [OpenAI Billing](https://platform.openai.com/account/billing).

## Testa Lokalt

1. Installera openai: `npm install openai`
2. Lägg till `OPENAI_API_KEY` i `.env.local`
3. Starta dev-server: `npm run dev`
4. Gå till `/bestallning`
5. Fyll i formuläret och beställ en spådom
6. Kortet ska visas med baksidan
7. Klicka på kortet för att se spådomen!

## Teknisk Implementation

### Filer som Ändrats/Skapats

1. **`lib/openai.ts`** - OpenAI-integration och spådomsgenerering
2. **`components/FortuneCard.tsx`** - Interaktivt spådomskort med flip-animation
3. **`app/api/bestallning/route.ts`** - Uppdaterad för att generera spådom direkt
4. **`app/bestallning/page.tsx`** - Visar FortuneCard efter beställning
5. **`lib/firestore.ts`** - Uppdaterat Reading interface med `response` och `completedAt`
6. **`lib/firestore-admin.ts`** - Ny funktion `adminUpdateReadingWithResponse()`
7. **`.env.example`** - Lagt till `OPENAI_API_KEY`

### Dataflöde

```
Användare fyller i formulär
  ↓
POST /api/bestallning
  ↓
1. Validera input
2. Skapa reading (dra 1 kredit)
3. Anropa OpenAI API (generateFortune)
4. Uppdatera reading med spådom
5. Returnera spådom till frontend
  ↓
FortuneCard visas med flip-animation
  ↓
Användare klickar på kortet
  ↓
Spådomen avslöjas!
```

## Säkerhet

- ✅ API-nyckeln finns **endast** på servern (inte i frontend)
- ✅ Alla API-anrop går via Next.js API routes
- ✅ Användaren måste vara inloggad och ha krediter
- ✅ Firestore rules skyddar mot missbruk
- ✅ Rate limiting genom Vercel's automatiska skydd

## Support

Om du stöter på problem:

1. Kontrollera att `OPENAI_API_KEY` är korrekt konfigurerad
2. Kolla Vercel logs för felmeddelanden
3. Testa OpenAI API-nyckeln direkt på [OpenAI Playground](https://platform.openai.com/playground)
