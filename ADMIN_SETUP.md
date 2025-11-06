# Admin Dashboard Setup Guide

Detta dokument beskriver hur du konfigurerar och använder admin-dashboarden för Spådom.se.

## Översikt

Admin-dashboarden ger dig möjlighet att:
- Se översikt över kunder, köp och spådomar
- Söka och visa kunddetaljer
- Justera kundsaldon (lägg till/ta bort spådomar)
- Se audit log över alla admin-ändringar

## Snabbstart: Gör dig själv till admin

**Enklaste sättet:**

1. Gå till `/admin/setup` på din sajt (t.ex. https://spadom.se/admin/setup)
2. Logga in om du inte redan är inloggad
3. Kopiera din **User ID (UID)** från sidan
4. Följ instruktionerna på sidan för att lägga till dig i Firestore
5. Ladda om sidan för att verifiera att du är admin
6. Klicka på "Gå till Admin-panel"

## Skapa en Admin-användare (Detaljerade instruktioner)

### Metod 1: Via Firebase Console (Enklast)

1. Logga in på Firebase Console: https://console.firebase.google.com
2. Välj ditt projekt
3. Gå till Firestore Database
4. Skapa en ny collection om den inte finns: `admins`
5. Lägg till ett nytt dokument:
   - **Document ID**: `<användarens-uid>` (hämta detta från Authentication-sektionen)
   - **Fields**:
     - `isAdmin` (boolean): `true`
     - `updatedAt` (timestamp): Använd serverTimestamp

### Metod 2: Via Script

Vi har skapat ett hjälpscript för att sätta admin-status:

```bash
# Hitta användarens UID
# Gå till Firebase Console → Authentication → Users
# Kopiera UID för användaren du vill göra till admin

# Kör scriptet
node scripts/set-admin.js <user-uid> true

# För att ta bort admin-status
node scripts/set-admin.js <user-uid> false
```

### Metod 3: Manuellt via Firestore Admin SDK

Du kan också använda `setAdminStatus` funktionen i `/lib/firestore-admin.ts`:

```typescript
import { setAdminStatus } from '@/lib/firestore-admin';

// Gör användare till admin
await setAdminStatus('user-uid-här', true);

// Ta bort admin-status
await setAdminStatus('user-uid-här', false);
```

## Hitta en Användares UID

1. Gå till Firebase Console
2. Navigera till Authentication → Users
3. Hitta användaren via email
4. Kopiera UID från kolumnen "User UID"

**Alternativt**, när en användare är inloggad kan du köra detta i webbläsarens konsol:
```javascript
firebase.auth().currentUser.uid
```

## Användning av Admin-panelen

### Åtkomst

1. Logga in på sajten med ett konto som har admin-behörighet
2. Du kommer att se en **"Admin"** länk i headern (guldfärgad)
3. Klicka på länken för att komma till admin-dashboarden

### Översikt (/admin)

Visar:
- Totalt antal kunder
- Totalt antal köp
- Antal skapade spådomar
- Totalt saldo utdelat
- De senaste 10 köpen
- Snabbsök för att hitta kunder

### Kunder (/admin/kunder)

- Lista alla kunder
- Sök på e-postadress
- Visa när kunden skapades
- Klicka på "Visa detaljer" för att se mer info

### Kunddetalj (/admin/kunder/[userId])

Här kan du:
- Se kundens grunddata (email, skapad datum, user ID)
- Se aktuellt saldo
- **Justera saldo** med knappar:
  - **+1, +5, +10**: Snabbt lägga till spådomar
  - **-1**: Dra bort en spådom
  - **Anpassad justering**: Lägg till valfritt antal, dra av, eller sätt exakt saldo
- Se köphistorik (alla inköp)
- Se spådomshistorik (alla beställda läsningar)

**VIKTIGT**: Alla saldoändringar loggas automatiskt!

### Ändringslogg (/admin/logs)

Visar de senaste 50 admin-ändringarna med:
- Datum och tid
- Vem som gjorde ändringen (admin email)
- Påverkad kund
- Åtgärd (t.ex. +5, -1, set=10)
- Före-saldo
- Efter-saldo
- Anteckning (om angiven)

## Säkerhet

- Endast användare med `isAdmin: true` i Firestore-collectionen `admins` kan:
  - Se admin-panelen
  - Använda admin-API:erna
  - Läsa andra användares data
- Alla saldoändringar körs server-side
- Firestore-reglerna skyddar mot obehörig åtkomst
- Alla ändringar loggas och kan inte raderas via UI

## Databas-struktur

Admin-systemet använder följande Firestore-kollektioner:

### admins
```
admins/{userId}
  - isAdmin: boolean
  - updatedAt: timestamp
```

### admin_logs
```
admin_logs/{logId}
  - adminId: string
  - adminEmail: string
  - targetUserId: string
  - targetUserEmail: string
  - action: string ("+5", "-1", "set=10")
  - prevBalance: number
  - newBalance: number
  - note: string
  - createdAt: timestamp
```

## API Endpoints

Admin-dashboarden använder följande API-endpoints:

- `GET /api/admin/check` - Kontrollera om användare är admin
- `GET /api/admin/stats` - Hämta översiktsstatistik
- `GET /api/admin/users?search=email` - Lista/sök användare
- `GET /api/admin/users/[userId]` - Hämta användardetaljer
- `POST /api/admin/balance` - Justera användarsaldo
- `GET /api/admin/logs` - Hämta audit logs

Alla endpoints kräver Firebase ID token i Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

## Felsökning

### "Unauthorized" när jag försöker komma åt admin-panelen

1. Kontrollera att din användare finns i `admins` collectionen
2. Verifiera att `isAdmin` är satt till `true` (boolean, inte string)
3. Logga ut och logga in igen
4. Kontrollera webbläsarens konsol för felmeddelanden

### Admin-länken syns inte i headern

1. Vänta några sekunder efter inloggning (API-anropet kan ta tid)
2. Ladda om sidan
3. Kontrollera att du är inloggad
4. Verifiera admin-status i Firestore Console

### Kan inte justera saldo

1. Kontrollera att du är inloggad som admin
2. Se i webbläsarens Network-tab om API-anropet misslyckas
3. Kontrollera Firebase Console för fel

## Support

För problem eller frågor, kontrollera:
1. Firebase Console → Firestore för att verifiera data
2. Webbläsarens Console för JavaScript-fel
3. Firebase Functions logs för server-side fel
