import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export default function AutomotiveLayout({ children }) {
  return (
    <>
      <Nav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
