# Firestore Rules and Indexes Deployment

## Problem
The Firestore security rules and indexes in this repository need to be deployed to your Firebase project. They currently only exist in the code repository but are not active in production.

## What needs to be deployed

1. **Firestore Security Rules** (`firestore.rules`)
   - Controls who can read/write data
   - Allows users to create their own wallet with balance 0
   - Prevents unauthorized access

2. **Firestore Indexes** (`firestore.indexes.json`)
   - Enables efficient queries for orders and readings
   - Required for listing user orders and readings

## Deployment Options

### Option 1: Deploy via Firebase Console (Recommended)

#### Deploy Security Rules:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` from this repository
5. Paste it into the Rules editor
6. Click **Publish**

#### Deploy Indexes:
1. In Firebase Console, go to **Firestore Database** → **Indexes**
2. Click on **Single field** or **Composite** tab
3. Add the following composite indexes manually:

   **Index 1: orders**
   - Collection ID: `orders`
   - Fields:
     - `userId` (Ascending)
     - `createdAt` (Descending)
   - Query scope: Collection

   **Index 2: readings**
   - Collection ID: `readings`
   - Fields:
     - `userId` (Ascending)
     - `createdAt` (Descending)
   - Query scope: Collection

### Option 2: Deploy via Firebase CLI

If you have Firebase CLI installed:

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only Firestore indexes
firebase deploy --only firestore:indexes

# Or deploy both at once
firebase deploy --only firestore
```

## Verification

After deployment, verify that the rules are active:

1. Go to Firebase Console → Firestore Database → Rules
2. Check that the last published date is recent
3. Verify the rules match the content of `firestore.rules`

For indexes:
1. Go to Firebase Console → Firestore Database → Indexes
2. Verify that both composite indexes exist and show as "Enabled"

## Important Notes

- **The account page error will persist until these rules and indexes are deployed**
- Without proper rules, users cannot create their wallet
- Without proper indexes, queries for orders and readings may fail or be slow
- These deployments are separate from Vercel deployments
- Changes to `firestore.rules` or `firestore.indexes.json` require redeployment

## Troubleshooting

If you still see errors after deployment:

1. Check browser console for detailed error messages (added enhanced logging)
2. Verify in Firebase Console that rules were published successfully
3. Check that indexes show as "Enabled" (not "Building" or "Error")
4. Clear browser cache and try again
5. Check Firebase Console → Firestore Database → Logs for any permission errors
