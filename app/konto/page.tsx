// app/konto/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getFirebaseAuth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getWallet, listOrdersForUser, listReadingsForUser } from '@/lib/firestore';
import type { Order, Reading } from '@/lib/firestore';
import ErrorBanner from '@/components/ErrorBanner';
import ReadingModal from '@/components/ReadingModal';

export default function KontoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [orders, setOrders] = useState<Array<Order & { id: string }>>([]);
  const [readings, setReadings] = useState<Array<Reading & { id: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState<number | null>(null);
  const [selectedReading, setSelectedReading] = useState<(Reading & { id: string }) | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showAllReadings, setShowAllReadings] = useState(false);
  const [deletingReadingId, setDeletingReadingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.uid);

      try {
        // Hämta wallet
        const wallet = await getWallet(user.uid);
        setBalance(wallet?.balance || 0);

        // Hämta orders
        const userOrders = await listOrdersForUser(user.uid);
        setOrders(userOrders);

        // Hämta readings
        const userReadings = await listReadingsForUser(user.uid);
        setReadings(userReadings);
      } catch (err: any) {
        setError('Kunde inte ladda kontoinformation');
        console.error('Load error:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handlePurchase = async (quantity: 1 | 5 | 10) => {
    // Säkerställ att användaren är inloggad
    if (!userId) {
      setError('Du behöver logga in för att köpa spådomar');
      return;
    }

    setPurchaseLoading(quantity);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity, userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Något gick fel');
      }

      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setPurchaseLoading(null);
    }
  };

  const formatDate = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      love: '❤️ Kärlek',
      finance: '💰 Ekonomi',
      self_development: '🌈 Självutveckling',
      spirituality: '🌙 Andlighet',
      future: '🕰️ Framtiden',
      other: '✨ Övrigt',
      // Gamla kategorier för bakåtkompatibilitet
      career: 'Karriär',
      general: 'Allmänt',
    };
    return labels[category] || category;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      received: 'Mottagen',
      processing: 'Bearbetas',
      completed: 'Klar',
    };
    return labels[status] || status;
  };

  const handleDeleteReading = async (readingId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Förhindra att kortet öppnas

    if (!confirm('Är du säker på att du vill radera denna spådom?')) {
      return;
    }

    setDeletingReadingId(readingId);
    setError(null);

    try {
      const user = getFirebaseAuth().currentUser;
      if (!user) {
        setError('Du måste vara inloggad');
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch(`/api/readings/${readingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Kunde inte radera spådomen');
      }

      // Ta bort från lokala state
      setReadings(prev => prev.filter(r => r.id !== readingId));
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message);
    } finally {
      setDeletingReadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-20 sm:pt-24 pb-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-mystical-purple"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Laddar ditt konto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pt-20 sm:pt-24 pb-16">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        Mitt Konto
      </h1>

      {error && <ErrorBanner message={error} onClose={() => setError(null)} />}

      {/* Saldo */}
      <div className="bg-gradient-to-br from-mystical-purple to-purple-700 rounded-2xl shadow-xl p-8 mb-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-lg opacity-90 mb-2">Dina spådomar kvar</p>
            <p className="text-5xl font-bold">{balance}</p>
          </div>
          <svg className="w-24 h-24 opacity-20" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      </div>

      {/* Öppna en spådom knapp */}
      <div className="mb-12">
        {balance > 0 ? (
          <button
            onClick={() => router.push('/bestallning')}
            className="w-full sm:w-auto bg-mystical-gold text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg"
          >
            Öppna en spådom
          </button>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <p className="text-yellow-800 dark:text-yellow-200 mb-4">
              Du har inga spådomar kvar. Köp ett paket nedan för att fortsätta.
            </p>
          </div>
        )}
      </div>

      {/* Mina spådomar sektion */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-mystical-gold mb-2">
          Mina Spådomar
        </h2>
        <p className="text-gray-300 mb-8">
          Klicka på en tidigare spådom för att öppna och läsa den.
        </p>

        {readings.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl p-12 text-center border-2 border-mystical-purple/30 shadow-[0_0_20px_rgba(138,43,226,0.2)]">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-mystical-gold opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <p className="text-gray-300 text-lg mb-2">
              Du har inga spådomar ännu.
            </p>
            <p className="text-gray-500 text-sm">
              Köp ett paket nedan för att börja din mystiska resa.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(showAllReadings ? readings : readings.slice(0, 6)).map((reading) => (
              <div
                key={reading.id}
                onClick={() => setSelectedReading(reading)}
                className="group relative bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-xl p-6 cursor-pointer transition-all duration-300 border-2 border-mystical-purple/30 hover:border-mystical-gold/50 shadow-[0_0_15px_rgba(138,43,226,0.15)] hover:shadow-[0_0_30px_rgba(218,165,32,0.3)] hover:-translate-y-1 overflow-hidden"
              >
                {/* Mystisk bakgrundseffekt */}
                <div className="absolute inset-0 bg-gradient-to-br from-mystical-gold/5 via-transparent to-mystical-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                  {/* Radera-knapp */}
                  <button
                    onClick={(e) => handleDeleteReading(reading.id, e)}
                    disabled={deletingReadingId === reading.id}
                    className="absolute top-0 right-0 p-2 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Radera spådom"
                  >
                    {deletingReadingId === reading.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>

                  {/* Datum & Status */}
                  <div className="flex items-center justify-between mb-3 pr-8">
                    <span className="text-xs text-gray-400">
                      {formatDate(reading.createdAt)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        reading.status === 'completed'
                          ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                          : reading.status === 'processing'
                          ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                          : 'bg-gray-800 text-gray-400 border border-gray-600/30'
                      }`}
                    >
                      {getStatusLabel(reading.status)}
                    </span>
                  </div>

                  {/* Kategori */}
                  <div className="mb-3">
                    <span className="text-mystical-gold text-lg font-semibold">
                      {getCategoryLabel(reading.category)}
                    </span>
                  </div>

                  {/* Person */}
                  {reading.personName && (
                    <div className="mb-2">
                      <span className="text-sm text-gray-400">För: </span>
                      <span className="text-white font-medium">{reading.personName}</span>
                    </div>
                  )}

                  {/* Fråga */}
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {reading.question}
                    </p>
                  </div>

                  {/* Hover-indikator */}
                  <div className="mt-4 flex items-center justify-end text-xs text-mystical-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Klicka för att läsa →
                  </div>
                </div>

                {/* Glödande kant-effekt */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-mystical-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              </div>
            ))}
          </div>

          {/* Visa fler/färre-knapp */}
          {readings.length > 6 && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowAllReadings(!showAllReadings)}
                className="px-8 py-3 bg-gradient-to-r from-mystical-purple/20 to-purple-900/20 border-2 border-mystical-purple/40 text-white rounded-xl hover:border-mystical-gold/50 hover:from-mystical-gold/10 hover:to-yellow-500/10 transition-all duration-300 font-semibold shadow-[0_0_20px_rgba(138,43,226,0.2)] hover:shadow-[0_0_30px_rgba(218,165,32,0.3)]"
              >
                {showAllReadings ? (
                  <span className="flex items-center gap-2">
                    Visa färre
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Visa fler ({readings.length - 6} till)
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          )}
        </>
        )}
      </section>

      {/* Köp fler spådomar sektion */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-mystical-gold mb-2">
          Köp Fler Spådomar
        </h2>
        <p className="text-gray-300 mb-8">
          Välj ett paket och få dina spådomar direkt.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { quantity: 1 as const, name: '1 Spådom', price: '20 kr', desc: 'Perfekt för att testa', highlight: false },
            { quantity: 5 as const, name: '5 Spådomar', price: '60 kr', desc: 'Bästa värdet', highlight: true },
            { quantity: 10 as const, name: '10 Spådomar', price: '100 kr', desc: 'Mest populära', highlight: false },
          ].map((tier) => (
            <button
              key={tier.quantity}
              onClick={() => handlePurchase(tier.quantity)}
              disabled={purchaseLoading !== null}
              className={`group relative bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl p-8 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden
                ${tier.highlight
                  ? 'border-2 border-mystical-gold shadow-[0_0_30px_rgba(218,165,32,0.3)] hover:shadow-[0_0_50px_rgba(218,165,32,0.5)] scale-105'
                  : 'border-2 border-mystical-purple/30 shadow-[0_0_20px_rgba(138,43,226,0.2)] hover:shadow-[0_0_40px_rgba(138,43,226,0.4)]'
                }
                hover:-translate-y-2 disabled:hover:translate-y-0 disabled:hover:shadow-none active:scale-95 disabled:active:scale-100`}
            >
              {/* Mystisk bakgrundseffekt */}
              <div className="absolute inset-0 bg-gradient-to-br from-mystical-gold/5 via-transparent to-mystical-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Badge för utmärkta paket */}
              {tier.highlight && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-mystical-gold to-yellow-500 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  ⭐ POPULÄRT
                </div>
              )}

              <div className="relative z-10 text-center">
                {/* Rubrik */}
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-mystical-gold transition-colors duration-300">
                  {tier.name}
                </h3>

                {/* Underrubrik */}
                <p className="text-sm text-gray-400 mb-6">
                  {tier.desc}
                </p>

                {/* Pris med glöd */}
                <div className="mb-6">
                  <p className={`text-5xl font-extrabold bg-gradient-to-r ${
                    tier.highlight
                      ? 'from-mystical-gold via-yellow-400 to-mystical-gold'
                      : 'from-mystical-purple via-purple-400 to-mystical-purple'
                  } bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(218,165,32,0.5)]`}>
                    {tier.price}
                  </p>
                </div>

                {/* Loading state */}
                {purchaseLoading === tier.quantity ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-mystical-gold border-t-transparent"></div>
                    <p className="text-sm text-mystical-gold font-semibold">
                      Omdirigerar till betalning...
                    </p>
                  </div>
                ) : (
                  <div className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors duration-300">
                    Klicka för att köpa →
                  </div>
                )}
              </div>

              {/* Glödande kant-effekt på hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-mystical-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
            </button>
          ))}
        </div>
      </section>

      {/* Köphistorik */}
      <section>
        <h2 className="text-3xl font-bold text-mystical-gold mb-2">
          Köphistorik
        </h2>
        <p className="text-gray-300 mb-8">
          Här ser du alla dina tidigare köp.
        </p>
        {orders.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl p-12 text-center border-2 border-mystical-purple/30 shadow-[0_0_20px_rgba(138,43,226,0.2)]">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-mystical-gold opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-300 text-lg mb-2">
              Du har inga köp ännu.
            </p>
            <p className="text-gray-500 text-sm">
              När du köper spådomar kommer de att visas här.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="relative bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-xl p-6 border-2 border-mystical-purple/30 shadow-[0_0_15px_rgba(138,43,226,0.15)] overflow-hidden"
              >
                {/* Bakgrundseffekt */}
                <div className="absolute inset-0 bg-gradient-to-br from-mystical-gold/5 via-transparent to-mystical-purple/5 opacity-50"></div>

                <div className="relative z-10">
                  {/* Datum */}
                  <div className="mb-4">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Datum</span>
                    <p className="text-white font-semibold mt-1">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  {/* Antal */}
                  <div className="mb-4">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Antal spådomar</span>
                    <p className="text-mystical-gold text-2xl font-bold mt-1">
                      {order.quantity}
                    </p>
                  </div>

                  {/* Belopp */}
                  <div className="pt-4 border-t border-gray-700/50">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Belopp</span>
                    <p className="text-white text-xl font-semibold mt-1">
                      {(order.amount / 100).toFixed(2)} kr
                    </p>
                  </div>
                </div>

                {/* Glödande effekt */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-mystical-purple/5 to-transparent"></div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reading Modal */}
      {selectedReading && (
        <ReadingModal
          reading={selectedReading}
          onClose={() => setSelectedReading(null)}
        />
      )}
    </div>
  );
}
