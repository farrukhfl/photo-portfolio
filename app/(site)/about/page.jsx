import Image from 'next/image';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import JsonLd from '@/components/JsonLd';

export const metadata = {
  title: `About ${SITE.name} — Automotive Photographer in ${SITE.city}`,
  description: `${SITE.name} is an automotive photographer based in ${SITE.city}, ${SITE.country}, specializing in exotic and rare supercars.`,
  alternates: { canonical: '/about' },
};

export default function About() {
  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE.name,
    jobTitle: 'Automotive Photographer',
    description: SITE.description,
    url: `${SITE.url}/about`,
    email: `mailto:${SITE.email}`,
    address: { '@type': 'PostalAddress', addressLocality: SITE.city, addressCountry: SITE.country },
    knowsAbout: ['Automotive photography', 'Supercars', 'Exotic cars', 'Car photography'],
    ...(SITE.instagramHandle && { sameAs: [`https://instagram.com/${SITE.instagramHandle}`] }),
  };

  return (
    <>
      <JsonLd data={personLd} />

      <div className="page-title px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <p className="eyebrow" style={{ marginBottom: 16 }}>About</p>
        <h1>{SITE.name}</h1>
      </div>

      <div className="section px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="about-grid">
          <div className="prose">
            <p>
              I&apos;m an automotive photographer based in {SITE.city}, {SITE.country}. My work focuses
              on the cars you rarely see on these roads — exotics, limited-run supercars and
              rare classics — photographed with the care they deserve.
            </p>
            <p>
              What started as chasing rare metal around {SITE.city} turned into a practiced craft:
              scouting locations, working with owners, and shooting in the light that flatters a
              car&apos;s lines instead of fighting them.
            </p>

            <h2>Equipment</h2>
            <ul>
              {/* TODO: List your real gear */}
              <li>Camera body &amp; lens lineup — add your kit here</li>
              <li>Lighting &amp; rigs — add here</li>
              <li>Editing — add your workflow here</li>
            </ul>

            <h2>Work with me</h2>
            <p>
              Available for owner shoots, dealership and showroom work, automotive events and
              editorial commissions — in {SITE.city} and across {SITE.country}.
            </p>
            <p>
              <Link href="/contact" className="btn" style={{ marginTop: 8 }}>Get in touch</Link>
            </p>
          </div>

          <div className="about-photo">
            <Image
              src="/about.jpg"
              alt={`${SITE.name} with a Nissan GT-R`}
              width={1080}
              height={1080}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              priority
            />
          </div>
        </div>
      </div>
    </>
  );
}
