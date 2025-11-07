// app/admin/kunder/[userId]/AdminKundDetaljClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getFirebaseAuth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface UserDetails {
  user: {
    id: string;
    email: string;
    createdAt: { _seconds: number };
  };
  wallet: {
    balance: number;
    updatedAt: { _seconds: number };
  } | null;
  orders: Array<{
    id: string;
    quantity: number;
    amount: number;
    createdAt: { _seconds: number };
  }>;
  readings: Array<{
    id: string;
    question: string;
    category: string;
    status: string;
    createdAt: { _seconds: number };
  }>;
}

interface AdminKundDetaljClientProps {
  userId: string;
}

export default function AdminKundDetaljClient({ userId }: AdminKundDetaljClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string>('');

  // Balance adjustment state
  const [adjusting, setAdjusting] = useState(false);
  const [adjustAction, setAdjustAction] = useState<'add' | 'subtract' | 'set'>('add');
  const [adjustAmount, setAdjustAmount] = useState<number>(1);
  const [adjustNote, setAdjustNote] = useState('');
  const [showAdjustForm, setShowAdjustForm] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // Check if user is admin
        const token = await user.getIdToken();
        setUserToken(token);

        const checkResponse = await fetch('/api/admin/check', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const checkData = await checkResponse.json();

        if (!checkData.isAdmin) {
          router.push('/konto');
          return;
        }

        setIsAdmin(true);

        // Load user details
        await loadUserDetails(token);
      } catch (err: any) {
        console.error('Admin load error:', err);
        setError('Kunde inte ladda kunddata');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, userId]);

  const loadUserDetails = async (token: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      setDetails(data);
    } catch (err: any) {
      console.error('User details load error:', err);
      setError('Kunde inte ladda användardetaljer');
    }
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjusting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          userId: userId,
          action: adjustAction,
          amount: adjustAmount,
          note: adjustNote,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to adjust balance');
      }

      // Reload user details
      await loadUserDetails(userToken);

      // Reset form
      setShowAdjustForm(false);
      setAdjustNote('');
      setAdjustAmount(1);
      setAdjustAction('add');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdjusting(false);
    }
  };

  const quickAdjust = async (action: 'add' | 'subtract', amount: number) => {
    setAdjusting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          userId: userId,
          action,
          amount,
          note: `Snabbjustering: ${action === 'add' ? '+' : '-'}${amount}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to adjust balance');
      }

      // Reload user details
      await loadUserDetails(userToken);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdjusting(false);
    }
  };

  const formatDate = (timestamp: { _seconds: number }) => {
    const date = new Date(timestamp._seconds * 1000);
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Laddar kunddetaljer...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin || !details) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-red-600 text-xl font-bold">Ingen åtkomst eller data kunde inte laddas</p>
          {error && (
            <p className="mt-4 text-gray-600 dark:text-gray-400">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/kunder"
          className="text-mystical-purple hover:text-mystical-gold transition-colors mb-4 inline-block"
        >
          ← Tillbaka till kundlista
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {details.user.email}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Kund-ID: {details.user.id}
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* User Info & Balance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* User Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Grunddata
          </h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400">E-post</dt>
              <dd className="text-base text-gray-900 dark:text-white">{details.user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400">Skapad</dt>
              <dd className="text-base text-gray-900 dark:text-white">
                {formatDate(details.user.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400">User ID</dt>
              <dd className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                {details.user.id}
              </dd>
            </div>
          </dl>
        </div>

        {/* Balance */}
        <div className="bg-gradient-to-br from-mystical-purple to-purple-700 rounded-lg shadow-md p-6 text-white">
          <h2 className="text-xl font-bold mb-4">Saldo</h2>
          <p className="text-5xl font-bold mb-4">{details.wallet?.balance || 0}</p>
          <p className="text-sm opacity-90">
            spådomar kvar
          </p>
          {details.wallet && (
            <p className="text-xs opacity-75 mt-2">
              Senast uppdaterat: {formatDate(details.wallet.updatedAt)}
            </p>
          )}
        </div>
      </div>

      {/* Balance Adjustment */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Justera saldo
        </h2>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => quickAdjust('add', 1)}
            disabled={adjusting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            +1 spådom
          </button>
          <button
            onClick={() => quickAdjust('add', 5)}
            disabled={adjusting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            +5 spådomar
          </button>
          <button
            onClick={() => quickAdjust('add', 10)}
            disabled={adjusting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            +10 spådomar
          </button>
          <button
            onClick={() => quickAdjust('subtract', 1)}
            disabled={adjusting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            -1 spådom
          </button>
          <button
            onClick={() => setShowAdjustForm(!showAdjustForm)}
            className="px-4 py-2 bg-mystical-purple text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Anpassad justering
          </button>
        </div>

        {/* Custom Adjustment Form */}
        {showAdjustForm && (
          <form onSubmit={handleAdjustBalance} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Åtgärd
                </label>
                <select
                  value={adjustAction}
                  onChange={(e) => setAdjustAction(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="add">Lägg till</option>
                  <option value="subtract">Dra av</option>
                  <option value="set">Sätt till exakt värde</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Antal
                </label>
                <input
                  type="number"
                  min="0"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={adjusting}
                  className="w-full px-4 py-2 bg-mystical-purple text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
                >
                  {adjusting ? 'Justerar...' : 'Verkställ'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Anteckning (valfritt)
              </label>
              <input
                type="text"
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
                placeholder="T.ex. 'Återbetalning av felaktigt köp'"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </form>
        )}
      </div>

      {/* Purchase History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Köphistorik ({details.orders.length})
          </h2>
        </div>
        {details.orders.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-600 dark:text-gray-400">
            Inga köp ännu
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Paket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Belopp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {details.orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {order.quantity} spådomar
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {(order.amount / 100).toFixed(0)} kr
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Readings History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Spådomshistorik ({details.readings.length})
          </h2>
        </div>
        {details.readings.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-600 dark:text-gray-400">
            Inga beställda spådomar ännu
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Fråga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {details.readings.map((reading) => (
                  <tr key={reading.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(reading.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {getCategoryLabel(reading.category)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {reading.question.length > 60
                        ? reading.question.substring(0, 60) + '...'
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
      </div>
    </div>
  );
}
