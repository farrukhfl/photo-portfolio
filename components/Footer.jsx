import { SITE } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span>
          © {new Date().getFullYear()} {SITE.name} · {SITE.city}, {SITE.country}
        </span>
        <span>
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </span>
      </div>
    </footer>
  );
}
