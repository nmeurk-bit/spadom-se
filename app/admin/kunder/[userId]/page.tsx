// app/admin/kunder/[userId]/page.tsx
import AdminKundDetaljClient from './AdminKundDetaljClient';

// Force dynamic rendering - no static optimization or caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: {
    userId: string;
  };
}

export default function AdminKundDetaljPage({ params }: PageProps) {
  console.log('[SERVER] /admin/kunder/[userId] page.tsx rendering with params:', params);
  const { userId } = params;

  if (!userId) {
    console.error('[SERVER] ERROR: No userId in params!', params);
    return (
      <div style={{ padding: '20px', backgroundColor: 'red', color: 'white' }}>
        <h1>Error: No userId provided</h1>
        <pre>{JSON.stringify(params, null, 2)}</pre>
      </div>
    );
  }

  return (
    <>
      {/* Visual diagnostic banner - proves this route is rendering */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: '#8B5CF6',
        color: '#fff',
        padding: '8px',
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        ✅ ROUTE: /admin/kunder/[userId] – userId={userId}
      </div>

      <AdminKundDetaljClient userId={userId} />
    </>
  );
}
