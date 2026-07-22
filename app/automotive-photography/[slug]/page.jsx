import { cache } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { connectDB } from '@/lib/db';
import Post from '@/lib/models/Post';
import { SITE, toSlug } from '@/lib/site';
import PostCard from '@/components/PostCard';
import JsonLd from '@/components/JsonLd';

export const dynamic = 'force-dynamic';

const resolveSlug = cache(async (slug) => {
  await connectDB();

  const [makes, cities, tags] = await Promise.all([
    Post.distinct('carMake', { status: 'published', carMake: { $ne: '' } }),
    Post.distinct('city', { status: 'published', city: { $ne: '' } }),
    Post.distinct('tags', { status: 'published' }),
  ]);

  const matchedMake = makes.find((m) => toSlug(m) === slug);
  const matchedCity = !matchedMake && cities.find((c) => toSlug(c) === slug);
  const matchedTag = !matchedMake && !matchedCity && tags.find((t) => toSlug(t) === slug);

  if (!matchedMake && !matchedCity && !matchedTag) return null;

  const type = matchedMake ? 'make' : matchedCity ? 'city' : 'tag';
  const label = matchedMake || matchedCity || matchedTag;
  const filter = matchedMake
    ? { status: 'published', carMake: matchedMake }
    : matchedCity
    ? { status: 'published', city: matchedCity }
    : { status: 'published', tags: matchedTag };

  const posts = await Post.find(filter)
    .select('title slug media carMake carModel city')
    .sort({ publishedAt: -1 })
    .lean();

  return { type, label, posts: JSON.parse(JSON.stringify(posts)) };
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const result = await resolveSlug(slug);
  if (!result) return { title: 'Not found' };

  const { type, label } = result;
  const title =
    type === 'make'
      ? `${label} Photography in ${SITE.city} | ${SITE.name}`
      : type === 'city'
      ? `Automotive Photography in ${label} | ${SITE.name}`
      : `${label} Automotive Photography | ${SITE.name}`;
  const description =
    type === 'make'
      ? `${label} photography in ${SITE.city}, ${SITE.country} — featuring ${label} vehicles photographed by ${SITE.name}.`
      : type === 'city'
      ? `Automotive photography in ${label}, ${SITE.country} — exotic cars, supercars, luxury SUVs and rare vehicles photographed by ${SITE.name}.`
      : `Automotive photography tagged "${label}" — featuring cars photographed by ${SITE.name} in ${SITE.city}, ${SITE.country}.`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/automotive-photography/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE.url}/automotive-photography/${slug}`,
      type: 'website',
    },
  };
}

export default async function AutomotiveLanding({ params }) {
  const { slug } = await params;
  const result = await resolveSlug(slug);
  if (!result) notFound();

  const { type, label, posts } = result;

  const heading =
    type === 'make'
      ? `${label} Photography in ${SITE.city}`
      : type === 'city'
      ? `Automotive Photography in ${label}`
      : `${label} Automotive Photography`;

  const intro =
    type === 'make'
      ? `${label} photography in ${SITE.city}, ${SITE.country} — featuring ${label} vehicles photographed by ${SITE.name}. Every ${label} shoot is documented below.`
      : type === 'city'
      ? `Automotive photography in ${label}, ${SITE.country} — featuring exotic cars, supercars, luxury SUVs and rare vehicles photographed by ${SITE.name} in ${label}.`
      : `Automotive photography tagged "${label}" — featuring cars photographed by ${SITE.name} in ${SITE.city}, ${SITE.country}.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${SITE.url}/automotive-photography/${slug}`,
        url: `${SITE.url}/automotive-photography/${slug}`,
        name: heading,
        description: intro,
        isPartOf: { '@id': `${SITE.url}/#website` },
      },
      {
        '@type': 'ItemList',
        name: heading,
        numberOfItems: posts.length,
        itemListElement: posts.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE.url}/portfolio/${p.slug}`,
          name: p.title,
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <div className="page-title px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <p className="eyebrow" style={{ marginBottom: 16 }}>
          {type === 'make' ? label : type === 'city' ? 'Location' : 'Tag'}
        </p>
        <h1>{heading}</h1>
        <p>{intro}</p>
      </div>

      <div className="section px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        {posts.length === 0 ? (
          <div className="empty">No published work found.</div>
        ) : (
          <div className="masonry">
            {posts.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        )}

        <div style={{ marginTop: 40 }}>
          <Link href="/portfolio" style={{ textDecoration: 'underline', color: 'var(--muted)' }}>
            ← View full portfolio
          </Link>
        </div>
      </div>
    </>
  );
}
