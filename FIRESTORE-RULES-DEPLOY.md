# Firestore Säkerhetsregler - Deploy Guide

## Problemet som är fixat

Firestore säkerhetsreglerna var inställda för gamla kategorier:
- `['love', 'career', 'finance', 'general']` ❌

Men vi använder nu nya kategorier:
- `['love', 'finance', 'self_development', 'spirituality', 'future', 'other']` ✅

Plus att `personName` saknades i valideringen.

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

### Före:
```javascript
allow create: if isSignedIn()
              && request.resource.data.userId == request.auth.uid
              && request.resource.data.keys().hasAll(['userId', 'question', 'category', 'status', 'createdAt'])
              && request.resource.data.category in ['love', 'career', 'finance', 'general']
```

### Efter:
```javascript
allow create: if isSignedIn()
              && request.resource.data.userId == request.auth.uid
              && request.resource.data.keys().hasAll(['userId', 'personName', 'question', 'category', 'status', 'createdAt'])
              && request.resource.data.personName is string
              && request.resource.data.personName.size() >= 2
              && request.resource.data.category in ['love', 'finance', 'self_development', 'spirituality', 'future', 'other']
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
