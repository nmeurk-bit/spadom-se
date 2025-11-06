// app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFirebaseAuth } from '@/lib/firebase';
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { ensureUserByEmail } from '@/lib/firestore';
import ErrorBanner from '@/components/ErrorBanner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Kontrollera om detta är en återkommande från magilänk
    if (isSignInWithEmailLink(getFirebaseAuth(), window.location.href)) {
      handleSignInWithLink();
    }
  }, []);

  const handleSignInWithLink = async () => {
    let emailForSignIn = localStorage.getItem('emailForSignIn');

    if (!emailForSignIn) {
      emailForSignIn = window.prompt('Vänligen ange din e-postadress för bekräftelse');
    }

    if (!emailForSignIn) {
      setError('E-postadress krävs för att slutföra inloggningen');
      return;
    }

    try {
      await signInWithEmailLink(getFirebaseAuth(), emailForSignIn, window.location.href);

      // Säkerställ att användaren finns i Firestore (skapar om inte finns)
      console.log('[Login] Creating/ensuring user in Firestore:', emailForSignIn);
      await ensureUserByEmail(emailForSignIn);

      localStorage.removeItem('emailForSignIn');
      router.push('/konto');
    } catch (err: any) {
      setError('Kunde inte logga in. Länken kan ha gått ut. Försök igen.');
      console.error('Sign in error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Vänligen ange en giltig e-postadress');
      setLoading(false);
      return;
    }

    try {
      const actionCodeSettings = {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/login`,
        handleCodeInApp: true,
      };

      console.log('[Login] Sending sign-in link to:', email);
      console.log('[Login] Action code settings:', actionCodeSettings);

      await sendSignInLinkToEmail(getFirebaseAuth(), email, actionCodeSettings);
      localStorage.setItem('emailForSignIn', email);
      setSent(true);
      console.log('[Login] Sign-in link sent successfully');
    } catch (err: any) {
      console.error('[Login] Send link error:', err);
      console.error('[Login] Error code:', err.code);
      console.error('[Login] Error message:', err.message);

      let errorMessage = 'Kunde inte skicka inloggningslänk.';

      if (err.code === 'auth/quota-exceeded') {
        errorMessage = 'Firebase har nått sin dagliga gräns för inloggningslänkar. Försök igen om några timmar eller kontakta support@spadom.se.';
      } else if (err.code === 'auth/unauthorized-continue-uri') {
        errorMessage = 'Domänen är inte godkänd i Firebase. Kontakta administratören.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Ogiltig e-postadress.';
      } else if (err.code === 'auth/missing-continue-uri') {
        errorMessage = 'Konfigurationsfel. Kontakta administratören.';
      } else if (err.message) {
        errorMessage = `Fel: ${err.message}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
          <svg
            className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Kolla din mejl!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Vi har skickat en inloggningslänk till <strong>{email}</strong>.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Klicka på länken i mejlet för att logga in. Länken är giltig i 60 minuter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Logga in
        </h1>

        {error && <ErrorBanner message={error} onClose={() => setError(null)} />}

        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          Ange din e-postadress så skickar vi en inloggningslänk till dig.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              E-postadress
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-mystical-purple focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="din@epost.se"
              required
              aria-label="E-postadress"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-mystical-purple text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Skicka inloggningslänk"
          >
            {loading ? 'Skickar...' : 'Skicka inloggningslänk'}
          </button>
        </form>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
          Genom att logga in accepterar du våra{' '}
          <a href="/villkor" className="underline hover:text-mystical-purple">
            användarvillkor
          </a>
          {' '}och{' '}
          <a href="/integritet" className="underline hover:text-mystical-purple">
            integritetspolicy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
