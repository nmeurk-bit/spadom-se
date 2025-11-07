# Firebase Google Sign-In Setup

För att Google Sign-In ska fungera måste du aktivera det i Firebase Console.

## Steg 1: Aktivera Google Sign-In i Firebase

1. Gå till [Firebase Console](https://console.firebase.google.com)
2. Välj ditt projekt
3. Gå till **Authentication** (i vänstermenyn)
4. Klicka på fliken **Sign-in method**
5. Klicka på **Google** i listan över providers
6. Aktivera switchen för **Enable**
7. Välj ett **Project support email** (din email)
8. Klicka **Save**

## Steg 2: Lägg till auktoriserade domäner

Under **Sign-in method** → **Authorized domains**, se till att följande domäner finns:

- `localhost` (för lokal utveckling)
- `spådommen.se` (din produktions-domän)
- Din Vercel preview domain (t.ex. `*.vercel.app`)

Om din domän saknas:
1. Klicka **Add domain**
2. Skriv in domänen
3. Klicka **Add**

## Steg 3: Testa inloggningen

1. Gå till din sajt
2. Klicka på **Logga in**
3. Klicka på **Fortsätt med Google**
4. Välj ditt Google-konto
5. Du ska nu vara inloggad och redirectas till `/konto`

## Vanliga problem

### "Popup blockerad av webbläsaren"
- Tillåt popups för din domän i webbläsarens inställningar

### "Unauthorized domain"
- Kontrollera att domänen finns i **Authorized domains** (se Steg 2)

### "Configuration error"
- Dubbelkolla att alla Firebase miljövariabler är korrekt satta i Vercel (se ENV-SETUP.md)

## Email + Lösenord Sign-In

Email/lösenord-autentisering är redan aktiverad i Firebase som standard, så den ska fungera direkt.

Om den inte fungerar:
1. Gå till Firebase Console → Authentication → Sign-in method
2. Kontrollera att **Email/Password** är aktiverad
3. Om inte, klicka på den och aktivera
