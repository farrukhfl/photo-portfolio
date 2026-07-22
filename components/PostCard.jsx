import Link from 'next/link';
import { cdn } from '@/lib/site';

export default function PostCard({ post }) {
  const cover = post.media?.[0];
  const carLine = [post.carMake, post.carModel, post.city].filter(Boolean).join(' · ');

  const carName = [post.carMake, post.carModel].filter(Boolean).join(' ');
  const coverAlt = cover?.altText ||
    (carName
      ? `${carName}${post.city ? ` photographed in ${post.city}, Pakistan` : ' automotive photography'}`
      : post.title);

  return (
    <Link href={`/portfolio/${post.slug}`} className="card">
      {cover?.type === 'video' ? (
        <video src={cover.url} muted playsInline aria-label={coverAlt} />
      ) : cover ? (
        <img src={cdn(cover.url, 'f_auto,q_auto,w_800')} alt={coverAlt} loading="lazy" />
      ) : null}
      <div className="card-overlay">
        <h3>{post.title}</h3>
        {carLine && <p>{carLine}</p>}
      </div>
    </Link>
  );
}
