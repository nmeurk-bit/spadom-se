# Webhook Setup Guide

Guide för att konfigurera Stripe webhooks och Firebase Admin för att hantera köp av spådomar.

## Problem
När användare köper spådomar via Stripe så visas de inte i kontot eftersom webhook-hanteringen saknar konfiguration.

## Lösning: 3-stegs setup

### Steg 1: Konfigurera Firebase Admin Credentials

Firebase Admin SDK behöver server-side credentials för att kunna skriva till Firestore (vilket inte är tillåtet från klient-sidan av säkerhetsskäl).

#### 1.1 Hämta Service Account Key från Firebase

1. Gå till [Firebase Console](https://console.firebase.google.com/)
2. Välj ditt projekt
3. Gå till **Project Settings** (kugghjulet) → **Service Accounts**
4. Klicka på **Generate New Private Key**
5. En JSON-fil kommer laddas ner

#### 1.2 Konvertera JSON till miljövariabel

JSON-filen innehåller känslig information. Den ska **ALDRIG** committas till git.

**För Vercel deployment:**

1. Gå till din Vercel dashboard
2. Välj projektet
3. Gå till **Settings** → **Environment Variables**
4. Lägg till ny variabel:
   - **Name:** `FIREBASE_SERVICE_ACCOUNT_KEY`
   - **Value:** Hela innehållet från JSON-filen (kopiera och klistra in allt)
   - **Environment:** Production, Preview, Development (välj alla)

**För lokal utveckling (.env.local):**

```bash
# .env.local (ska INTE committas!)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"ditt-projekt-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-...@ditt-projekt-id.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

### Steg 2: Konfigurera Stripe Webhook

Stripe behöver veta var den ska skicka webhook events när betalningar är klara.

#### 2.1 Hitta din webhook URL

Din webhook URL är: `https://din-domän.com/api/webhook`

Exempel:
- Production: `https://spadom.se/api/webhook`
- Preview: `https://din-preview-url.vercel.app/api/webhook`
- Lokal utveckling: Använd [Stripe CLI](https://stripe.com/docs/stripe-cli) för att forwarda webhooks

#### 2.2 Skapa webhook i Stripe Dashboard

1. Gå till [Stripe Dashboard](https://dashboard.stripe.com/)
2. **För test mode:**
   - Se till att du är i "Test mode" (toggle i sidebar)
   - Gå till **Developers** → **Webhooks**
   - Klicka **Add endpoint**
   - **Endpoint URL:** Din webhook URL
   - **Events to send:**
     - Välj `checkout.session.completed`
   - Klicka **Add endpoint**

3. **Kopiera webhook signing secret:**
   - Klicka på din nya webhook
   - Under "Signing secret", klicka **Reveal**
   - Kopiera värdet (börjar med `whsec_...`)

#### 2.3 Lägg till webhook secret i miljövariabler

**För Vercel:**

1. Gå till **Settings** → **Environment Variables**
2. Lägg till:
   - **Name:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_...` (värdet du kopierade)
   - **Environment:** Production, Preview, Development

**För lokal utveckling (.env.local):**

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Steg 3: Deploy och testa

#### 3.1 Deploy nya ändringarna

Om du använder Vercel kommer det automatiskt att deploya när du pushar till main branch.

Alternativt, pusha till din branch och merga:

```bash
git push origin claude/fix-prophecy-purchase-display-011CUqKiznkGn1K7C4PpF83T
```

#### 3.2 Verifiera konfiguration

Besök denna URL för att kontrollera att allt är korrekt konfigurerat:

```
https://din-domän.com/api/webhook/test
```

Du ska se:
```json
{
  "status": "ready",
  "message": "✅ All systems configured and ready",
  "checks": {
    "stripe": {
      "secretKeyConfigured": true,
      "webhookSecretConfigured": true,
      ...
    },
    "firebase": {
      "adminConfigured": true,
      "adminInitialized": true
    }
  }
}
```

Om något saknas kommer `nextSteps` att lista vad som behöver fixas.

#### 3.3 Testa ett köp

1. Gå till din sida och försök köpa en spådom
2. Använd Stripe test card: `4242 4242 4242 4242`
   - Valfritt CVC och framtida datum
3. Genomför betalningen
4. Du bör redirectas till tack-sidan
5. Gå till "Ditt konto"
6. Spådomen ska nu synas där!

#### 3.4 Felsökning med logs

Om det inte fungerar, kolla logs:

**Vercel:**
- Gå till **Deployments** → välj senaste deployment → **Functions** → `/api/webhook`
- Kolla efter felmeddelanden

**Stripe:**
- Gå till **Developers** → **Webhooks** → klicka på din webhook
- Under "Recent deliveries" kan du se alla webhook events
- Klicka på ett event för att se request/response

**Lokalt:**
- Kör `npm run dev` och se console output

### Vanliga problem och lösningar

#### Problem: "Firebase Admin not configured"

**Lösning:** FIREBASE_SERVICE_ACCOUNT_KEY är inte satt eller felformaterad.
- Kontrollera att miljövariabeln är korrekt satt
- Se till att hela JSON-objektet är inkluderat
- Efter att ha lagt till/ändrat miljövariabler i Vercel måste du re-deploya

#### Problem: Webhook får timeout eller 500-fel

**Lösning:** Kolla detaljerade logs i Vercel Functions.
- Troligen ett problem med Firebase Admin initialization
- Verifiera att service account credentials är korrekta

#### Problem: Webhooks skickas inte

**Lösning:** Kontrollera Stripe webhook konfiguration.
- Se till att webhook URL är korrekt
- Kontrollera att `checkout.session.completed` event är valt
- I Stripe Dashboard → Webhooks, kolla "Recent deliveries"

#### Problem: Stripe säger "401 Unauthorized" eller "403 Forbidden"

**Lösning:** Webhook signing secret är fel eller saknas.
- Verifiera STRIPE_WEBHOOK_SECRET i miljövariabler
- Kopiera signing secret från Stripe Dashboard igen

## Test mode vs Production mode

Du behöver konfigurera webhooks **två gånger**:

1. **Test mode** - för utveckling och testning
   - Använd test mode toggle i Stripe Dashboard
   - Skapa webhook endpoint i test mode
   - Använd test mode webhook secret
   - Testa med test cards (4242 4242 4242 4242)

2. **Production mode** - för riktiga betalningar
   - Switch till production mode i Stripe Dashboard
   - Skapa ny webhook endpoint (samma URL men i production)
   - Använd production webhook secret
   - Uppdatera STRIPE_WEBHOOK_SECRET till production värdet

**Viktigt:** Test mode och production mode har **olika** webhook secrets!

## Säkerhet

- **Committa ALDRIG** service account keys eller webhook secrets till git
- Lägg alltid till dem som miljövariabler i din deployment platform
- `.env.local` ska vara i `.gitignore`
- Håll production och test credentials separata

## Support

Om du fortfarande har problem efter att ha följt denna guide:

1. Kolla `/api/webhook/test` endpoint
2. Kolla Vercel Function logs
3. Kolla Stripe webhook delivery logs
4. Sök i [Stripe documentation](https://stripe.com/docs/webhooks)
5. Sök i [Firebase documentation](https://firebase.google.com/docs/admin/setup)
