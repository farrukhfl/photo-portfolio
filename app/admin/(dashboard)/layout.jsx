import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AdminTopbar from '@/components/admin/AdminTopbar';

export const metadata = {
  title: 'Admin — Dashboard',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }) {
  // Middleware already guards this segment; this is defense in depth.
  const session = await getSession();
  if (!session) redirect('/admin/login');

  return (
    <>
      <AdminTopbar />
      <main className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
        {children}
      </main>
    </>
  );
}
