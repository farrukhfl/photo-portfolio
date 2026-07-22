import Link from 'next/link';
import Image from 'next/image';
import { connectDB } from '@/lib/db';
import Post from '@/lib/models/Post';
import { SITE } from '@/lib/site';
import PostCard from '@/components/PostCard';

export const dynamic = 'force-dynamic';

async function getFeatured() {
  try {
    await connectDB();
    const featured = await Post.find({ status: 'published', featured: true })
      .select('title slug media carMake carModel city')
      .sort({ publishedAt: -1 })
      .limit(9)
      .lean();
    if (featured.length) return featured;
    return Post.find({ status: 'published' })
      .select('title slug media carMake carModel city')
      .sort({ publishedAt: -1 })
      .limit(9)
      .lean();
  } catch {
    return [];
  }
}

export default async function Home() {
  const featured = await getFeatured();

  return (
    <>
      <section className="hero px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="hero-content">
          <p className="eyebrow">Automotive Photographer — {SITE.city}, {SITE.country}</p>
          <h1>Exotic machines, photographed with intent.</h1>
          <p>{SITE.description}</p>
          <div className="hero-cta">
            <Link href="/portfolio" className="btn">View Portfolio</Link>
            <Link href="/contact" className="btn ghost">Book a Shoot</Link>
          </div>
        </div>
        <div className="hero-image">
          <Image
            src="/headers.jpg"
            alt="Automotive photography"
            fill
            priority
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
        </div>
      </section>

      <section className="section px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="section-head">
          <h2>Featured Work</h2>
          <Link href="/portfolio">All work →</Link>
        </div>
        {featured.length === 0 ? (
          <div className="empty">Featured work coming soon.</div>
        ) : (
          <div className="masonry">
            {featured.map((p) => <PostCard key={p.slug} post={JSON.parse(JSON.stringify(p))} />)}
          </div>
        )}
      </section>

      <section className="section px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <p className="eyebrow" style={{ marginBottom: 16 }}>About</p>
        <div className="prose">
          <p>
            I&apos;m {SITE.name}, an automotive photographer based in {SITE.city}. I specialize in
            exotic and rare supercars — the cars you see once and remember. Available for
            owner shoots, dealership work, events and editorial commissions.
          </p>
          <Link href="/about" style={{ textDecoration: 'underline', color: 'var(--muted)' }}>
            More about me →
          </Link>
        </div>
      </section>
    </>
  );
}
