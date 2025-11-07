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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex justify-between items-center">
          {/* Logo/Brand - visible on mobile */}
          <Link href="/" className="text-mystical-gold font-bold text-lg sm:text-xl">
            Spådom
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <Link
              href="/#priser"
              className="px-4 lg:px-6 py-2 bg-gradient-to-r from-mystical-gold/10 to-yellow-500/10 border border-mystical-gold/30 text-mystical-gold rounded-lg hover:from-mystical-gold/20 hover:to-yellow-500/20 hover:border-mystical-gold/50 transition-all backdrop-blur-sm font-semibold text-sm lg:text-base"
            >
              Köp spådom
            </Link>

            {!loading && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/konto"
                      className="px-4 lg:px-6 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm text-sm lg:text-base"
                    >
                      Mitt konto
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="px-4 lg:px-6 py-2 bg-mystical-purple/20 border border-mystical-purple/40 text-mystical-gold rounded-lg hover:bg-mystical-purple/30 hover:border-mystical-purple/60 transition-all backdrop-blur-sm font-semibold text-sm lg:text-base"
                        aria-label="Admin-panel"
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="px-4 lg:px-6 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-red-900/20 hover:border-red-500/30 hover:text-red-300 transition-all backdrop-blur-sm text-sm lg:text-base"
                      aria-label="Logga ut"
                    >
                      Logga ut
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="px-4 lg:px-6 py-2 bg-gradient-to-r from-mystical-purple to-purple-600 border border-mystical-purple/50 text-white rounded-lg hover:from-purple-600 hover:to-mystical-purple hover:border-mystical-gold/50 transition-all shadow-lg hover:shadow-mystical-purple/50 font-semibold text-sm lg:text-base"
                  >
                    Logga in
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-mystical-gold transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-white/10 pt-4">
            <Link
              href="/#priser"
              className="block px-4 py-2 bg-gradient-to-r from-mystical-gold/10 to-yellow-500/10 border border-mystical-gold/30 text-mystical-gold rounded-lg hover:from-mystical-gold/20 hover:to-yellow-500/20 hover:border-mystical-gold/50 transition-all backdrop-blur-sm font-semibold text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Köp spådom
            </Link>

            {!loading && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/konto"
                      className="block px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Mitt konto
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 bg-mystical-purple/20 border border-mystical-purple/40 text-mystical-gold rounded-lg hover:bg-mystical-purple/30 hover:border-mystical-purple/60 transition-all backdrop-blur-sm font-semibold text-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-red-900/20 hover:border-red-500/30 hover:text-red-300 transition-all backdrop-blur-sm"
                    >
                      Logga ut
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="block px-4 py-2 bg-gradient-to-r from-mystical-purple to-purple-600 border border-mystical-purple/50 text-white rounded-lg hover:from-purple-600 hover:to-mystical-purple hover:border-mystical-gold/50 transition-all shadow-lg hover:shadow-mystical-purple/50 font-semibold text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Logga in
                  </Link>
                )}
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
