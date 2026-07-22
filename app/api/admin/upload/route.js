import { NextResponse } from 'next/server';
import { uploadBuffer } from '@/lib/cloudinary';

export const maxDuration = 120; // large videos can take a while

export async function POST(request) {
  const form = await request.formData();
  const files = form.getAll('files').filter((f) => typeof f === 'object' && f.size > 0);
  if (!files.length) return NextResponse.json({ error: 'No files received' }, { status: 400 });
  const hint = (form.get('hint') || '').trim();

  try {
    const media = [];
    for (const file of files) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) continue;
      const buffer = Buffer.from(await file.arrayBuffer());
      const r = await uploadBuffer(buffer, { mimetype: file.type, hint });
      media.push({
        url: r.secure_url,
        publicId: r.public_id,
        type: r.resource_type === 'video' ? 'video' : 'image',
        width: r.width,
        height: r.height,
      });
    }
    return NextResponse.json({ media }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Upload to Cloudinary failed' }, { status: 502 });
  }
}
