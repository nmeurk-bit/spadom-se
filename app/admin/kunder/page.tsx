// app/admin/kunder/page.tsx
'use client';

import { Suspense } from 'react';
import AdminKunderContent from './AdminKunderContent';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AdminKunderPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-mystical-purple"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Laddar kunder...</p>
        </div>
      </div>
    }>
      <AdminKunderContent />
    </Suspense>
  );
}
