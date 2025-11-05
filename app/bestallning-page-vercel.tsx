// app/bestallning/page.tsx (Uppdaterad för Vercel)
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import ErrorBanner from '@/components/ErrorBanner';

export default function BestallningPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState<'love' | 'career' | 'finance' | 'general'>('general');
  const [birthdate, setBirthdate] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
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
          userId, // Skicka userId från frontend
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
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-mystical-purple"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Laddar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Beställ en spådom
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Fyll i formuläret nedan för att beställa din AI-genererade spådom.
      </p>

      {error && <ErrorBanner message={error} onClose={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-6">
        {/* Fråga */}
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Din fråga <span className="text-red-500">*</span>
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-mystical-purple focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Skriv din fråga så tydligt du kan..."
            required
            minLength={10}
            aria-label="Din fråga"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Skriv din fråga så tydligt du kan. Den bearbetas av vår AI och levereras som text. Minst 10 tecken.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {question.length} / 10 tecken
          </p>
        </div>

        {/* Kategori */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Kategori <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-mystical-purple focus:border-transparent dark:bg-gray-700 dark:text-white"
            required
            aria-label="Kategori"
          >
            <option value="general">Allmänt</option>
            <option value="love">Kärlek</option>
            <option value="career">Karriär</option>
            <option value="finance">Ekonomi</option>
          </select>
        </div>

        {/* Födelsedatum (valfritt) */}
        <div>
          <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Födelsedatum (valfritt)
          </label>
          <input
            type="date"
            id="birthdate"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-mystical-purple focus:border-transparent dark:bg-gray-700 dark:text-white"
            aria-label="Födelsedatum"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Vissa spådomar kan bli mer personliga med ditt födelsedatum.
          </p>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting || question.length < 10}
            className="w-full bg-mystical-purple text-white py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Skicka beställning"
          >
            {submitting ? 'Skickar...' : 'Beställ spådom'}
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Din beställning behandlas inom 24 timmar och du får svar i ditt konto.
        </p>
      </form>
    </div>
  );
}
