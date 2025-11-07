# Miljövariabler för Spådom.se

Dessa miljövariabler måste konfigureras i Vercel för att sidan ska fungera korrekt.

## Kritiska variabler (måste sättas)

### Stripe (betalningar)
```
STRIPE_SECRET_KEY=sk_live_...  (eller sk_test_... för testläge)
STRIPE_PRICE_ID_1=price_...    (Stripe Price ID för 1 spådom, 20 kr)
STRIPE_PRICE_ID_5=price_...    (Stripe Price ID för 5 spådomar, 60 kr)
STRIPE_PRICE_ID_10=price_...   (Stripe Price ID för 10 spådomar, 100 kr)
```

### Firebase (autentisering & databas)
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### Base URL (för redirects)
```
NEXT_PUBLIC_BASE_URL=https://spådommen.se  (din produktions-URL)
```

## Hur man sätter miljövariabler i Vercel

1. Gå till Vercel Dashboard
2. Välj ditt projekt (spadom-se)
3. Gå till **Settings** → **Environment Variables**
4. Klicka **Add New**
5. Ange variabelnamn och värde
6. Välj environment: **Production**, **Preview**, eller **Development**
7. Klicka **Save**

## För att skapa Stripe Prices:

1. Gå till [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigera till **Products** → **Add Product**
3. Skapa tre produkter:
   - **1 Spådom** - 20 SEK
   - **5 Spådomar** - 60 SEK
   - **10 Spådomar** - 100 SEK
4. Kopiera Price ID:n (börjar med `price_...`)
5. Klistra in dem i Vercel environment variables

## Troubleshooting

### "Något gick fel vid skapande av betalningssession"
- Kontrollera att ALLA Stripe-variabler är korrekt satta
- Kontrollera att `NEXT_PUBLIC_BASE_URL` är satt
- Kolla Vercel Function Logs för mer specifika fel

### Checkout-knappen fungerar inte
- Kontrollera att användaren är inloggad (alla paket kräver nu inloggning)
- Öppna browser console och leta efter felmeddelanden
- Kolla Vercel Function Logs

## Vercel Function Logs

För att se exakta felmeddelanden:
1. Gå till Vercel Dashboard
2. Välj ditt projekt
3. Klicka på **Deployments**
4. Välj senaste deployment
5. Klicka på **Functions** → **View Logs**
