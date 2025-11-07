# Firestore Säkerhetsregler - Deploy Guide

## Problem som är fixade

### 1. Gamla kategorier
Firestore säkerhetsreglerna var inställda för gamla kategorier:
- `['love', 'career', 'finance', 'general']` ❌

Men vi använder nu nya kategorier:
- `['love', 'finance', 'self_development', 'spirituality', 'future', 'other']` ✅

### 2. Saknad personName validering
`personName` saknades i valideringen.

### 3. Wallet update blockerad
Wallet-regeln blockerade `updatedAt`-uppdateringar och fungerade inte korrekt med `increment()` i atomiska transaktioner.

### 4. Optional birthdate field
Reading-regeln tillät inte den optional `birthdate`-fältet som kan skickas med.

## Hur man deployar nya regler till Firebase

### Alternativ 1: Via Firebase Console (Enklast)

1. Gå till [Firebase Console](https://console.firebase.google.com)
2. Välj ditt projekt
3. Gå till **Firestore Database** i vänstermenyn
4. Klicka på fliken **Rules** högst upp
5. Kopiera innehållet från `firestore.rules` i detta repo
6. Klistra in i editorn
7. Klicka **Publish** (röd knapp)

### Alternativ 2: Via Firebase CLI

Om du har Firebase CLI installerat:

```bash
# Installera Firebase CLI (om du inte har det)
npm install -g firebase-tools

# Logga in
firebase login

# Initiera projektet (första gången)
firebase init firestore

# Deploya reglerna
firebase deploy --only firestore:rules
```

## Vad som ändrades i reglerna

### Wallet update regel - Före:
```javascript
allow update: if isOwner(userId)
              && request.resource.data.balance < resource.data.balance  // Fungerar ej med increment()
              && request.resource.data.balance >= 0;
```

### Wallet update regel - Efter:
```javascript
allow update: if isOwner(userId)
              && request.resource.data.keys().hasAll(['balance', 'updatedAt'])  // Tillåt updatedAt
              && request.resource.data.updatedAt is timestamp
              && request.resource.data.balance >= 0;  // Kan inte bli negativt
```

### Reading create regel - Före:
```javascript
allow create: if isSignedIn()
              && request.resource.data.userId == request.auth.uid
              && request.resource.data.keys().hasAll(['userId', 'question', 'category', 'status', 'createdAt'])
              && request.resource.data.category in ['love', 'career', 'finance', 'general']  // Gamla kategorier
```

### Reading create regel - Efter:
```javascript
allow create: if isSignedIn()
              && request.resource.data.userId == request.auth.uid
              && request.resource.data.keys().hasAll(['userId', 'personName', 'question', 'category', 'status', 'createdAt'])
              && request.resource.data.size() >= 6  // Minst 6 fält (required)
              && request.resource.data.size() <= 7  // Max 7 fält (inkl. optional birthdate)
              && request.resource.data.personName is string
              && request.resource.data.personName.size() >= 2
              && request.resource.data.question is string
              && request.resource.data.question.size() >= 10
              && request.resource.data.category in ['love', 'finance', 'self_development', 'spirituality', 'future', 'other']
              && request.resource.data.status == 'received'
              && request.resource.data.createdAt is timestamp
              && (!('birthdate' in request.resource.data) || request.resource.data.birthdate is string);  // Optional birthdate
```

## Efter deploy

När du har deployat de nya reglerna kommer:
- ✅ Beställningar att fungera
- ✅ Alla nya kategorier accepteras
- ✅ `personName` valideras korrekt
- ✅ Ingen "Permission Denied" fel

## Testa att det fungerar

1. Gå till `/bestallning`
2. Fyll i formuläret
3. Välj en kategori (t.ex. "❤️ Kärlek")
4. Klicka "Beställ spådom"
5. ✅ Ska fungera utan fel!
