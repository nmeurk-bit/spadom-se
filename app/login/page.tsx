// app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFirebaseAuth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { ensureUserByEmail } from '@/lib/firestore';
import ErrorBanner from '@/components/ErrorBanner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    // Kontrollera om användaren redan är inloggad
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
      if (user) {
        router.push('/konto');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Vänligen ange en giltig e-postadress');
      setLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      setError('Lösenordet måste vara minst 6 tecken');
      setLoading(false);
      return;
    }

    try {
      const auth = getFirebaseAuth();

      if (isSignUp) {
        // Skapa nytt konto
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Säkerställ att användaren och wallet skapas i Firestore
        await ensureUserByEmail(email);

        router.push('/konto');
      } else {
        // Logga in
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/konto');
      }
    } catch (err: any) {
      console.error('Auth error:', err);

      // Hantera olika feltyper
      if (err.code === 'auth/user-not-found') {
        setError('Inget konto hittades med denna e-postadress. Skapa ett nytt konto istället.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Felaktigt lösenord. Försök igen.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Det finns redan ett konto med denna e-postadress. Logga in istället.');
      } else if (err.code === 'auth/weak-password') {
        setError('Lösenordet är för svagt. Använd minst 6 tecken.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Ogiltig e-postadress.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('För många inloggningsförsök. Vänta en stund och försök igen.');
      } else {
        setError('Kunde inte ' + (isSignUp ? 'skapa konto' : 'logga in') + '. Försök igen.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
          {isSignUp ? 'Skapa konto' : 'Logga in'}
        </h1>

        {error && <ErrorBanner message={error} onClose={() => setError(null)} />}

        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          {isSignUp
            ? 'Skapa ett nytt konto för att komma igång'
            : 'Logga in för att se dina spådomar'}
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-mystical-purple text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isSignUp ? 'Skapa konto' : 'Logga in'}
          >
            {loading ? (isSignUp ? 'Skapar konto...' : 'Loggar in...') : (isSignUp ? 'Skapa konto' : 'Logga in')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-mystical-purple hover:text-mystical-gold transition-colors text-sm"
          >
            {isSignUp
              ? 'Har du redan ett konto? Logga in här'
              : 'Inget konto? Skapa ett här'}
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
          Genom att {isSignUp ? 'skapa ett konto' : 'logga in'} accepterar du våra{' '}
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
