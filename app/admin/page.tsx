// app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getFirebaseAuth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalReadings: number;
  totalBalance: number;
  recentOrders: Array<{
    id: string;
    userId: string;
    userEmail: string;
    quantity: number;
    amount: number;
    createdAt: { _seconds: number };
  }>;
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // Check if user is admin
        const token = await user.getIdToken();
        const checkResponse = await fetch('/api/admin/check', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const checkData = await checkResponse.json();

        if (!checkData.isAdmin) {
          router.push('/konto');
          return;
        }

        setIsAdmin(true);

        // Fetch stats
        const statsResponse = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!statsResponse.ok) {
          throw new Error('Failed to fetch stats');
        }

        const statsData = await statsResponse.json();
        setStats(statsData);
      } catch (err: any) {
        setError('Kunde inte ladda admin-data');
        console.error('Admin load error:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchEmail.trim()) {
      router.push(`/admin/kunder?search=${encodeURIComponent(searchEmail.trim())}`);
    }
  };

  const formatDate = (timestamp: { _seconds: number }) => {
    const date = new Date(timestamp._seconds * 1000);
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amountInCents: number) => {
    return (amountInCents / 100).toFixed(0) + ' kr';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-mystical-purple"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Laddar admin-panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Admin-panel
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Översikt och hantering av Spådom.se
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="mb-8 flex gap-4">
        <Link
          href="/admin"
          className="px-4 py-2 bg-mystical-purple text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Översikt
        </Link>
        <Link
          href="/admin/kunder"
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Kunder
        </Link>
        <Link
          href="/admin/logs"
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Ändringslogg
        </Link>
      </div>

      {/* Quick Search */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Snabbsök kund
        </h2>
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Ange e-postadress..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-mystical-purple"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-mystical-purple text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Sök
          </button>
        </form>
      </div>

      {/* Stats Grid */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
              <p className="text-sm opacity-90 mb-1">Totalt antal kunder</p>
              <p className="text-4xl font-bold">{stats.totalUsers}</p>
            </div>

            {/* Total Orders */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
              <p className="text-sm opacity-90 mb-1">Totalt antal köp</p>
              <p className="text-4xl font-bold">{stats.totalOrders}</p>
            </div>

            {/* Total Readings */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
              <p className="text-sm opacity-90 mb-1">Skapade spådomar</p>
              <p className="text-4xl font-bold">{stats.totalReadings}</p>
            </div>

            {/* Total Balance */}
            <div className="bg-gradient-to-br from-mystical-purple to-purple-700 rounded-lg shadow-md p-6 text-white">
              <p className="text-sm opacity-90 mb-1">Saldo utdelat (totalt)</p>
              <p className="text-4xl font-bold">{stats.totalBalance}</p>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Senaste 10 köpen
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Datum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Kund
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Paket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Belopp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Åtgärd
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {order.userEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {order.quantity} spådomar
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatAmount(order.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {order.userEmail !== 'Unknown' ? (
                          <Link
                            href={`/admin/kunder/${order.userId}`}
                            className="text-mystical-purple hover:text-mystical-gold transition-colors"
                          >
                            Visa kund
                          </Link>
                        ) : (
                          <span className="text-gray-400">
                            Användare saknas
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
