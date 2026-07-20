import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Post from '@/lib/models/Post';
import { uniqueSlug } from '@/lib/slugify';
import { buildDoc, upsertTaxonomy, errorResponse } from '@/lib/posts';

export async function GET(_request, { params }) {
  const { id } = await params;
  await connectDB();
  const post = await Post.findById(id).lean().catch(() => null);
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const post = await Post.findById(id);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    const body = await request.json();
    const doc = buildDoc(body);
    if (body.slug && body.slug !== post.slug) {
      doc.slug = await uniqueSlug(Post, body.slug, post._id);
    }
    Object.assign(post, doc);
    await post.save();
    await upsertTaxonomy(doc);
    return NextResponse.json({ post });
  } catch (err) {
    const { message, status } = errorResponse(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  await connectDB();
  const post = await Post.findByIdAndDelete(id).catch(() => null);
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
