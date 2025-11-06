// scripts/set-admin.js
// Helper script to set or remove admin status for a user
//
// Usage:
//   node scripts/set-admin.js <userId> true   # Make user admin
//   node scripts/set-admin.js <userId> false  # Remove admin status
//
// Example:
//   node scripts/set-admin.js abc123xyz true

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function setAdminStatus(userId, isAdmin) {
  try {
    await db.collection('admins').doc(userId).set({
      isAdmin: isAdmin,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log(`✓ Successfully set admin status for user ${userId} to ${isAdmin}`);

    // Get user email for confirmation
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      console.log(`  User email: ${userDoc.data().email}`);
    }
  } catch (error) {
    console.error('Error setting admin status:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.error('Usage: node scripts/set-admin.js <userId> <true|false>');
  console.error('Example: node scripts/set-admin.js abc123xyz true');
  process.exit(1);
}

const userId = args[0];
const isAdmin = args[1].toLowerCase() === 'true';

setAdminStatus(userId, isAdmin)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
