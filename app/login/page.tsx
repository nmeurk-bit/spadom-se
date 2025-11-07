// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getFirebaseAuth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import ErrorBanner from '@/components/ErrorBanner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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

      if (isSignUp) {
        // Skapa nytt konto
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Initiera användare i Firestore (skapa user document och wallet)
        try {
          const idToken = await userCredential.user.getIdToken();
          const initResponse = await fetch('/api/auth/init-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });

          if (!initResponse.ok) {
            console.error('Failed to initialize user in Firestore');
            // Continue anyway - user is created in Firebase Auth
          }
        } catch (initError) {
          console.error('Error initializing user:', initError);
          // Continue anyway - user is created in Firebase Auth
        }
      } else {
        // Logga in
        await signInWithEmailAndPassword(auth, email, password);
      }

      router.push('/konto');
    } catch (err: any) {
      console.error('Auth error:', err);

      // Översätt Firebase-fel till svenska
      if (err.code === 'auth/email-already-in-use') {
        setError('E-postadressen används redan. Försök logga in istället.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Fel lösenord. Försök igen.');
      } else if (err.code === 'auth/user-not-found') {
        setError('Ingen användare hittades med denna e-postadress.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Ogiltig e-postadress.');
      } else if (err.code === 'auth/weak-password') {
        setError('Lösenordet är för svagt. Använd minst 6 tecken.');
      } else {
        setError('Något gick fel. Försök igen.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);

      // Initiera användare i Firestore om det är första gången
      // (detta kommer inte skapa duplicat om användaren redan finns)
      try {
        const idToken = await userCredential.user.getIdToken();
        await fetch('/api/auth/init-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });
      } catch (initError) {
        console.error('Error initializing user:', initError);
        // Continue anyway
      }

      router.push('/konto');
    } catch (err: any) {
      console.error('Google sign in error:', err);

      if (err.code === 'auth/popup-closed-by-user') {
        setError('Inloggningen avbröts.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup blockerades av webbläsaren. Tillåt popups för denna sida.');
      } else {
        setError('Kunde inte logga in med Google. Försök igen.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 border border-mystical-purple/30">
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          {isSignUp ? 'Skapa konto' : 'Logga in'}
        </h1>
        <p className="text-gray-400 text-center mb-6">
          {isSignUp ? 'Skapa ett konto för att komma igång' : 'Välkommen tillbaka!'}
        </p>

        {error && <ErrorBanner message={error} onClose={() => setError(null)} />}

        {/* Google Sign-In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all mb-6 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loading ? 'Laddar...' : 'Fortsätt med Google'}
        </button>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-400">eller</span>
          </div>
        </div>

        {/* Email + Password Form */}
        <form onSubmit={handleEmailPasswordAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              E-postadress
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-mystical-purple focus:border-transparent text-white placeholder-gray-400"
              placeholder="din@epost.se"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Lösenord
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-mystical-purple focus:border-transparent text-white placeholder-gray-400"
              placeholder={isSignUp ? 'Minst 6 tecken' : 'Ditt lösenord'}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-mystical-purple to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-mystical-purple transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? 'Laddar...' : isSignUp ? 'Skapa konto' : 'Logga in'}
          </button>
        </form>

        {/* Toggle mellan logga in / registrera */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-mystical-gold hover:text-yellow-400 text-sm transition-colors"
          >
            {isSignUp ? 'Har du redan ett konto? Logga in' : 'Inget konto? Skapa ett här'}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
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
