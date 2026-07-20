# Farrukh Shahzad — Automotive Photography Portfolio

Next.js 15 (App Router) + MongoDB portfolio site. All content is uploaded manually
through the private admin dashboard at `/admin` — no Instagram integration.

## Stack

| Piece | Choice |
| --- | --- |
| Framework | Next.js 15 App Router, React 19 — public pages are **server-rendered** (real SEO, no JS required for crawlers) |
| Database | MongoDB via Mongoose 8 (server components query it directly) |
| Media | Cloudinary (images capped at 2600px + `q_auto` at upload; `f_auto,q_auto` on delivery) |
| Auth | Single admin account, JWT in an **httpOnly cookie**, enforced by `middleware.js` |
| SEO | `generateMetadata` per page, canonicals, Open Graph, JSON-LD (`Person`, `ImageObject`), dynamic `/sitemap.xml`, `robots.txt` |

## First-time setup

1. **Install:**
   ```bash
   npm install
   ```

2. **Configure** — copy the env template and fill it in:
   ```bash
   cp .env.example .env.local
   ```
   You need: a MongoDB URI (local MongoDB or a free [Atlas](https://www.mongodb.com/atlas) cluster),
   [Cloudinary](https://cloudinary.com) credentials (free tier is fine), a long random
   `JWT_SECRET`, and your desired admin email/password.

3. **Create your admin account:**
   ```bash
   npm run seed
   ```

4. **Personalize:** edit `lib/site.js` (contact email, tagline, optional Instagram handle)
   and the placeholder copy in `app/(site)/about/page.jsx`.

## Run locally

```bash
npm run dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin (log in with the seeded credentials)

## Content workflow

1. `/admin` → **New Post**
2. Drag-drop images/videos → they upload to Cloudinary immediately
3. Fill in the listing: title, slug (auto-suggested), markdown description, car make/model/year
   (autocompletes from previously used cars), location/city, tags, SEO keyword phrases,
   meta title/description (sensible defaults generated from the car + location if left blank)
4. **Alt text is required on every file** — publishing is blocked without it
5. Save Draft or Publish; toggle Featured to surface it on the homepage

Cars and locations are catalogued automatically from what you enter, powering the
portfolio filters and autocompletes.

## Deploy

**Vercel (easiest):** import the repo, set the env vars from `.env.example`
(`SITE_URL` and `NEXT_PUBLIC_SITE_URL` = your domain, `MONGODB_URI` from Atlas,
`JWT_SECRET`, `CLOUDINARY_*`), deploy. Done.

**Any Node host (Railway, Render, VPS):**
```bash
npm run build
npm start
```

Post pages, the portfolio and the sitemap render fresh from the DB on every request
(`force-dynamic`), so builds don't need database access and new posts appear instantly.

After going live, submit `https://yourdomain.com/sitemap.xml` in
[Google Search Console](https://search.google.com/search-console) to get posts indexed.

## Project layout

```
app/
  layout.jsx                 Root layout: Manrope font, default metadata
  (site)/                    Public pages (server components, shared nav/footer)
    page.jsx                 Home — hero + featured masonry grid
    portfolio/page.jsx       Filterable gallery (make/city/tag via query params)
    portfolio/[slug]/page.jsx  Post page — generateMetadata + ImageObject JSON-LD
    about/page.jsx           Bio + Person JSON-LD
    contact/page.jsx         Contact info + inquiry form
  admin/
    login/page.jsx           Admin login
    (dashboard)/             Session-guarded: post table + editor
  api/                       Route handlers: auth, admin CRUD, upload, taxonomy
  sitemap.xml/route.js       Dynamic sitemap from published posts
  robots.js                  robots.txt (blocks /admin and /api)
components/                  Nav, Footer, PostCard, JsonLd + admin/ widgets
lib/                         db connect, Mongoose models, auth (jose), cloudinary, site config
middleware.js                Cookie-JWT guard for /admin and /api/admin
scripts/seedAdmin.js         Creates/updates the admin account from .env.local
```
