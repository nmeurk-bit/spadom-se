// app/admin/kunder/[userId]/page.tsx
import AdminKundDetaljClient from './AdminKundDetaljClient';

interface PageProps {
  params: {
    userId: string;
  };
}

export default function AdminKundDetaljPage({ params }: PageProps) {
  console.log('[SERVER] AdminKundDetaljPage rendering with params:', params);
  const { userId } = params;

  if (!userId) {
    console.error('[SERVER] No userId in params!');
    return <div>Error: No userId provided</div>;
  }

  return <AdminKundDetaljClient userId={userId} />;
}
