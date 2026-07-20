import Link from 'next/link';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import { connectDB } from '@/lib/db';
import Post from '@/lib/models/Post';
import { SITE, cdn } from '@/lib/site';
import PostCard from '@/components/PostCard';
import JsonLd from '@/components/JsonLd';
import ViewTracker from '@/components/ViewTracker';

export const dynamic = 'force-dynamic';

async function getPost(slug) {
  await connectDB();
  const post = await Post.findOne({ slug, status: 'published' }).lean();
  return post ? JSON.parse(JSON.stringify(post)) : null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug).catch(() => null);
  if (!post) return { title: 'Not found' };

  const cover = post.media?.[0];
  return {
    title: { absolute: post.metaTitle || `${post.title} | ${SITE.title}` },
    description: post.metaDescription || SITE.description,
    keywords: [...(post.seoKeywords || []), ...(post.tags || [])],
    alternates: { canonical: `/portfolio/${post.slug}` },
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || SITE.description,
      type: 'article',
      url: `/portfolio/${post.slug}`,
      ...(cover?.type === 'image' && { images: [{ url: cover.url, alt: cover.altText }] }),
    },
    twitter: { card: cover?.type === 'image' ? 'summary_large_image' : 'summary' },
  };
}

export default async function PostDetail({ params }) {
  const { slug } = await params;
  const post = await getPost(slug).catch(() => null);
  if (!post) notFound();

  await connectDB();
  const related = JSON.parse(
    JSON.stringify(
      await Post.find({
        _id: { $ne: post._id },
        status: 'published',
        $or: [{ carMake: post.carMake || '__none__' }, { city: post.city || '__none__' }],
      })
        .select('title slug media carMake carModel city')
        .sort({ publishedAt: -1 })
        .limit(4)
        .lean()
    )
  );

  const [cover, ...rest] = post.media || [];
  const car = [post.carYear, post.carMake, post.carModel].filter(Boolean).join(' ');
  const where = [post.location, post.city].filter(Boolean).join(', ');
  const bodyHtml = post.body ? DOMPurify.sanitize(marked.parse(post.body)) : '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: cover?.url,
    name: post.title,
    description: post.metaDescription || undefined,
    keywords: [...(post.seoKeywords || []), ...(post.tags || [])].join(', ') || undefined,
    datePublished: post.publishedAt || undefined,
    contentLocation: where || undefined,
    creator: { '@type': 'Person', name: SITE.name, url: SITE.url },
    creditText: `© ${SITE.name}`,
    copyrightNotice: `© ${SITE.name}`,
  };

  return (
    <article>
      <ViewTracker slug={post.slug} />
      <JsonLd data={jsonLd} />

      <div className="post-hero">
        {cover?.type === 'video' ? (
          <video src={cover.url} controls autoPlay muted loop playsInline aria-label={cover.altText} />
        ) : cover ? (
          <img src={cdn(cover.url, 'f_auto,q_auto,w_2000')} alt={cover.altText} />
        ) : null}
      </div>

      <div className="container">
        <div className="page-title" style={{ paddingTop: 40 }}>
          <h1>{post.title}</h1>
        </div>

        <div className="post-meta-bar">
          {car && <div><span className="k">Car</span><span className="v">{car}</span></div>}
          {where && <div><span className="k">Location</span><span className="v">{where}</span></div>}
          {post.publishedAt && (
            <div>
              <span className="k">Published</span>
              <span className="v">
                {new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>

        {bodyHtml && <div className="post-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />}

        {rest.length > 0 && (
          <div className="post-gallery">
            {rest.map((m) =>
              m.type === 'video' ? (
                <video key={m.publicId} src={m.url} controls muted playsInline aria-label={m.altText} />
              ) : (
                <img key={m.publicId} src={cdn(m.url, 'f_auto,q_auto,w_1800')} alt={m.altText} loading="lazy" />
              )
            )}
          </div>
        )}

        {(post.tags || []).length > 0 && (
          <div className="tag-row">
            {post.tags.map((t) => (
              <Link key={t} href={`/portfolio?tag=${encodeURIComponent(t)}`}>#{t}</Link>
            ))}
          </div>
        )}

        {related.length > 0 && (
          <section className="section">
            <div className="section-head">
              <h2>Related Work</h2>
            </div>
            <div className="masonry">
              {related.map((p) => <PostCard key={p.slug} post={p} />)}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
