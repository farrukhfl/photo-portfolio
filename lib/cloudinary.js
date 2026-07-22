import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const FOLDER = process.env.CLOUDINARY_FOLDER || 'portfolio';

/**
 * Upload a file buffer to Cloudinary.
 * Images are capped at 2600px on the long edge and recompressed (q_auto) at
 * upload time so we never store/serve unoptimized originals.
 *
 * Pass `hint` (e.g. the post slug) to get a descriptive public_id like
 * "ferrari-296-gtb-karachi-lm3ab" instead of a random hash.
 */
export function uploadBuffer(buffer, { mimetype, hint = '' }) {
  const isVideo = mimetype.startsWith('video/');

  // Build a descriptive public_id when a hint is available.
  // Append a 5-char base-36 timestamp fragment so duplicate slugs never collide.
  const publicId = hint
    ? `${hint.slice(0, 60)}-${Date.now().toString(36).slice(-5)}`
    : undefined;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: FOLDER,
        resource_type: isVideo ? 'video' : 'image',
        ...(publicId ? { public_id: publicId } : {}),
        ...(isVideo
          ? {}
          : { transformation: [{ width: 2600, crop: 'limit', quality: 'auto:good' }] }),
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

export function deleteAsset(publicId, type = 'image') {
  return cloudinary.uploader.destroy(publicId, { resource_type: type });
}
