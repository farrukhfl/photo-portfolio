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
 */
export function uploadBuffer(buffer, { mimetype }) {
  const isVideo = mimetype.startsWith('video/');
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: FOLDER,
        resource_type: isVideo ? 'video' : 'image',
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
