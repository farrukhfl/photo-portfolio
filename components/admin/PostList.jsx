'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/clientApi';
import { cdn } from '@/lib/site';

export default function PostList() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      const { posts } = await api.get('/admin/posts');
      setPosts(posts);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function togglePublish(post) {
    const next = post.status === 'published' ? 'draft' : 'published';
    try {
      const { post: full } = await api.get(`/admin/posts/${post._id}`);
      await api.put(`/admin/posts/${post._id}`, { ...full, status: next });
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function remove(post) {
    if (!confirm(`Delete "${post.title}" permanently? This cannot be undone.`)) return;
    try {
      await api.del(`/admin/posts/${post._id}`);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  if (error) return <div className="form-error">{error}</div>;
  if (!posts) return <p style={{ color: 'var(--faint)' }}>Loading…</p>;

  return (
    <>
      <div className="section-head">
        <h2>Posts ({posts.length})</h2>
        <Link href="/admin/posts/new" className="btn small">+ New Post</Link>
      </div>

      {posts.length === 0 ? (
        <div className="empty">No posts yet. Create your first one.</div>
      ) : (
        <div className="table-wrap">
          <table className="admin">
            <thead>
              <tr>
                <th></th>
                <th>Title</th>
                <th>Car</th>
                <th>City</th>
                <th>Status</th>
                <th>Updated</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p._id}>
                  <td>
                    {p.media?.[0]?.type === 'image' && (
                      <img src={cdn(p.media[0].url, 'f_auto,q_auto,w_120')} alt="" />
                    )}
                  </td>
                  <td>
                    <Link href={`/admin/posts/${p._id}`} style={{ fontWeight: 600 }}>{p.title}</Link>
                    {p.featured && <span className="badge feat" style={{ marginLeft: 8 }}>Featured</span>}
                  </td>
                  <td>{[p.carMake, p.carModel].filter(Boolean).join(' ')}</td>
                  <td>{p.city}</td>
                  <td>
                    <span className={`badge ${p.status === 'published' ? 'pub' : ''}`}>{p.status}</span>
                  </td>
                  <td style={{ color: 'var(--faint)', fontSize: 13 }}>
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button className="btn ghost small" onClick={() => togglePublish(p)}>
                      {p.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>{' '}
                    <Link href={`/admin/posts/${p._id}`} className="btn ghost small">Edit</Link>{' '}
                    <button className="btn danger small" onClick={() => remove(p)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
