import Car from './models/Car.js';
import Location from './models/Location.js';
import { slugify } from './slugify.js';

export function toArray(v) {
  if (Array.isArray(v)) return v.map((s) => String(s).trim()).filter(Boolean);
  if (typeof v === 'string') return v.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
}

/** Normalize an admin form payload into a Post document shape. */
export function buildDoc(body) {
  return {
    title: body.title,
    body: body.body ?? '',
    media: Array.isArray(body.media) ? body.media : [],
    carMake: body.carMake ?? '',
    carModel: body.carModel ?? '',
    carYear: body.carYear ? Number(body.carYear) : undefined,
    location: body.location ?? '',
    city: body.city ?? '',
    tags: toArray(body.tags),
    seoKeywords: toArray(body.seoKeywords),
    metaTitle: body.metaTitle ?? '',
    metaDescription: body.metaDescription ?? '',
    featured: Boolean(body.featured),
    status: body.status === 'published' ? 'published' : 'draft',
  };
}

/** Keep the Car/Location reference collections in sync with what posts actually use. */
export async function upsertTaxonomy({ carMake, carModel, location, city }) {
  if (carMake && carModel) {
    const slug = slugify(`${carMake} ${carModel}`);
    await Car.updateOne(
      { make: carMake, model: carModel },
      { $setOnInsert: { make: carMake, model: carModel, slug } },
      { upsert: true }
    ).catch(() => {}); // ignore slug races; taxonomy is best-effort
  }
  if (city) {
    const name = location || city;
    const slug = slugify(`${name} ${city}`);
    await Location.updateOne(
      { name, city },
      { $setOnInsert: { name, city, slug } },
      { upsert: true }
    ).catch(() => {});
  }
}

/** Map thrown errors to a JSON-able message + status. */
export function errorResponse(err) {
  console.error(err);
  if (err?.name === 'ValidationError') {
    const message = Object.values(err.errors)[0]?.message || 'Validation failed';
    return { message, status: 400 };
  }
  return { message: 'Something went wrong', status: 500 };
}
