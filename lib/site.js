// Site-wide constants. Edit these once — every page, meta tag and JSON-LD block uses them.
export const SITE = {
  name: 'Farrukh Shahzad',
  title: 'Farrukh Shahzad — Automotive Photographer',
  tagline: 'Exotic & rare supercars, photographed in Karachi and across Pakistan.',
  description:
    'Automotive photographer based in Karachi, Pakistan, specializing in exotic and rare supercars. Available for shoots, collaborations and commissions.',
  city: 'Karachi',
  country: 'Pakistan',
  email: 'furrukhshahzad172@gmail.com',
  instagramHandle: 'farrukh_shahzad111',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
};

/** Insert Cloudinary delivery transforms into a stored URL (no-op for other hosts). */
export function cdn(url, transform = 'f_auto,q_auto,w_1200') {
  if (!url?.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/${transform}/`);
}
