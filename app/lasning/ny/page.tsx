// app/lasning/ny/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFirebaseAuth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getWallet } from '@/lib/firestore';
import TarotCard from '@/components/TarotCard';
import ErrorBanner from '@/components/ErrorBanner';
import type { Category } from '@/lib/ai';

interface ProphecyResponse {
  success: boolean;
  readingId: string;
  answer: string;
  message: string;
}

const categories: { value: Category; label: string; emoji: string; description: string }[] = [
  { value: 'love', label: 'Kärlek', emoji: '❤️', description: 'Relationer, känslor och hjärtat' },
  { value: 'economy', label: 'Ekonomi', emoji: '💰', description: 'Pengar, arbete och resurser' },
  { value: 'self_development', label: 'Självutveckling', emoji: '🌈', description: 'Personlig tillväxt och inre kraft' },
  { value: 'spirituality', label: 'Andlighet', emoji: '🌙', description: 'Andlig väg och högre medvetande' },
  { value: 'future', label: 'Framtiden', emoji: '🕰️', description: 'Möjligheter och vägval' },
  { value: 'other', label: 'Övrigt', emoji: '✨', description: 'Allt annat du undrar över' },
];

export default function NyLasningPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [targetName, setTargetName] = useState('');
  const [category, setCategory] = useState<Category>('love');
  const [question, setQuestion] = useState('');
  const [creating, setCreating] = useState(false);

  // Result state
  const [prophecy, setProphecy] = useState<ProphecyResponse | null>(null);

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.uid);

      try {
        const wallet = await getWallet(user.uid);
        setBalance(wallet?.balance || 0);
      } catch (err) {
        console.error('Error loading wallet:', err);
        setError('Kunde inte ladda ditt saldo');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validering
    if (!targetName.trim()) {
      setError('Ange vem spådomen gäller');
      return;
    }

    if (question.trim().length < 10) {
      setError('Frågan måste vara minst 10 tecken lång');
      return;
    }

    if (question.trim().length > 500) {
      setError('Frågan får vara max 500 tecken');
      return;
    }

    if (balance < 1) {
      setError('Du har inga spådomar kvar. Köp fler först.');
      return;
    }

    setCreating(true);

    try {
      const response = await fetch('/api/readings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          targetName: targetName.trim(),
          category,
          question: question.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ API Error:', data);
        const errorMsg = data.message || data.error || 'Något gick fel';
        const details = data.details ? `\n\nDetaljer: ${data.details}` : '';
        throw new Error(errorMsg + details);
      }

      // Uppdatera saldo
      setBalance(prev => prev - 1);

      // Visa resultat
      setProphecy(data);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleNewReading = () => {
    setProphecy(null);
    setTargetName('');
    setQuestion('');
    setCategory('love');
  };

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

  // Om spådom har skapats, visa tarokort
  if (prophecy) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Din spådom är klar
        </h1>

        <TarotCard
          answer={prophecy.answer}
          question={question}
          targetName={targetName}
          category={category}
        />

        {/* Action buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleNewReading}
            disabled={balance < 1}
            className="px-6 py-3 bg-mystical-purple text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skapa ny spådom ({balance} kvar)
          </button>
          <button
            onClick={() => router.push('/konto')}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all"
          >
            Till mitt konto
          </button>
        </div>
      </div>
    );
  }

  // Formulär
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 text-center">
        Skapa en ny spådom
      </h1>

      <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
        Du har <span className="font-bold text-mystical-purple">{balance}</span> spådomar kvar
      </p>

      {error && <ErrorBanner message={error} onClose={() => setError(null)} />}

      {balance < 1 ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
          <p className="text-yellow-800 dark:text-yellow-200 text-lg mb-4">
            Du har inga spådomar kvar
          </p>
          <button
            onClick={() => router.push('/konto')}
            className="px-6 py-3 bg-mystical-purple text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all"
          >
            Köp fler spådomar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Vem gäller spådomen? */}
          <div>
            <label htmlFor="targetName" className="block text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Vem gäller spådomen?
            </label>
            <input
              type="text"
              id="targetName"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder="T.ex. 'mig själv', 'Anna', 'min partner'..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-mystical-purple focus:border-transparent"
              required
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Välj område
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    category === cat.value
                      ? 'border-mystical-purple bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-mystical-purple/50'
                  }`}
                >
                  <div className="text-3xl mb-2">{cat.emoji}</div>
                  <div className="font-semibold text-gray-900 dark:text-white mb-1">
                    {cat.label}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {cat.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Fråga */}
          <div>
            <label htmlFor="question" className="block text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Din fråga
            </label>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Tips:</strong> Försök vara öppen men tydlig. Be om vägledning och insikt snarare än ja/nej-svar.
                Exempel: "Vad behöver jag veta om..." eller "Vilken väg bör jag ta när det gäller..."
              </p>
            </div>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Skriv din fråga här..."
              rows={5}
              minLength={10}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-mystical-purple focus:border-transparent resize-none"
              required
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {question.length}/500 tecken
            </p>
          </div>

          {/* Submit button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={creating || balance < 1}
              className="px-8 py-4 bg-mystical-purple text-white rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {creating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Skapar spådom...
                </span>
              ) : (
                '🔮 Skapa spådom'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
