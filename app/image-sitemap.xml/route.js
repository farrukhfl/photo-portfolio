import { connectDB } from '@/lib/db';
import Post from '@/lib/models/Post';
import { SITE } from '@/lib/site';

export const dynamic = 'force-dynamic';

function escapeXml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  await connectDB();

  const posts = await Post.find({ status: 'published' })
    .select('slug media carMake carModel city')
    .sort({ publishedAt: -1 })
    .lean();

  const urlBlocks = posts
    .map((post) => {
      const images = (post.media || []).filter((m) => m.type === 'image');
      if (!images.length) return null;

      const car = [post.carMake, post.carModel].filter(Boolean).join(' ');
      const location = post.city || SITE.city;

      const imageEntries = images
        .map((m) => {
          const title =
            m.altText ||
            (car
              ? `${car} photographed in ${location}, Pakistan`
              : `Automotive photography in ${location}, Pakistan`);
          const caption = `${title} — photographed by ${SITE.name}`;

          return [
            `    <image:image>`,
            `      <image:loc>${escapeXml(m.url)}</image:loc>`,
            `      <image:title>${escapeXml(title)}</image:title>`,
            `      <image:caption>${escapeXml(caption)}</image:caption>`,
            `    </image:image>`,
          ].join('\n');
        })
        .join('\n');

      return [
        `  <url>`,
        `    <loc>${escapeXml(`${SITE.url}/portfolio/${post.slug}`)}</loc>`,
        imageEntries,
        `  </url>`,
      ].join('\n');
    })
    .filter(Boolean)
    .join('\n');

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset`,
    `  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
    `  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
    urlBlocks,
    `</urlset>`,
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
