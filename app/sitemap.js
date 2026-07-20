import { connectDB } from '@/lib/db';
import Post from '@/lib/models/Post';

const BASE = 'https://farrukh-photography.vercel.app';

export default async function sitemap() {
  let posts = [];

  try {
    await connectDB();
    posts = await Post.find({ status: 'published' })
      .select('slug title carMake carModel city tags seoKeywords publishedAt updatedAt media')
      .sort({ publishedAt: -1 })
      .lean();
  } catch {
    // DB unavailable — return static pages only
  }

  const staticPages = [
    {
      url: `${BASE}/`,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE}/portfolio`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE}/about`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE}/contact`,
      changeFrequency: 'yearly',
      priority: 0.6,
    },
  ];

  const postPages = posts.map((post) => ({
    url: `${BASE}/portfolio/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.8,
    images: (post.media || [])
      .filter((m) => m.type === 'image' && m.url)
      .map((m) => m.url),
  }));

  return [...staticPages, ...postPages];
}
