// app/admin/kunder/[userId]/page.tsx
import AdminKundDetaljClient from './AdminKundDetaljClient';

interface PageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function AdminKundDetaljPage({ params }: PageProps) {
  const { userId } = await params;

  return <AdminKundDetaljClient userId={userId} />;
}
