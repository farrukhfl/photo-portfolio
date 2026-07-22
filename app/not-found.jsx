import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Nav />
      <main>
        <div className="empty px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto">
          <h1>404</h1>
          <p>
            This page doesn&apos;t exist.{' '}
            <Link href="/portfolio" style={{ textDecoration: 'underline' }}>Back to portfolio</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
