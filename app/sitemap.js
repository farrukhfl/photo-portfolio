import { connectDB } from '@/lib/db';
import Post from '@/lib/models/Post';
import { SITE, toSlug } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  try {
    await connectDB();

    const [posts, makes, cities, tags] = await Promise.all([
      Post.find({ status: 'published' }).select('slug updatedAt').lean(),
      Post.distinct('carMake', { status: 'published', carMake: { $ne: '' } }),
      Post.distinct('city', { status: 'published', city: { $ne: '' } }),
      Post.distinct('tags', { status: 'published' }),
    ]);

    const staticPages = [
      { url: SITE.url, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
      { url: `${SITE.url}/portfolio`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
      { url: `${SITE.url}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${SITE.url}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    ];

    const postPages = posts.map((p) => ({
      url: `${SITE.url}/portfolio/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.8,
    }));

    const landingPages = [
      ...makes.map((m) => ({
        url: `${SITE.url}/automotive-photography/${toSlug(m)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.85,
      })),
      ...cities.map((c) => ({
        url: `${SITE.url}/automotive-photography/${toSlug(c)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.85,
      })),
      ...tags.map((t) => ({
        url: `${SITE.url}/automotive-photography/${toSlug(t)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.75,
      })),
    ];

    return [...staticPages, ...postPages, ...landingPages];
  } catch {
    return [];
  }
}
