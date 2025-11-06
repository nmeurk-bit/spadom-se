// app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFirebaseAuth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { ensureUserByEmail } from '@/lib/firestore';
import ErrorBanner from '@/components/ErrorBanner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  useEffect(() => {
    // Sätt persistence till LOCAL så användare förblir inloggade
    setPersistence(getFirebaseAuth(), browserLocalPersistence).catch((err) => {
      console.error('Failed to set persistence:', err);
    });

    // Kolla om användaren redan är inloggad
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
      if (user) {
        console.log('[Login] User already logged in, redirecting to /konto');
        router.push('/konto');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validering
    if (!email || !email.includes('@')) {
      setError('Vänligen ange en giltig e-postadress');
      setLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      setError('Lösenordet måste vara minst 6 tecken långt');
      setLoading(false);
      return;
    }

    try {
      const auth = getFirebaseAuth();

      if (isRegistering) {
        // Registrera ny användare
        console.log('[Login] Creating new user account:', email);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Skapa användare i Firestore
        console.log('[Login] Creating user in Firestore:', email);
        await ensureUserByEmail(email);

        console.log('[Login] Registration successful, redirecting to /konto');
        router.push('/konto');
      } else {
        // Logga in befintlig användare
        console.log('[Login] Signing in user:', email);
        await signInWithEmailAndPassword(auth, email, password);

        // Säkerställ att användaren finns i Firestore (för gamla användare)
        await ensureUserByEmail(email);

        console.log('[Login] Login successful, redirecting to /konto');
        router.push('/konto');
      }
    } catch (err: any) {
      console.error('[Login] Auth error:', err);
      console.error('[Login] Error code:', err.code);
      console.error('[Login] Error message:', err.message);

      let errorMessage = isRegistering ? 'Kunde inte skapa konto.' : 'Kunde inte logga in.';

      // Hantera specifika Firebase-fel
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'E-postadressen används redan. Försök logga in istället.';
        setIsRegistering(false); // Byt till login-läge
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'Inget konto hittades med den e-postadressen. Skapa ett konto först.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Felaktigt lösenord. Försök igen.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Ogiltig e-postadress.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Lösenordet är för svagt. Använd minst 6 tecken.';
      } else if (err.code === 'auth/invalid-credential') {
        errorMessage = 'Felaktig e-postadress eller lösenord.';
      } else if (err.message) {
        errorMessage = `Fel: ${err.message}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validering
    if (!email || !email.includes('@')) {
      setError('Vänligen ange en giltig e-postadress');
      setLoading(false);
      return;
    }

    try {
      const auth = getFirebaseAuth();
      await sendPasswordResetEmail(auth, email);
      console.log('[PasswordReset] Password reset email sent to:', email);
      setResetEmailSent(true);
    } catch (err: any) {
      console.error('[PasswordReset] Error:', err);
      let errorMessage = 'Kunde inte skicka återställningslänk.';

      if (err.code === 'auth/user-not-found') {
        errorMessage = 'Inget konto hittades med den e-postadressen.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Ogiltig e-postadress.';
      } else if (err.message) {
        errorMessage = `Fel: ${err.message}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
          {showPasswordReset ? 'Återställ lösenord' : (isRegistering ? 'Skapa konto' : 'Logga in')}
        </h1>

        {error && <ErrorBanner message={error} onClose={() => setError(null)} />}

        {resetEmailSent && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-800 dark:text-green-200 text-sm">
              ✓ Ett e-postmeddelande med återställningslänk har skickats till {email}.
              Kontrollera din inkorg och följ instruktionerna för att sätta ett nytt lösenord.
            </p>
          </div>
        )}

        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          {showPasswordReset
            ? 'Ange din e-postadress så skickar vi en länk för att återställa ditt lösenord'
            : (isRegistering
              ? 'Skapa ett nytt konto för att komma igång'
              : 'Logga in på ditt konto'
            )
          }
        </p>

        {showPasswordReset ? (
          <form onSubmit={handlePasswordReset} className="space-y-4">
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
            >
              {loading ? 'Skickar...' : 'Skicka återställningslänk'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowPasswordReset(false);
                setResetEmailSent(false);
                setError(null);
              }}
              className="w-full text-sm text-mystical-purple hover:text-mystical-gold transition-colors"
            >
              ← Tillbaka till inloggning
            </button>
          </form>
        ) : (
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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Lösenord
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-mystical-purple focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Minst 6 tecken"
              required
              minLength={6}
              aria-label="Lösenord"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Minst 6 tecken
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-mystical-purple text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? (isRegistering ? 'Skapar konto...' : 'Loggar in...')
              : (isRegistering ? 'Skapa konto' : 'Logga in')
            }
          </button>

          {/* Glömt lösenord länk - endast för login */}
          {!isRegistering && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordReset(true);
                  setError(null);
                }}
                className="text-sm text-mystical-purple hover:text-mystical-gold transition-colors"
              >
                Glömt lösenord?
              </button>
            </div>
          )}
        </form>
        )}

        {/* Toggle mellan login och registrering */}
        {!showPasswordReset && (
          <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
            }}
            className="text-sm text-mystical-purple hover:text-mystical-gold transition-colors"
          >
            {isRegistering
              ? 'Har du redan ett konto? Logga in'
              : 'Har du inget konto? Skapa ett här'
            }
          </button>
        </div>
        )}

        {!showPasswordReset && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
            Genom att {isRegistering ? 'skapa ett konto' : 'logga in'} accepterar du våra{' '}
            <a href="/villkor" className="underline hover:text-mystical-purple">
              användarvillkor
            </a>
            {' '}och{' '}
            <a href="/integritet" className="underline hover:text-mystical-purple">
              integritetspolicy
            </a>
            .
          </p>
        )}
      </div>
    </div>
  );
}
