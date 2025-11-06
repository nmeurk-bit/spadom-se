// app/bestallning/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getFirebaseAuth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import ErrorBanner from '@/components/ErrorBanner';

type Category = 'love' | 'finance' | 'self_development' | 'spirituality' | 'future' | 'other';

const CATEGORIES = [
  { value: 'love' as const, label: '❤️ Kärlek', emoji: '❤️' },
  { value: 'finance' as const, label: '💰 Ekonomi', emoji: '💰' },
  { value: 'self_development' as const, label: '🌈 Självutveckling', emoji: '🌈' },
  { value: 'spirituality' as const, label: '🌙 Andlighet', emoji: '🌙' },
  { value: 'future' as const, label: '🕰️ Framtiden', emoji: '🕰️' },
  { value: 'other' as const, label: '✨ Övrigt', emoji: '✨' },
];

export default function BestallningPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [personName, setPersonName] = useState('');
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [birthdate, setBirthdate] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.uid);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (personName.trim().length < 2) {
      setError('Namnet måste vara minst 2 tecken långt');
      setSubmitting(false);
      return;
    }

    if (question.trim().length < 10) {
      setError('Din fråga måste vara minst 10 tecken lång');
      setSubmitting(false);
      return;
    }

    if (!userId) {
      setError('Du måste vara inloggad för att beställa en spådom.');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/bestallning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          personName: personName.trim(),
          question: question.trim(),
          category,
          birthdate: birthdate || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'insufficient_balance') {
          setError('Du har inga spådomar kvar. Gå till ditt konto för att köpa fler.');
          return;
        }
        throw new Error(data.error || 'Något gick fel');
      }

      // Framgång! Redirecta till tacksida
      router.push('/tack?typ=bestallning');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-mystical-purple"></div>
          <p className="mt-4 text-gray-400">Laddar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-glow mb-4">
            Beställ en spådom
          </h1>
          <p className="text-xl text-gray-400">
            Fyll i formuläret nedan för att få din personliga AI-genererade spådom
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorBanner message={error} onClose={() => setError(null)} />
          </div>
        )}

        {/* Formulär */}
        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border border-mystical-purple/30 rounded-2xl shadow-2xl p-8 space-y-8 mystical-glow"
        >
          {/* Steg 1: Vem spådomen gäller */}
          <div>
            <label htmlFor="personName" className="block text-sm font-semibold text-mystical-gold mb-3">
              STEG 1 - Vem gäller spådomen? <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="personName"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-mystical-purple focus:border-mystical-purple text-white placeholder-gray-500"
              placeholder="T.ex. 'Anna', 'Jag själv', 'Min partner'..."
              required
              minLength={2}
              aria-label="Vem spådomen gäller"
            />
            <p className="text-sm text-gray-400 mt-2">
              Skriv namnet på personen som spådomen handlar om – det kan vara du själv eller någon annan.
            </p>
          </div>

          {/* Steg 2: Välj kategori */}
          <div>
            <label className="block text-sm font-semibold text-mystical-gold mb-3">
              STEG 2 - Välj kategori <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                    category === cat.value
                      ? 'bg-mystical-purple border-2 border-mystical-gold text-white mystical-glow'
                      : 'bg-gray-900/50 border border-gray-700 text-gray-300 hover:border-mystical-purple'
                  }`}
                  aria-label={cat.label}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-400 mt-3">
              Välj det område du vill ha vägledning inom.
            </p>
          </div>

          {/* Steg 3: Skriv din fråga */}
          <div>
            <label htmlFor="question" className="block text-sm font-semibold text-mystical-gold mb-3">
              STEG 3 - Skriv din fråga <span className="text-red-400">*</span>
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-mystical-purple focus:border-mystical-purple text-white placeholder-gray-500"
              placeholder="T.ex. 'Vad behöver jag förstå om min relation just nu?'"
              required
              minLength={10}
              aria-label="Din fråga"
            />
            <div className="mt-3 space-y-2">
              <div className="text-xs text-gray-400">
                {question.length} / 10 tecken (minst)
              </div>

              {/* Tips */}
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                <p className="text-green-300 text-sm">
                  <span className="font-semibold">✓ Exempel: </span>
                  "Vad behöver jag förstå om min relation just nu?"
                </p>
              </div>
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-300 text-sm">
                  <span className="font-semibold">✗ Undvik: </span>
                  Bara ett ord eller enbart ja/nej-frågor
                </p>
              </div>

              <p className="text-sm text-gray-400">
                Formulera dig öppet men tydligt. Be gärna om vägledning istället för ja/nej.
              </p>
            </div>
          </div>

          {/* Födelsedatum (valfritt) */}
          <div>
            <label htmlFor="birthdate" className="block text-sm font-semibold text-gray-300 mb-3">
              Födelsedatum (valfritt)
            </label>
            <input
              type="date"
              id="birthdate"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-mystical-purple focus:border-mystical-purple text-white"
              aria-label="Födelsedatum"
            />
            <p className="text-sm text-gray-400 mt-2">
              Vissa spådomar kan bli mer personliga med födelsedatum.
            </p>
          </div>

          {/* Infobox */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-blue-200 text-sm">
                Din beställning behandlas inom 24 timmar och du får svar i ditt konto.
                För underhållning och reflektion – inte medicinsk eller juridisk rådgivning.
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting || question.length < 10 || personName.length < 2}
              className="w-full bg-gradient-to-r from-mystical-gold to-yellow-500 text-gray-900 py-4 rounded-lg text-xl font-bold hover:from-yellow-500 hover:to-mystical-gold transition-all shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
              aria-label="Skicka beställning"
            >
              {submitting ? 'Skickar...' : 'Beställ spådom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
