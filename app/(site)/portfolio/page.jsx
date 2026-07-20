import Link from 'next/link';
import { connectDB } from '@/lib/db';
import Post from '@/lib/models/Post';
import PostCard from '@/components/PostCard';
import PortfolioFilters from '@/components/PortfolioFilters';

export const dynamic = 'force-dynamic';

const PER_PAGE = 24;

export async function generateMetadata({ searchParams }) {
  const { make, city, tag } = await searchParams;
  const filterLabel = [make, city, tag].filter(Boolean).join(' · ');
  return {
    title: filterLabel ? `${filterLabel} — Portfolio` : 'Portfolio — Automotive Photography',
    description: `Portfolio of exotic and rare supercar photography${filterLabel ? ` — ${filterLabel}` : ''} by Farrukh Shahzad, Karachi, Pakistan.`,
    alternates: { canonical: '/portfolio' },
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

  function pageHref(n) {
    const next = new URLSearchParams(sp);
    next.set('page', String(n));
    return `/portfolio?${next}`;
  }

  return (
    <>
      <div className="page-title container">
        <h1>Portfolio</h1>
        <p>Every shoot, uploaded and catalogued. Filter by marque, city or tag.</p>
      </div>

      <div className="section container">
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
