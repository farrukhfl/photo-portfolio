import Link from 'next/link';
import { cdn } from '@/lib/site';

export default function PostCard({ post }) {
  const cover = post.media?.[0];
  const carLine = [post.carMake, post.carModel, post.city].filter(Boolean).join(' · ');

  return (
    <Link href={`/portfolio/${post.slug}`} className="card">
      {cover?.type === 'video' ? (
        <video src={cover.url} muted playsInline aria-label={cover.altText} />
      ) : cover ? (
        <img src={cdn(cover.url, 'f_auto,q_auto,w_800')} alt={cover.altText} loading="lazy" />
      ) : null}
      <div className="card-overlay">
        <h3>{post.title}</h3>
        {carLine && <p>{carLine}</p>}
      </div>
    </Link>
  );
}
