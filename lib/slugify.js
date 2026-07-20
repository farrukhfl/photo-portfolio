export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/['".,!?()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Ensure a slug is unique for the given model, appending -2, -3, ... if taken.
 * `excludeId` lets an update keep its own slug.
 */
export async function uniqueSlug(Model, base, excludeId = null) {
  const root = slugify(base) || 'post';
  let slug = root;
  let n = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Model.exists(query);
    if (!exists) return slug;
    slug = `${root}-${n++}`;
  }
}
