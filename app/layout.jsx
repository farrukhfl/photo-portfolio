import { Manrope } from 'next/font/google';
import Script from 'next/script';
import { SITE } from '@/lib/site';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    siteName: SITE.title,
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={manrope.variable}>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-00X9QECSTZ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-00X9QECSTZ');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
