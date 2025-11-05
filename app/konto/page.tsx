// app/konto/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getWallet, listOrdersForUser, listReadingsForUser } from '@/lib/firestore';
import type { Order, Reading } from '@/lib/firestore';
import ErrorBanner from '@/components/ErrorBanner';

export default function KontoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [orders, setOrders] = useState<Array<Order & { id: string }>>([]);
  const [readings, setReadings] = useState<Array<Reading & { id: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

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
    setPurchaseLoading(quantity);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
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
      love: 'Kärlek',
      career: 'Karriär',
      finance: 'Ekonomi',
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-mystical-purple"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Laddar ditt konto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        Ditt konto
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

      {/* Beställ ny spådom knapp */}
      <div className="mb-8">
        {balance > 0 ? (
          <button
            onClick={() => router.push('/bestallning')}
            className="w-full sm:w-auto bg-mystical-gold text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg"
          >
            Beställ ny spådom
          </button>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <p className="text-yellow-800 dark:text-yellow-200 mb-4">
              Du har inga spådomar kvar. Köp fler för att fortsätta.
            </p>
          </div>
        )}
      </div>

      {/* Köp mer-knappar */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Köp fler spådomar
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { quantity: 1 as const, name: '1 spådom', price: '99 kr' },
            { quantity: 5 as const, name: '5 spådomar', price: '399 kr' },
            { quantity: 10 as const, name: '10 spådomar', price: '699 kr' },
          ].map((tier) => (
            <button
              key={tier.quantity}
              onClick={() => handlePurchase(tier.quantity)}
              disabled={purchaseLoading !== null}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {tier.name}
              </h3>
              <p className="text-2xl font-bold text-mystical-purple">
                {tier.price}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Senaste beställningarna */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Senaste beställningarna
        </h2>
        {readings.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            Du har inga beställningar ännu.
          </p>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fråga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {readings.map((reading) => (
                  <tr key={reading.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(reading.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {getCategoryLabel(reading.category)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {reading.question.length > 50
                        ? reading.question.substring(0, 50) + '...'
                        : reading.question}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reading.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : reading.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {getStatusLabel(reading.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Köphistorik */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Köphistorik
        </h2>
        {orders.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            Du har inga köp ännu.
          </p>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Antal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Belopp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {order.quantity} spådomar
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {(order.amount / 100).toFixed(2)} kr
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
