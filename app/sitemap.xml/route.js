import { connectDB } from '@/lib/db';
import Post from '@/lib/models/Post';

export const dynamic = 'force-dynamic';

const BASE = 'https://farrukh-photography.vercel.app';

// XML-safe escaping — must run on every user-supplied string.
function e(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isoDate(d) {
  return d ? new Date(d).toISOString().slice(0, 10) : null;
}

// ─── Static pages ────────────────────────────────────────────────────────────
const STATIC = [
  { path: '/',          priority: '1.0', changefreq: 'weekly'  },
  { path: '/portfolio', priority: '0.9', changefreq: 'daily'   },
  { path: '/about',     priority: '0.7', changefreq: 'monthly' },
  { path: '/contact',   priority: '0.6', changefreq: 'yearly'  },
];

// ─── Builders ────────────────────────────────────────────────────────────────
function staticUrl({ path, priority, changefreq }) {
  return `
  <url>
    <loc>${BASE}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function imageTag(m, post) {
  if (m.type !== 'image' || !m.url) return '';
  const geoLabel = [post.carMake, post.carModel, post.city, 'Pakistan']
    .filter(Boolean).join(', ');
  return `
      <image:image>
        <image:loc>${e(m.url)}</image:loc>
        <image:title>${e(post.title)}</image:title>
        ${m.altText   ? `<image:caption>${e(m.altText)}</image:caption>` : ''}
        ${geoLabel    ? `<image:geo_location>${e(geoLabel)}</image:geo_location>` : ''}
        <image:license>${BASE}/about</image:license>
      </image:image>`;
}

function postUrl(post) {
  const lastmod  = isoDate(post.updatedAt || post.publishedAt);
  const images   = (post.media || []).map((m) => imageTag(m, post)).join('');
  const keywords = [...(post.seoKeywords || []), ...(post.tags || [])].join(', ');

  return `
  <url>
    <loc>${BASE}/portfolio/${e(post.slug)}</loc>
    ${lastmod  ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    ${keywords ? `<!-- ${e(keywords)} -->` : ''}${images}
  </url>`;
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export async function GET() {
  let posts = [];
  try {
    await connectDB();
    posts = await Post.find({ status: 'published' })
      .select('slug title carMake carModel city tags seoKeywords publishedAt updatedAt media')
      .sort({ publishedAt: -1 })
      .lean();
  } catch {
    // DB unavailable — serve static pages only; don't break the route.
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  Sitemap for Farrukh Shahzad Photography
  Generated: ${new Date().toISOString()}
  Static pages: ${STATIC.length}
  Portfolio posts: ${posts.length}
  Total images: ${posts.reduce((n, p) => n + (p.media?.filter(m => m.type === 'image').length || 0), 0)}
-->
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="
    http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd
    http://www.google.com/schemas/sitemap-image/1.1
    http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd">
${STATIC.map(staticUrl).join('')}
${posts.map(postUrl).join('')}
</urlset>`;

  return new Response(xml.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Cache 1 hour on CDN; serve stale up to 24 h while revalidating.
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
