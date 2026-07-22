'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/clientApi';
import { SITE } from '@/lib/site';
import { slugify } from '@/lib/slugify';
import TagsInput from './TagsInput';
import MediaUploader from './MediaUploader';

const EMPTY = {
  title: '',
  slug: '',
  body: '',
  media: [],
  carMake: '',
  carModel: '',
  carYear: '',
  location: '',
  city: 'Karachi',
  tags: [],
  seoKeywords: [],
  metaTitle: '',
  metaDescription: '',
  featured: false,
  status: 'draft',
};

export default function PostEditor({ id }) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const [cars, setCars] = useState([]);
  const [locations, setLocations] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  useEffect(() => {
    api.get('/cars').then((d) => setCars(d.cars)).catch(() => {});
    api.get('/locations').then((d) => setLocations(d.locations)).catch(() => {});
    if (id) {
      api
        .get(`/admin/posts/${id}`)
        .then(({ post }) => setForm({ ...EMPTY, ...post, carYear: post.carYear || '' }))
        .catch((err) => setError(err.message));
    } else {
      setForm(EMPTY);
      setSlugTouched(false);
    }
  }, [id]);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));
  const setField = (key) => (e) => set(key)(e.target.value);

  // Auto-suggest slug from title until the user edits the slug manually.
  function onTitleChange(e) {
    const title = e.target.value;
    setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));
  }

  // Slug-based hint for Cloudinary public_id — use whatever is available at upload time.
  const uploadHint = useMemo(() => {
    if (form.slug) return form.slug;
    return [form.carMake, form.carModel, form.carYear, form.city]
      .filter(Boolean)
      .join('-')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }, [form.slug, form.carMake, form.carModel, form.carYear, form.city]);

  const suggestedMetaTitle = useMemo(() => {
    const car = [form.carMake, form.carModel].filter(Boolean).join(' ');
    const parts = [form.title || car, [car, form.city].filter(Boolean).join(' — ')].filter(Boolean);
    return `${parts[0]}${parts[1] && parts[1] !== parts[0] ? ` | ${parts[1]}` : ''} | ${SITE.name} Photography`;
  }, [form.title, form.carMake, form.carModel, form.city]);

  const suggestedMetaDesc = useMemo(() => {
    const car = [form.carYear, form.carMake, form.carModel].filter(Boolean).join(' ');
    const where = [form.location, form.city].filter(Boolean).join(', ');
    return `${car || 'Automotive'} photographed${where ? ` at ${where}` : ''} by ${SITE.name}, automotive photographer in ${SITE.city}, ${SITE.country}.`;
  }, [form.carYear, form.carMake, form.carModel, form.location, form.city]);

  const makes = useMemo(() => [...new Set(cars.map((c) => c.make))], [cars]);
  const modelsForMake = useMemo(
    () => cars.filter((c) => !form.carMake || c.make.toLowerCase() === form.carMake.toLowerCase()).map((c) => c.model),
    [cars, form.carMake]
  );
  const cities = useMemo(() => [...new Set(locations.map((l) => l.city))], [locations]);
  const locationNames = useMemo(() => [...new Set(locations.map((l) => l.name))], [locations]);

  function validate(publishing) {
    if (!form.title.trim()) return 'Title is required.';
    if (publishing && form.media.length === 0) return 'Add at least one image or video before publishing.';
    const missingAlt = form.media.some((m) => !m.altText || m.altText.trim().length < 3);
    if (missingAlt) return 'Every image/video needs alt text (min 3 characters).';
    return null;
  }

  async function save(status) {
    const publishing = status === 'published';
    const problem = validate(publishing);
    if (problem) {
      setError(problem);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setBusy(true);
    setError('');
    setSaved('');
    const payload = {
      ...form,
      status,
      metaTitle: form.metaTitle || suggestedMetaTitle,
      metaDescription: form.metaDescription || suggestedMetaDesc,
      carYear: form.carYear ? Number(form.carYear) : undefined,
    };
    try {
      if (id) {
        await api.put(`/admin/posts/${id}`, payload);
        setSaved(publishing ? 'Published.' : 'Draft saved.');
        setForm((f) => ({ ...f, status }));
      } else {
        const { post } = await api.post('/admin/posts', payload);
        router.replace(`/admin/posts/${post._id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="section-head">
        <h2>{id ? 'Edit Post' : 'New Post'}</h2>
        {form.status === 'published' && form.slug && (
          <a href={`/portfolio/${form.slug}`} target="_blank" rel="noreferrer">View live ↗</a>
        )}
      </div>

      <form className="form" onSubmit={(e) => e.preventDefault()}>
        {error && <div className="form-error">{error}</div>}
        {saved && <div className="form-ok">{saved}</div>}

        <MediaUploader media={form.media} onChange={set('media')} hint={uploadHint} />

        <div className="field">
          <label htmlFor="title">Title *</label>
          <input id="title" value={form.title} onChange={onTitleChange} placeholder="e.g. Ferrari 296 GTB at Sea View, Karachi" />
        </div>

        <div className="field">
          <label htmlFor="slug">URL Slug</label>
          <input
            id="slug"
            value={form.slug}
            onChange={(e) => { setSlugTouched(true); set('slug')(slugify(e.target.value)); }}
            placeholder="ferrari-296-gtb-karachi"
          />
          <div className="hint">Public URL: /portfolio/{form.slug || '…'}</div>
        </div>

        <div className="field">
          <label htmlFor="body">Description / Story (Markdown)</label>
          <textarea id="body" rows={8} value={form.body} onChange={setField('body')} placeholder="The story behind the shoot, the car, the owner, the light…" />
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="carMake">Car Make</label>
            <input id="carMake" list="makes" value={form.carMake} onChange={setField('carMake')} placeholder="Ferrari" />
            <datalist id="makes">{makes.map((m) => <option key={m} value={m} />)}</datalist>
          </div>
          <div className="field">
            <label htmlFor="carModel">Car Model</label>
            <input id="carModel" list="models" value={form.carModel} onChange={setField('carModel')} placeholder="296 GTB" />
            <datalist id="models">{modelsForMake.map((m) => <option key={m} value={m} />)}</datalist>
          </div>
          <div className="field">
            <label htmlFor="carYear">Year</label>
            <input id="carYear" type="number" min="1900" max="2100" value={form.carYear} onChange={setField('carYear')} placeholder="2024" />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="location">Location / Venue</label>
            <input id="location" list="locations" value={form.location} onChange={setField('location')} placeholder="Sea View Beach" />
            <datalist id="locations">{locationNames.map((l) => <option key={l} value={l} />)}</datalist>
          </div>
          <div className="field">
            <label htmlFor="city">City</label>
            <input id="city" list="cities" value={form.city} onChange={setField('city')} placeholder="Karachi" />
            <datalist id="cities">{cities.map((c) => <option key={c} value={c} />)}</datalist>
          </div>
        </div>

        <div className="field">
          <label>Tags</label>
          <TagsInput value={form.tags} onChange={set('tags')} placeholder="supercar, night shoot, rolling shot — Enter or comma to add" />
          <div className="hint">Used for on-site filtering and grouping.</div>
        </div>

        <div className="field">
          <label>SEO Keywords</label>
          <TagsInput value={form.seoKeywords} onChange={set('seoKeywords')} placeholder='"rare supercars Karachi", "Ferrari spotted Pakistan"…' />
          <div className="hint">Search-intent phrases people would Google. Separate from tags.</div>
        </div>

        <div className="field">
          <label htmlFor="metaTitle">Meta Title</label>
          <input id="metaTitle" value={form.metaTitle} onChange={setField('metaTitle')} placeholder={suggestedMetaTitle} />
          <div className="hint">
            Left empty, this default is used: “{suggestedMetaTitle}”{' '}
            <button type="button" className="btn ghost small" onClick={() => set('metaTitle')(suggestedMetaTitle)}>Use default</button>
          </div>
        </div>

        <div className="field">
          <label htmlFor="metaDescription">Meta Description</label>
          <textarea id="metaDescription" rows={2} maxLength={320} value={form.metaDescription} onChange={setField('metaDescription')} placeholder={suggestedMetaDesc} />
          <div className="hint">
            {form.metaDescription.length}/320 · Left empty, this default is used.{' '}
            <button type="button" className="btn ghost small" onClick={() => set('metaDescription')(suggestedMetaDesc)}>Use default</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 32 }}>
          <label className="switch">
            <input type="checkbox" checked={form.featured} onChange={(e) => set('featured')(e.target.checked)} />
            <span className="track" />
            <span className="lbl">Featured on homepage</span>
          </label>
        </div>

        <div className="editor-actions">
          <button type="button" className="btn ghost" disabled={busy} onClick={() => save('draft')}>
            {busy ? 'Saving…' : 'Save Draft'}
          </button>
          <button type="button" className="btn" disabled={busy} onClick={() => save('published')}>
            {busy ? 'Saving…' : form.status === 'published' ? 'Update (Published)' : 'Publish'}
          </button>
          {form.status === 'published' && (
            <button type="button" className="btn ghost" disabled={busy} onClick={() => save('draft')}>
              Unpublish
            </button>
          )}
          <span style={{ color: 'var(--faint)', fontSize: 13 }}>
            Status: <strong style={{ color: form.status === 'published' ? '#86efac' : 'var(--muted)' }}>{form.status}</strong>
          </span>
        </div>
      </form>
    </>
  );
}
