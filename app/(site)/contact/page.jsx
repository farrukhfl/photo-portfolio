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
      <div className="page-title container">
        <p className="eyebrow" style={{ marginBottom: 16 }}>Contact</p>
        <h1>Let&apos;s shoot something rare.</h1>
        <p>Owner shoots, dealership work, events, editorial — tell me about the car and the idea.</p>
      </div>

      <div className="container contact-grid">
        <div>
          <div className="contact-line">
            <div className="k">Email</div>
            <div className="v"><a href={`mailto:${SITE.email}`}>{SITE.email}</a></div>
          </div>
          <div className="contact-line">
            <div className="k">Based in</div>
            <div className="v">{SITE.city}, {SITE.country}</div>
          </div>
          {SITE.instagramHandle && (
            <div className="contact-line">
              <div className="k">Instagram</div>
              <div className="v">
                <a href={`https://instagram.com/${SITE.instagramHandle}`} target="_blank" rel="noreferrer">
                  @{SITE.instagramHandle}
                </a>
              </div>
            </div>
          )}
          <div className="contact-line">
            <div className="k">Availability</div>
            <div className="v">Shoots across Pakistan by arrangement</div>
          </div>
        </div>

        <ContactForm />
      </div>
    </>
  );
}
