// components/Header.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getFirebaseAuth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Check if user is admin
        try {
          const token = await currentUser.getIdToken();
          const response = await fetch('/api/admin/check', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          setIsAdmin(data.isAdmin || false);
        } catch (error) {
          console.error('Admin check error:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(getFirebaseAuth());
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-transparent backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-end items-center gap-4">
          {/* Köp-knapp */}
          <Link
            href="/#priser"
            className="px-6 py-2 bg-gradient-to-r from-mystical-gold/10 to-yellow-500/10 border border-mystical-gold/30 text-mystical-gold rounded-lg hover:from-mystical-gold/20 hover:to-yellow-500/20 hover:border-mystical-gold/50 transition-all backdrop-blur-sm font-semibold"
          >
            Köp spådom
          </Link>

          {!loading && (
            <>
              {user ? (
                <>
                  <Link
                    href="/konto"
                    className="px-6 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm"
                  >
                    Mitt konto
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="px-6 py-2 bg-mystical-purple/20 border border-mystical-purple/40 text-mystical-gold rounded-lg hover:bg-mystical-purple/30 hover:border-mystical-purple/60 transition-all backdrop-blur-sm font-semibold"
                      aria-label="Admin-panel"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-red-900/20 hover:border-red-500/30 hover:text-red-300 transition-all backdrop-blur-sm"
                    aria-label="Logga ut"
                  >
                    Logga ut
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-6 py-2 bg-gradient-to-r from-mystical-purple to-purple-600 border border-mystical-purple/50 text-white rounded-lg hover:from-purple-600 hover:to-mystical-purple hover:border-mystical-gold/50 transition-all shadow-lg hover:shadow-mystical-purple/50 font-semibold"
                >
                  Logga in
                </Link>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
