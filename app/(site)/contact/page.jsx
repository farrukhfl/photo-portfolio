import { SITE } from '@/lib/site';
import ContactForm from '@/components/ContactForm';
import JsonLd from '@/components/JsonLd';

export const metadata = {
  title: `Contact — Book an Automotive Shoot in ${SITE.city}`,
  description: `Contact ${SITE.name} for automotive photography shoots, collaborations and commissions in ${SITE.city}, ${SITE.country}.`,
  alternates: { canonical: '/contact' },
  openGraph: {
    title: `Contact ${SITE.name} — Automotive Photography in ${SITE.city}`,
    description: `Contact ${SITE.name} for automotive photography shoots, collaborations and commissions in ${SITE.city}, ${SITE.country}.`,
    url: `${SITE.url}/contact`,
    type: 'website',
  },
};

const contactPageLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${SITE.url}/contact`,
  url: `${SITE.url}/contact`,
  name: `Contact — Book an Automotive Shoot in ${SITE.city}`,
  description: `Contact ${SITE.name} for automotive photography shoots, collaborations and commissions in ${SITE.city}, ${SITE.country}.`,
  isPartOf: { '@id': `${SITE.url}/#website` },
};

export default function Contact() {
  return (
    <>
      <JsonLd data={contactPageLd} />
      <div className="page-title px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <p className="eyebrow" style={{ marginBottom: 16 }}>Contact</p>
        <h1>Let&apos;s shoot something rare.</h1>
        <p>Owner shoots, dealership work, events, editorial — tell me about the car and the idea.</p>
      </div>

      <div className="section px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="prose" style={{ maxWidth: '72ch', marginBottom: 48 }}>
          <p>
            Interested in automotive photography, a car feature, or a creative collaboration?
            Get in touch with {SITE.name} for automotive photography projects, vehicle features,
            and creative collaborations in {SITE.city} and across {SITE.country}.
          </p>
          <p>
            Whether you own an exotic car, run a dealership, or are organising an automotive
            event — I&apos;d love to hear about it. I work with private owners, brands and
            publications to produce photography that does justice to the machines.
          </p>
          <p>
            Based in {SITE.city}, available across {SITE.country}.
            You can also reach me directly 
            {SITE.instagramHandle && (
              <>
                {' '}on Instagram at{' '}
                <a
                  href={`https://instagram.com/${SITE.instagramHandle}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  @{SITE.instagramHandle}
                </a>
              </>
            )}
            .
          </p>
        </div>

        <ContactForm />
      </div>
    </>
  );
}
