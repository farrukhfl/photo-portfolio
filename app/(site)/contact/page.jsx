import { SITE } from '@/lib/site';
import ContactForm from '@/components/ContactForm';

export const metadata = {
  title: `Contact — Book an Automotive Shoot in ${SITE.city}`,
  description: `Contact ${SITE.name} for automotive photography shoots, collaborations and commissions in ${SITE.city}, ${SITE.country}.`,
  alternates: { canonical: '/contact' },
};

export default function Contact() {
  return (
    <>
      <div className="page-title px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <p className="eyebrow" style={{ marginBottom: 16 }}>Contact</p>
        <h1>Let&apos;s shoot something rare.</h1>
        <p>Owner shoots, dealership work, events, editorial — tell me about the car and the idea.</p>
      </div>

      <div className="px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto pb-14">
        <ContactForm />
      </div>
    </>
  );
}
