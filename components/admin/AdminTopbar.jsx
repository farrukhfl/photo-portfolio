'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/clientApi';

export default function AdminTopbar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await api.post('/auth/logout').catch(() => {});
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="admin-topbar">
      <div className="admin-topbar-inner">
        <nav>
          <Link href="/admin" className={pathname === '/admin' ? 'active' : ''}>Posts</Link>
          <Link href="/admin/posts/new" className={pathname === '/admin/posts/new' ? 'active' : ''}>New Post</Link>
          <Link href="/" target="_blank">View Site ↗</Link>
        </nav>
        <button className="btn ghost small" onClick={logout}>Log out</button>
      </div>
    </div>
  );
}
