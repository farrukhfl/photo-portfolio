import { NextResponse } from 'next/server';
import { deleteAsset } from '@/lib/cloudinary';

export async function POST(request) {
  const { publicId, type } = await request.json().catch(() => ({}));
  if (!publicId) return NextResponse.json({ error: 'publicId is required' }, { status: 400 });
  await deleteAsset(publicId, type === 'video' ? 'video' : 'image').catch(() => {});
  return NextResponse.json({ ok: true });
}
