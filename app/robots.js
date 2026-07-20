import { SITE } from '@/lib/site';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: 'https://farrukh-photography.vercel.app/sitemap.xml',
  };
}
