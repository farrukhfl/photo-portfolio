import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Post from '@/lib/models/Post';
import { uniqueSlug } from '@/lib/slugify';
import { buildDoc, upsertTaxonomy, errorResponse } from '@/lib/posts';

export async function GET() {
  await connectDB();
  const posts = await Post.find()
    .select('title slug status featured carMake carModel city media publishedAt updatedAt')
    .sort({ updatedAt: -1 })
    .lean();
  return NextResponse.json({ posts });
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const doc = buildDoc(body);
    doc.slug = await uniqueSlug(Post, body.slug || doc.title);
    const post = await Post.create(doc);
    await upsertTaxonomy(doc);
    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    const { message, status } = errorResponse(err);
    return NextResponse.json({ error: message }, { status });
  }
}
