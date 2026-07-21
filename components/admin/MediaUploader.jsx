'use client';

import { useState } from 'react';
import { api } from '@/lib/clientApi';
import { cdn } from '@/lib/site';
import CropModal from './CropModal';

export default function MediaUploader({ media, onChange }) {
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [cropQueue, setCropQueue] = useState([]); // File[] waiting to be cropped

  async function uploadFile(file) {
    const fd = new FormData();
    fd.append('files', file);
    const { media: uploaded } = await api.upload('/admin/upload', fd);
    return uploaded.map((m) => ({ ...m, altText: '' }));
  }

  // Called after cropping/skipping one file — uploads it immediately.
  async function processOne(file) {
    setBusy(true);
    setError('');
    try {
      const items = await uploadFile(file);
      onChange([...media, ...items]);
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
    // advance the queue
    setCropQueue((q) => q.slice(1));
  }

  function enqueue(fileList) {
    const files = [...fileList].filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/')
    );
    if (!files.length) return;
    // Videos skip the crop step — go straight to upload
    const images = files.filter((f) => f.type.startsWith('image/'));
    const videos = files.filter((f) => f.type.startsWith('video/'));
    // Upload videos immediately
    if (videos.length) {
      setBusy(true);
      Promise.all(videos.map(uploadFile))
        .then((results) => onChange([...media, ...results.flat()]))
        .catch((err) => setError(`Upload failed: ${err.message}`))
        .finally(() => setBusy(false));
    }
    if (images.length) setCropQueue((q) => [...q, ...images]);
  }

  function setAlt(i, altText) {
    onChange(media.map((m, idx) => (idx === i ? { ...m, altText } : m)));
  }

  function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= media.length) return;
    const next = [...media];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  function remove(i) {
    const item = media[i];
    onChange(media.filter((_, idx) => idx !== i));
    api.post('/admin/upload/delete', { publicId: item.publicId, type: item.type }).catch(() => {});
  }

  return (
    <div className="field">
      <label>Media (first item is the cover) *</label>
      {error && <div className="form-error" style={{ marginBottom: 10 }}>{error}</div>}

      <label
        className={`dropzone ${drag ? 'drag' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); enqueue(e.dataTransfer.files); }}
      >
        {busy ? 'Uploading…' : 'Drag & drop images/videos here, or click to browse'}
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => { enqueue(e.target.files); e.target.value = ''; }}
        />
      </label>

      {cropQueue.length > 0 && (
        <CropModal
          file={cropQueue[0]}
          index={0}
          total={cropQueue.length}
          onDone={(cropped) => processOne(cropped)}
          onSkip={() => processOne(cropQueue[0])}
          onCancel={() => setCropQueue([])}
        />
      )}

      {media.length > 0 && (
        <div className="media-list">
          {media.map((m, i) => (
            <div className="media-item" key={m.publicId}>
              {m.type === 'video' ? (
                <video src={m.url} muted controls />
              ) : (
                <img src={cdn(m.url, 'f_auto,q_auto,w_400')} alt={m.altText || 'uploaded media'} />
              )}
              <div className="media-fields">
                <input
                  className={m.altText.trim().length < 3 ? 'invalid' : ''}
                  value={m.altText}
                  onChange={(e) => setAlt(i, e.target.value)}
                  placeholder="Alt text (required) — e.g. Red Ferrari 296 GTB front three-quarter at dusk"
                />
                <div className="media-actions">
                  <span>{i === 0 ? 'Cover' : m.type}</span>
                  <span>
                    <button type="button" className="btn ghost small" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>{' '}
                    <button type="button" className="btn ghost small" onClick={() => move(i, 1)} disabled={i === media.length - 1}>↓</button>{' '}
                    <button type="button" className="btn danger small" onClick={() => remove(i)}>Remove</button>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
