// app/admin/kunder/[userId]/page.tsx

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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '600px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{
          fontSize: '48px',
          color: '#667eea',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          ✅ SUCCESS!
        </h1>
        <h2 style={{
          fontSize: '24px',
          color: '#333',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          Admin Customer Details Page
        </h2>
        <div style={{
          background: '#f7fafc',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>
            <strong>Route:</strong> /admin/kunder/[userId]
          </p>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>
            <strong>User ID:</strong> {userId}
          </p>
          <p style={{ fontSize: '18px', color: '#666' }}>
            <strong>Status:</strong> <span style={{ color: 'green' }}>RENDERING CORRECTLY ✓</span>
          </p>
        </div>
        <p style={{ fontSize: '14px', color: '#999', textAlign: 'center' }}>
          If you see this page, the routing is working!
        </p>
      </div>
    </div>
  );
}
