// components/Header.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getFirebaseAuth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (currentUser) => {
      setUser(currentUser);
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
    <header className="bg-white dark:bg-gray-900 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link 
            href="/" 
            className="text-2xl font-bold text-mystical-purple hover:text-mystical-gold transition-colors"
            aria-label="Spådom.se startsida"
          >
            Spådom.se
          </Link>

          <div className="flex items-center gap-6">
            <Link 
              href="/#priser" 
              className="text-gray-700 dark:text-gray-300 hover:text-mystical-purple transition-colors"
            >
              Köp
            </Link>

            {!loading && (
              <>
                {user ? (
                  <>
                    <Link 
                      href="/konto" 
                      className="text-gray-700 dark:text-gray-300 hover:text-mystical-purple transition-colors"
                    >
                      Konto
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-gray-700 dark:text-gray-300 hover:text-mystical-purple transition-colors"
                      aria-label="Logga ut"
                    >
                      Logga ut
                    </button>
                  </>
                ) : (
                  <Link 
                    href="/login" 
                    className="bg-mystical-purple text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    Logga in
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
