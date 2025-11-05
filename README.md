# Spådom.se - AI-driven Spådomstjänst

Ett komplett e-handelssystem för försäljning av AI-genererade spådomar, byggt med Next.js 14, Firebase, Stripe och Vercel.

## 📋 Innehållsförteckning

- [Översikt](#översikt)
- [Teknisk Stack](#teknisk-stack)
- [Förutsättningar](#förutsättningar)
- [Installation](#installation)
- [Konfiguration](#konfiguration)
- [Lokal Utveckling](#lokal-utveckling)
- [Testing](#testing)
- [Deployment](#deployment)
- [Säkerhet](#säkerhet)
- [GDPR & Juridiskt](#gdpr--juridiskt)

## 🎯 Översikt

Spådom.se är en produktionsredo webbapplikation som låter användare köpa och beställa AI-genererade spådomar. Projektet inkluderar:

- **Next.js 14** frontend med App Router och TypeScript
- **Vercel** för hosting och deployment
- **Firebase** för autentisering och datalagring (Firestore)
- **Stripe Checkout** för säkra betalningar
- **API Routes** för webhook-hantering
- **Responsiv design** med Tailwind CSS
- **SEO-optimering** och tillgänglighet
- **GDPR-kompatibel** struktur

## 🛠 Teknisk Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Firebase SDK (Auth, Firestore)

### Backend & Hosting
- Vercel (hosting och serverless functions)
- Next.js API Routes (TypeScript)
- Firebase Firestore (databas)
- Firebase Authentication
- Stripe Checkout & Webhooks

### Betalningar
- Stripe Checkout för kortbetalningar
- Webhook-hantering via Next.js API Routes

## 📦 Förutsättningar

Innan du börjar, se till att du har:

- **Node.js** 18+ LTS
- **npm** eller **pnpm**
- **Vercel CLI**: `npm install -g vercel`
- **Stripe CLI** (för lokal testing): https://stripe.com/docs/stripe-cli
- Ett **Firebase-projekt** (för databas och auth)
- Ett **Stripe-konto**
- Ett **Vercel-konto** (gratis på https://vercel.com)

## 🚀 Installation

### 1. Klona projektet

```bash
git clone <repository-url>
cd spadom-se
```

### 2. Installera dependencies

```bash
npm install
```

## ⚙️ Konfiguration

### Firebase Setup

#### 1.1 Skapa Firebase-projekt

1. Gå till [Firebase Console](https://console.firebase.google.com/)
2. Klicka "Add project" (Lägg till projekt)
3. Namnge projektet (t.ex. "spadom-se")
4. **VIKTIGT:** Välj EU-region för Firestore, Functions och Storage:
   - Firestore: `europe-west1` eller `europe-west3`
   - Functions: `europe-west1`
   - Storage: `europe-west1`

#### 1.2 Aktivera tjänster

I Firebase Console, aktivera:
- **Authentication** → Sign-in method → Email/Password → **Email link (passwordless)**
- **Firestore Database** (välj EU-region)

#### 1.3 Hämta Firebase-konfiguration

1. Gå till Project Settings → General
2. Scrolla ner till "Your apps" → Lägg till webb-app
3. Kopiera Firebase-konfigurationen

#### 1.4 Deploya Firestore rules (valfritt vid lokal utveckling)

```bash
firebase login
firebase deploy --only firestore:rules,firestore:indexes
```

### Stripe Setup

#### 2.1 Skapa Stripe-konto

1. Registrera på [Stripe](https://stripe.com)
2. Gå till **Dashboard** → **Developers** → **API keys**
3. Kopiera din **Secret key** och **Publishable key**

#### 2.2 Skapa produkter och priser

I Stripe Dashboard:

1. Gå till **Products** → **Add Product**
2. Skapa tre produkter:
   - **1 spådom** - Pris: 99 SEK
   - **5 spådomar** - Pris: 399 SEK
   - **10 spådomar** - Pris: 699 SEK
3. För varje produkt, kopiera **Price ID** (börjar med `price_...`)

#### 2.3 Konfigurera webhook

1. I Stripe Dashboard: **Developers** → **Webhooks** → **Add endpoint**
2. URL: `https://ditt-projekt.vercel.app/api/webhook` (uppdateras efter deployment)
3. Lyssna på events: `checkout.session.completed`
4. Kopiera **Signing secret** (börjar med `whsec_...`)

### Miljövariabler

Skapa `.env.local` i projektets root (se `.env.example` för mall):

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=din_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ditt-projekt.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ditt-projekt-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ditt-projekt.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Stripe (Server-side)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_1=price_...  # 1 spådom
STRIPE_PRICE_ID_5=price_...  # 5 spådomar
STRIPE_PRICE_ID_10=price_... # 10 spådomar

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 💻 Lokal Utveckling

### Starta utvecklingsserver

```bash
npm run dev
```

Sajten körs nu på `http://localhost:3000`

### Testa Stripe Webhooks lokalt

I en separat terminal:

```bash
# Installera Stripe CLI om du inte har det
brew install stripe/stripe-cli/stripe  # macOS
# eller
scoop install stripe  # Windows

# Logga in
stripe login

# Forwarda webhooks till lokal API route
stripe listen --forward-to http://localhost:3000/api/webhook
```

Kopiera webhook signing secret och uppdatera `.env.local`.

## 🧪 Testing

### End-to-End Test Checklista

1. **Gästköp (1 spådom)**
   - [ ] Klicka "Köp 1 spådom" på startsidan
   - [ ] Fyll i kortuppgifter i Stripe (använd test-kort: `4242 4242 4242 4242`)
   - [ ] Verifiera redirect till `/tack?typ=betalning`
   - [ ] Kontrollera att webhook triggas (kolla Functions-loggar)
   - [ ] Verifiera att användare skapas i Firestore med korrekt e-post
   - [ ] Verifiera att wallet skapas med `balance: 1`

2. **Inloggning**
   - [ ] Gå till `/login`
   - [ ] Ange e-post (samma som användes vid köp)
   - [ ] Kolla e-post för magilänk
   - [ ] Klicka på länk och verifiera inloggning
   - [ ] Redirectas till `/konto`

3. **Beställ spådom**
   - [ ] Verifiera att saldo visas korrekt på `/konto`
   - [ ] Klicka "Beställ ny spådom"
   - [ ] Fyll i formulär med fråga (minst 10 tecken)
   - [ ] Submit formulär
   - [ ] Verifiera att saldo minskar med 1
   - [ ] Verifiera att reading skapas i Firestore med status "received"

4. **Säkerhetstest**
   - [ ] Försök direkt skriva till `wallets/{userId}` från webbkonsolen (ska nekas)
   - [ ] Försök läsa annan användares wallet (ska nekas)
   - [ ] Försök skapa reading utan tillräckligt saldo (ska nekas med error)

### Stripe Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
```

## 🚢 Deployment

### 1. Pusha till GitHub

```bash
git add .
git commit -m "Migrera till Vercel"
git push origin main
```

### 2. Deploya till Vercel

#### Via Vercel Dashboard (Rekommenderat)

1. Gå till [vercel.com](https://vercel.com)
2. Klicka "New Project"
3. Importera ditt GitHub repository
4. Konfigurera miljövariabler (se `.env.example`)
5. Klicka "Deploy"

#### Via Vercel CLI

```bash
# Installera Vercel CLI om du inte har det
npm install -g vercel

# Logga in
vercel login

# Deploya
vercel --prod
```

### 3. Konfigurera miljövariabler i Vercel

I Vercel Dashboard → ditt projekt → Settings → Environment Variables, lägg till:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID_1
STRIPE_PRICE_ID_5
STRIPE_PRICE_ID_10
NEXT_PUBLIC_BASE_URL=https://ditt-projekt.vercel.app
```

### 4. Uppdatera Stripe Webhook URL

Efter deployment, uppdatera webhook URL i Stripe Dashboard till:
```
https://ditt-projekt.vercel.app/api/webhook
```

### 5. Deploya Firestore Rules

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## 🔒 Säkerhet

### Firestore Security Rules

Projektet inkluderar strikta säkerhetsregler:

- **Wallets**: Endast läsning för ägare, INGEN skrivning från klient
- **Orders**: Endast läsning för ägare, skrivs av Cloud Functions
- **Readings**: Användare kan skapa egna, men bara via atomisk transaktion
- **Users**: Användare kan läsa/skriva sin egen profil

### API-säkerhet

- API routes verifierar Firebase Auth tokens
- Stripe webhook verifierar signatures
- Känslig data exponeras aldrig till klienten

### Best Practices

- Använd Firebase App Check för att förhindra missbruk
- Aktivera reCAPTCHA för login
- Övervaka Functions-loggar för misstänkt aktivitet
- Håll dependencies uppdaterade

## 📜 GDPR & Juridiskt

### Dataskydd

Projektet samlar in:
- E-postadresser (för autentisering och betalning)
- Betalningshistorik (via Stripe)
- Användningsfrågor (spådomstexter)

### Användarrättigheter

Implementera följande för GDPR-compliance:

1. **Rätt till tillgång**: Användare kan se sin data på `/konto`
2. **Rätt till radering**: Implementera "Radera konto"-funktion
3. **Rätt till portabilitet**: Exportera användardata till JSON
4. **Cookiesamtycke**: Aktivera CookieBanner-komponenten

### Juridiska texter

Projektet inkluderar mallar för:
- Användarvillkor (`/villkor`)
- Integritetspolicy (`/integritet`)
- Cookiepolicy (`/cookies`)
- Återbetalningspolicy (`/aterbetalning`)

**⚠️ VIKTIGT:** Dessa är endast mallar! Konsultera en jurist för att anpassa dem till din specifika verksamhet.

### Cookies

För produktionsmiljö:
1. Aktivera CookieBanner-komponenten
2. Ladda INTE analytics (Google Analytics, etc.) före samtycke
3. Dokumentera alla cookies i cookiepolicyn

## 🎨 Anpassning

### Byt hero-bild

Ersätt `/public/hero-tarot.jpg` med din egen licensierade bild:
- Storlek: Minst 1920x1080px
- Format: JPG eller WebP
- Licens: Se till att du har rätt att använda den kommersiellt

### Byt färger

I `tailwind.config.ts`:

```typescript
colors: {
  'mystical-purple': '#6B46C1',  // Din primära färg
  'mystical-gold': '#D4AF37',    // Din sekundära färg
}
```

### Lägg till AI-integration

För att faktiskt generera spådomar:
1. Lägg till en Cloud Function som triggas när `reading.status === 'received'`
2. Anropa din AI-tjänst (OpenAI, Anthropic, etc.)
3. Uppdatera reading med AI-svaret
4. Sätt `status` till `'completed'`

## 📞 Support

Vid problem eller frågor:
- Kolla Firebase Console → Functions → Logs för fel
- Verifiera Stripe webhooks i Stripe Dashboard → Developers → Webhooks
- Kontrollera Firestore rules med Firebase Emulator

## 📄 Licens

Detta projekt är skapad som en mall. Anpassa efter dina behov.

---

**VIKTIGT:**
- Byt ut hero-bilden mot egen licensierad bild
- Konsultera jurist för juridiska texter
- Aktivera Firebase App Check för produktion
- Implementera cookiesamtycke före analys
- Testa ordentligt före lansering

God lycka med ditt projekt! 🔮✨
