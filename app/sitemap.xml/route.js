import { connectDB } from '@/lib/db';
import Post from '@/lib/models/Post';
import { SITE } from '@/lib/site';

// Generated per-request from the DB so new posts appear without a rebuild.
export const dynamic = 'force-dynamic';

const STATIC_PATHS = ['/', '/portfolio', '/about', '/contact'];

export async function GET() {
  const siteUrl = SITE.url.replace(/\/$/, '');
  let posts = [];
  try {
    await connectDB();
    posts = await Post.find({ status: 'published' })
      .select('slug publishedAt updatedAt')
      .sort({ publishedAt: -1 })
      .lean();
  } catch {
    // DB down — still serve the static pages.
  }

  const urls = [
    ...STATIC_PATHS.map((p) => ({ loc: `${siteUrl}${p}`, lastmod: null })),
    ...posts.map((p) => ({
      loc: `${siteUrl}/portfolio/${p.slug}`,
      lastmod: new Date(p.updatedAt || p.publishedAt).toISOString().slice(0, 10),
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`)
  .join('\n')}
</urlset>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
