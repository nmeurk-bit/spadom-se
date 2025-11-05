# Firebase Email Link Authentication - Felsökningsguide

Om inloggning med e-postlänk inte fungerar, följ denna checklista:

## 1. Kontrollera Firebase Console-inställningar

### A. Email Link Authentication är aktiverat
1. Gå till [Firebase Console](https://console.firebase.google.com/)
2. Välj ditt projekt
3. Gå till **Authentication** → **Sign-in method**
4. Hitta **Email/Password** i listan
5. Klicka på den och **aktivera "Email link (passwordless sign-in)"**
6. Spara

### B. Auktoriserade domäner
1. I Firebase Console, gå till **Authentication** → **Settings** → **Authorized domains**
2. Kontrollera att följande domäner finns med:
   - `localhost` (för lokal utveckling)
   - Din produktionsdomän (t.ex. `spadom-se.vercel.app` eller din custom domain)
3. Om domänen saknas, klicka **Add domain** och lägg till den

## 2. Kontrollera environment variables

### Lokal utveckling (.env.local)
Kontrollera att du har en `.env.local`-fil i projektets root med följande variabler:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ditt-projekt.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ditt-projekt-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ditt-projekt.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Produktion (Vercel)
1. Gå till Vercel Dashboard → ditt projekt → **Settings** → **Environment Variables**
2. Kontrollera att alla `NEXT_PUBLIC_FIREBASE_*` variabler finns
3. Kontrollera att `NEXT_PUBLIC_BASE_URL` är satt till din produktions-URL (t.ex. `https://spadom.se`)

## 3. Testa konfigurationen

### A. Öppna Developer Console
1. Öppna webbläsaren på `/login`
2. Öppna Developer Tools (F12)
3. Gå till **Console**-fliken

### B. Försök logga in
1. Ange en e-postadress
2. Klicka "Skicka inloggningslänk"
3. Observera konsollmeddelandena:

**Vid lyckad konfiguration ser du:**
```
Attempting to send sign-in link to: din@email.se
Return URL: http://localhost:3000/login
Sign-in link sent successfully
```

**Vid fel ser du:**
- `auth/operation-not-allowed` → Email link authentication är inte aktiverat (se steg 1A)
- `auth/unauthorized-domain` → Domänen är inte auktoriserad (se steg 1B)
- `auth/invalid-api-key` → Fel API-nyckel i environment variables (se steg 2)
- `auth/invalid-email` → Ogiltig e-postadress

## 4. Vanliga problem och lösningar

### Problem: "Domänen är inte auktoriserad"
**Lösning:**
- Lägg till domänen i Firebase Console under Authorized domains (steg 1B)
- För lokal utveckling, se till att `localhost` finns med
- För produktion med Vercel, lägg till både `*.vercel.app` och din custom domain

### Problem: "E-postinloggning är inte aktiverat"
**Lösning:**
- Aktivera Email link (passwordless sign-in) i Firebase Console (steg 1A)
- OBS: Det räcker INTE att bara aktivera Email/Password - du måste även aktivera "Email link"

### Problem: E-post skickas inte
**Lösning:**
- Kontrollera spam/skräppost-mappen
- Verifiera att Firebase Email Templates är korrekt konfigurerade
- I Firebase Console → Authentication → Templates, kontrollera "Email link sign in"-mallen
- För nya Firebase-projekt kan det ta några minuter innan e-post börjar skickas

### Problem: Mock credentials varning i konsolen
**Lösning:**
- Du har glömt skapa `.env.local` eller sätta environment variables
- Följ steg 2 för att konfigurera rätt credentials

### Problem: "Network request failed"
**Lösning:**
- Kontrollera din internetanslutning
- Verifiera att Firebase API är tillgängligt
- Kolla om en firewall eller ad-blocker blockerar Firebase

## 5. Testing i produktion (Vercel)

### Efter deployment:
1. Gå till din produktions-URL + `/login`
2. Testa med en riktig e-postadress
3. Om det inte fungerar:
   - Kontrollera Vercel logs: `vercel logs <deployment-url>`
   - Verifiera environment variables i Vercel Dashboard
   - Kontrollera att produktionsdomänen finns i Firebase Authorized domains

## 6. Fortfarande problem?

Om inget av ovanstående fungerar:

1. **Kontrollera Firebase Console Logs:**
   - Gå till Firebase Console → Analytics → DebugView
   - Aktivera debug mode och se vilka events som loggas

2. **Kontrollera nätverksfliken:**
   - Öppna Developer Tools → Network
   - Filtrera på "identitytoolkit"
   - Se vilken respons du får från Firebase API

3. **Verifiera Firebase-projektet:**
   - Är du på rätt Firebase-projekt?
   - Matchar projektets credentials med vad som finns i .env.local?

4. **Försök med en ny e-postadress:**
   - Ibland kan vissa e-postleverantörer blockera Firebase-mejl
   - Testa med en Gmail-adress först

## Exempel på fungerande konfiguration

### Firebase Console:
- ✅ Authentication → Sign-in method → Email/Password → **Enabled**
- ✅ Authentication → Sign-in method → Email/Password → **Email link (passwordless sign-in)** → **Enabled**
- ✅ Authentication → Settings → Authorized domains → `localhost`, `spadom-se.vercel.app`

### .env.local:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC_abcdefghijklmnopqrstuvwxyz12345
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=spadom-se-abc123.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=spadom-se-abc123
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=spadom-se-abc123.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Förväntad konsollutskrift vid lyckad inloggning:
```
Attempting to send sign-in link to: test@example.com
Return URL: http://localhost:3000/login
Sign-in link sent successfully
```

---

**Lycka till! 🔥**
