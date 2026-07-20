import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Post from '@/lib/models/Post';

export async function POST(_req, { params }) {
  try {
    const { slug } = await params;
    await connectDB();
    await Post.updateOne({ slug, status: 'published' }, { $inc: { views: 1 } });
  } catch {
    // Silently fail — view tracking is best-effort and must never break a page.
  }
  return NextResponse.json({ ok: true });
}
