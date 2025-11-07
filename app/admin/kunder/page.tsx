// app/admin/kunder/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getFirebaseAuth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface User {
  id: string;
  email: string;
  createdAt: { _seconds: number };
}

function AdminKunderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [userToken, setUserToken] = useState<string>('');


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

        // Load users
        await loadUsers(token, searchParams.get('search') || '');
      } catch (err: any) {
        setError('Kunde inte ladda kunder');
        console.error('Admin load error:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, searchParams]);

  const loadUsers = async (token: string, search: string = '') => {
    try {
      const url = search
        ? `/api/admin/users?search=${encodeURIComponent(search)}`
        : '/api/admin/users';

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError('Kunde inte ladda användare');
      console.error('Users load error:', err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await loadUsers(userToken, searchTerm);
      router.push(`/admin/kunder?search=${encodeURIComponent(searchTerm)}`);
    } catch (err: any) {
      setError('Sökningen misslyckades');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = async () => {
    setSearchTerm('');
    setLoading(true);
    setError(null);

    try {
      await loadUsers(userToken, '');
      router.push('/admin/kunder');
    } catch (err: any) {
      setError('Kunde inte ladda användare');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: { _seconds: number }) => {
    const date = new Date(timestamp._seconds * 1000);
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-mystical-purple"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Laddar kunder...</p>
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
          Kunder
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Hantera och sök bland alla kunder
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
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Översikt
        </Link>
        <Link
          href="/admin/kunder"
          className="px-4 py-2 bg-mystical-purple text-white rounded-lg hover:bg-opacity-90 transition-colors"
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

      {/* Search */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Sök efter e-postadress..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-mystical-purple"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-mystical-purple text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Sök
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Rensa
            </button>
          )}
        </form>
      </div>

      {/* Users List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {searchTerm ? `Sökresultat för "${searchTerm}"` : 'Alla kunder'}
            <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
              ({users.length} {users.length === 1 ? 'kund' : 'kunder'})
            </span>
          </h2>
        </div>
        {users.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Inga kunder hittades' : 'Inga kunder ännu'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    E-post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Skapad datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Åtgärd
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/admin/kunder/${user.id}`}
                        className="text-mystical-purple hover:text-mystical-gold transition-colors font-medium"
                      >
                        Visa detaljer →
                      </Link>
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

export default function AdminKunderPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-mystical-purple"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Laddar kunder...</p>
          </div>
        </div>
      }
    >
      <AdminKunderContent />
    </Suspense>
  );
}
