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
  const { userId } = params;

  if (!userId) {
    return (
      <div style={{ padding: '20px', backgroundColor: 'red', color: 'white' }}>
        <h1>Error: No userId provided</h1>
        <pre>{JSON.stringify(params, null, 2)}</pre>
      </div>
    );
  }

  return <AdminKundDetaljClient userId={userId} />;
}
