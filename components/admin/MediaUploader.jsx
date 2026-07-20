'use client';

import { useState } from 'react';
import { api } from '@/lib/clientApi';
import { cdn } from '@/lib/site';

/**
 * Drag-and-drop multi-file uploader. Files go straight to Cloudinary via the
 * API; each uploaded item then requires alt text before the post can be saved.
 */
export default function MediaUploader({ media, onChange }) {
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function uploadFiles(fileList) {
    const files = [...fileList].filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/')
    );
    if (!files.length) return;
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('files', f));
      const { media: uploaded } = await api.upload('/admin/upload', fd);
      onChange([...media, ...uploaded.map((m) => ({ ...m, altText: '' }))]);
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
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

  async function remove(i) {
    const item = media[i];
    onChange(media.filter((_, idx) => idx !== i));
    // Best-effort cleanup in Cloudinary; the post no longer references it either way.
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
        onDrop={(e) => { e.preventDefault(); setDrag(false); uploadFiles(e.dataTransfer.files); }}
      >
        {busy ? 'Uploading…' : 'Drag & drop images/videos here, or click to browse'}
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => { uploadFiles(e.target.files); e.target.value = ''; }}
        />
      </label>

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
