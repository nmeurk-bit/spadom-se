// app/admin/setup/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getFirebaseAuth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function AdminSetupPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        setCheckingAdmin(true);
        try {
          const token = await currentUser.getIdToken();
          const response = await fetch('/api/admin/check', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          setIsAdmin(data.isAdmin || false);
        } catch (error) {
          console.error('Admin check error:', error);
          setIsAdmin(false);
        } finally {
          setCheckingAdmin(false);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-mystical-purple"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Laddar...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Du måste vara inloggad
          </h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Logga in först för att se din användarinformation och admin-status.
          </p>
          <Link
            href="/login"
            className="inline-block bg-mystical-purple text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Logga in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        Admin Setup
      </h1>

      {/* User Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Din användarinformation
        </h2>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">E-post</dt>
            <dd className="text-base text-gray-900 dark:text-white font-mono">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">User ID (UID)</dt>
            <dd className="text-sm text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-700 p-3 rounded break-all">
              {user.uid}
            </dd>
            <button
              onClick={() => {
                navigator.clipboard.writeText(user.uid);
                alert('User ID kopierat till urklipp!');
              }}
              className="mt-2 text-sm text-mystical-purple hover:text-mystical-gold transition-colors"
            >
              📋 Kopiera User ID
            </button>
          </div>
        </dl>
      </div>

      {/* Admin Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Admin-status
        </h2>
        {checkingAdmin ? (
          <p className="text-gray-600 dark:text-gray-400">Kontrollerar...</p>
        ) : isAdmin ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-800 dark:text-green-200 font-semibold mb-2">
              ✓ Du är admin!
            </p>
            <Link
              href="/admin"
              className="inline-block bg-mystical-purple text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Gå till Admin-panel →
            </Link>
          </div>
        ) : (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200 font-semibold mb-2">
              ✗ Du är inte admin ännu
            </p>
            <p className="text-red-700 dark:text-red-300 text-sm">
              Följ instruktionerna nedan för att göra dig själv till admin.
            </p>
          </div>
        )}
      </div>

      {/* Instructions */}
      {!isAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Så här gör du dig själv till admin
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Metod 1: Via Firebase Console (Rekommenderas)
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li>
                  Gå till{' '}
                  <a
                    href="https://console.firebase.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mystical-purple hover:text-mystical-gold underline"
                  >
                    Firebase Console
                  </a>
                </li>
                <li>Välj ditt projekt (spadom-se)</li>
                <li>Gå till <strong>Firestore Database</strong></li>
                <li>
                  Skapa en ny collection som heter <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">admins</code>
                </li>
                <li>
                  Lägg till ett nytt dokument med Document ID:{' '}
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs break-all">
                    {user.uid}
                  </code>
                </li>
                <li>
                  Lägg till ett fält:
                  <ul className="list-disc list-inside ml-6 mt-2">
                    <li>Field: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">isAdmin</code></li>
                    <li>Type: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">boolean</code></li>
                    <li>Value: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">true</code></li>
                  </ul>
                </li>
                <li>Spara dokumentet</li>
                <li>Ladda om denna sida och kontrollera din admin-status</li>
              </ol>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Metod 2: Via Node.js Script
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Om du har tillgång till servern kan du köra:
              </p>
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-x-auto text-sm">
                <code>node scripts/set-admin.js {user.uid} true</code>
              </pre>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                <strong>Tips:</strong> När du har lagt till dig själv som admin i Firestore,
                ladda om denna sida för att verifiera att det fungerade. Du kan sedan gå till
                admin-panelen för att hantera användare och justera saldon.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
