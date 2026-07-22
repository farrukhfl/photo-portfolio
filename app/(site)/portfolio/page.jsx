import Link from 'next/link';
import { connectDB } from '@/lib/db';
import Post from '@/lib/models/Post';
import PostCard from '@/components/PostCard';
import PortfolioFilters from '@/components/PortfolioFilters';
import JsonLd from '@/components/JsonLd';
import { SITE } from '@/lib/site';

export const dynamic = 'force-dynamic';

const PER_PAGE = 24;

export async function generateMetadata({ searchParams }) {
  const { make, city, tag } = await searchParams;
  const filterLabel = [make, city, tag].filter(Boolean).join(' · ');
  const title = filterLabel
    ? `${filterLabel} — Portfolio | Farrukh Shahzad`
    : 'Automotive Photography Portfolio | Cars in Karachi | Farrukh Shahzad';
  const description = filterLabel
    ? `Automotive photography filtered by ${filterLabel} — by Farrukh Shahzad, Karachi, Pakistan.`
    : 'Explore Farrukh Shahzad\'s automotive photography portfolio featuring Ferrari, Porsche, Mercedes-Benz, Nissan, Toyota and other rare cars photographed in Karachi, Pakistan.';
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: '/portfolio' },
    openGraph: {
      title,
      description,
      url: `${SITE.url}/portfolio`,
      type: 'website',
    },
  };
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function getData(searchParams) {
  const { make, city, tag } = searchParams;
  const page = Math.max(Number(searchParams.page) || 1, 1);

  const filter = { status: 'published' };
  if (make) filter.carMake = new RegExp(`^${escapeRegex(make)}$`, 'i');
  if (city) filter.city = new RegExp(`^${escapeRegex(city)}$`, 'i');
  if (tag) filter.tags = tag;

  try {
    await connectDB();
    const [posts, total, makes, cities, tags] = await Promise.all([
      Post.find(filter)
        .select('title slug media carMake carModel city')
        .sort({ publishedAt: -1 })
        .skip((page - 1) * PER_PAGE)
        .limit(PER_PAGE)
        .lean(),
      Post.countDocuments(filter),
      Post.distinct('carMake', { status: 'published', carMake: { $ne: '' } }),
      Post.distinct('city', { status: 'published', city: { $ne: '' } }),
      Post.distinct('tags', { status: 'published' }),
    ]);
    return {
      posts: JSON.parse(JSON.stringify(posts)),
      page,
      pages: Math.ceil(total / PER_PAGE),
      options: {
        makes: makes.sort((a, b) => a.localeCompare(b)),
        cities: cities.sort((a, b) => a.localeCompare(b)),
        tags: tags.sort((a, b) => a.localeCompare(b)),
      },
    };
  } catch {
    return { posts: [], page: 1, pages: 1, options: { makes: [], cities: [], tags: [] } };
  }
}

export default async function Portfolio({ searchParams }) {
  const sp = await searchParams;
  const { posts, page, pages, options } = await getData(sp);
  const isFiltered = !!(sp.make || sp.city || sp.tag);

  function pageHref(n) {
    const next = new URLSearchParams(sp);
    next.set('page', String(n));
    return `/portfolio?${next}`;
  }

  const portfolioPageLd = !isFiltered ? {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE.url}/portfolio`,
    url: `${SITE.url}/portfolio`,
    name: 'Automotive Photography Portfolio | Cars in Karachi | Farrukh Shahzad',
    description: 'Explore Farrukh Shahzad\'s automotive photography portfolio featuring Ferrari, Porsche, Mercedes-Benz, Nissan, Toyota and other rare cars photographed in Karachi, Pakistan.',
    isPartOf: { '@id': `${SITE.url}/#website` },
  } : null;

  return (
    <>
      {portfolioPageLd && <JsonLd data={portfolioPageLd} />}
      <div className="page-title px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <h1>Portfolio</h1>
        <p>Every shoot, uploaded and catalogued. Filter by marque, city or tag.</p>
      </div>

      <div className="section px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        {!isFiltered && (
          <p className="prose" style={{ marginBottom: 24, maxWidth: '72ch' }}>
            Explore automotive photography from Karachi, Pakistan, featuring exotic cars, supercars,
            luxury vehicles, and rare automobiles photographed across Pakistan&apos;s car culture.
          </p>
        )}
        <PortfolioFilters options={options} />

        {posts.length === 0 ? (
          <div className="empty">No published work matches this filter yet.</div>
        ) : (
          <div className="masonry">
            {posts.map((p) => <PostCard key={p.slug} post={p} />)}
          </div>
        )}

        {pages > 1 && (
          <div className="filters" style={{ marginTop: 32, justifyContent: 'center' }}>
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link key={n} href={pageHref(n)} className={`chip ${n === page ? 'on' : ''}`}>
                {n}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
