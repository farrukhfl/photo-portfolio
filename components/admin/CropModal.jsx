'use client';

import { useCallback, useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';

const RATIOS = [
  { label: 'Free', value: null },
  { label: '16:9', value: 16 / 9 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:2', value: 3 / 2 },
  { label: '1:1', value: 1 },
];

async function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
    img.src = url;
  });
}

async function getCroppedBlob(src, pixelCrop) {
  const image = await createImage(src);
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  canvas.getContext('2d').drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height,
  );
  return new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.95));
}

export default function CropModal({ file, index, total, onDone, onSkip, onCancel }) {
  const [src, setSrc] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(null);
  const [croppedPixels, setCroppedPixels] = useState(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setAspect(null);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onCropComplete = useCallback((_, pixels) => setCroppedPixels(pixels), []);

  async function apply() {
    const blob = await getCroppedBlob(src, croppedPixels);
    onDone(new File([blob], file.name, { type: 'image/jpeg' }));
  }

  return (
    <div className="crop-overlay" onClick={onCancel}>
      <div className="crop-modal" onClick={(e) => e.stopPropagation()}>

        <div className="crop-header">
          <span className="crop-title">Crop image {index + 1} of {total}</span>
          <div className="crop-ratios">
            {RATIOS.map((r) => (
              <button
                key={r.label}
                type="button"
                className={`crop-ratio-btn${aspect === r.value ? ' active' : ''}`}
                onClick={() => setAspect(r.value)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="crop-area">
          {src && (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={aspect ?? undefined}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>

        <div className="crop-zoom">
          <span>Zoom</span>
          <input
            type="range" min={1} max={3} step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </div>

        <div className="crop-footer">
          <button type="button" className="btn ghost" onClick={onCancel}>Cancel all</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn ghost" onClick={onSkip}>Skip crop</button>
            <button type="button" className="btn" onClick={apply}>Crop &amp; Add</button>
          </div>
        </div>

      </div>
    </div>
  );
}
