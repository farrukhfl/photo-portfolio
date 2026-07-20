import Link from 'next/link';
import { connectDB } from '@/lib/db';
import Post from '@/lib/models/Post';
import Car from '@/lib/models/Car';
import Location from '@/lib/models/Location';

export const dynamic = 'force-dynamic';

async function getStats() {
  await connectDB();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalPublished,
    totalDraft,
    totalFeatured,
    totalCars,
    totalLocations,
    publishedThisMonth,
    publishedLastMonth,
    viewsAgg,
    topPosts,
    recentPosts,
    byMake,
    byCity,
    publishedPosts,
  ] = await Promise.all([
    Post.countDocuments({ status: 'published' }),
    Post.countDocuments({ status: 'draft' }),
    Post.countDocuments({ status: 'published', featured: true }),
    Car.countDocuments(),
    Location.countDocuments(),
    Post.countDocuments({ status: 'published', publishedAt: { $gte: monthStart } }),
    Post.countDocuments({ status: 'published', publishedAt: { $gte: prevMonthStart, $lt: monthStart } }),
    Post.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    Post.find({ status: 'published' })
      .select('title slug views carMake carModel city publishedAt media')
      .sort({ views: -1 })
      .limit(10)
      .lean(),
    Post.find()
      .select('title slug status views publishedAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(8)
      .lean(),
    Post.aggregate([
      { $match: { status: 'published', carMake: { $ne: '' } } },
      { $group: { _id: '$carMake', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    Post.aggregate([
      { $match: { status: 'published', city: { $ne: '' } } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    Post.find({ status: 'published' })
      .select('title slug metaTitle metaDescription media seoKeywords tags body')
      .lean(),
  ]);

  const totalViews = viewsAgg[0]?.total || 0;

  // SEO health audit
  const seoTotal = publishedPosts.length;
  const missingMetaTitle   = publishedPosts.filter(p => !p.metaTitle?.trim()).length;
  const missingMetaDesc    = publishedPosts.filter(p => !p.metaDescription?.trim()).length;
  const missingAlt         = publishedPosts.filter(p => p.media?.some(m => !m.altText?.trim())).length;
  const missingKeywords    = publishedPosts.filter(p => !p.seoKeywords?.length).length;
  const missingBody        = publishedPosts.filter(p => !p.body?.trim()).length;
  const missingTags        = publishedPosts.filter(p => !p.tags?.length).length;

  const seoScore = seoTotal === 0 ? 100 : Math.round(
    ((seoTotal - missingMetaTitle) / seoTotal * 20 +
     (seoTotal - missingMetaDesc)  / seoTotal * 20 +
     (seoTotal - missingAlt)       / seoTotal * 25 +
     (seoTotal - missingKeywords)  / seoTotal * 20 +
     (seoTotal - missingBody)      / seoTotal * 10 +
     (seoTotal - missingTags)      / seoTotal * 5)
  );

  const maxMakeCount = byMake[0]?.count || 1;
  const maxCityCount = byCity[0]?.count || 1;
  const maxViews     = topPosts[0]?.views || 1;

  return {
    totalPublished, totalDraft, totalFeatured, totalViews,
    totalCars, totalLocations, publishedThisMonth, publishedLastMonth,
    seoScore, seoTotal,
    missingMetaTitle, missingMetaDesc, missingAlt,
    missingKeywords, missingBody, missingTags,
    topPosts:    JSON.parse(JSON.stringify(topPosts)),
    recentPosts: JSON.parse(JSON.stringify(recentPosts)),
    byMake, byCity, maxMakeCount, maxCityCount, maxViews,
  };
}

function fmt(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function scoreColor(s) {
  if (s >= 85) return '#86efac';
  if (s >= 60) return '#fde68a';
  return '#fca5a5';
}

export default async function AdminDashboard() {
  const s = await getStats();
  const monthGrowth = s.publishedLastMonth > 0
    ? Math.round(((s.publishedThisMonth - s.publishedLastMonth) / s.publishedLastMonth) * 100)
    : null;

  return (
    <div style={{ paddingBottom: 64 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 32 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800 }}>Dashboard</h2>
        <Link href="/admin/posts/new" className="btn small">+ New Post</Link>
      </div>

      {/* ── Key metrics row ── */}
      <div className="dash-grid-4" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-icon">📸</div>
          <div className="stat-value">{s.totalPublished}</div>
          <div className="stat-label">Published Posts</div>
          {monthGrowth !== null && (
            <div className="stat-sub" style={{ color: monthGrowth >= 0 ? '#86efac' : '#fca5a5' }}>
              {monthGrowth >= 0 ? '▲' : '▼'} {Math.abs(monthGrowth)}% vs last month
            </div>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-icon">👁</div>
          <div className="stat-value">{fmt(s.totalViews)}</div>
          <div className="stat-label">Total Post Views</div>
          <div className="stat-sub">Across all published posts</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✏️</div>
          <div className="stat-value">{s.totalDraft}</div>
          <div className="stat-label">Drafts</div>
          {s.totalDraft > 0 && (
            <div className="stat-sub">
              <Link href="/admin" style={{ color: 'var(--muted)', textDecoration: 'underline' }}>Review drafts →</Link>
            </div>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{s.totalFeatured}</div>
          <div className="stat-label">Featured on Homepage</div>
          <div className="stat-sub">{s.publishedThisMonth} published this month</div>
        </div>
      </div>

      <div className="dash-grid-4" style={{ marginBottom: 36 }}>
        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-value">{s.totalCars}</div>
          <div className="stat-label">Cars Catalogued</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📍</div>
          <div className="stat-value">{s.totalLocations}</div>
          <div className="stat-label">Locations</div>
        </div>
        <div className="stat-card" style={{ borderColor: scoreColor(s.seoScore) }}>
          <div className="stat-icon">🔍</div>
          <div className="stat-value" style={{ color: scoreColor(s.seoScore) }}>{s.seoScore}%</div>
          <div className="stat-label">SEO Score</div>
          <div className="stat-sub">{s.seoTotal} published posts audited</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{s.publishedThisMonth}</div>
          <div className="stat-label">Published This Month</div>
          <div className="stat-sub">{s.publishedLastMonth} last month</div>
        </div>
      </div>

      {/* ── Middle row: SEO health + Top posts ── */}
      <div className="dash-grid-2" style={{ marginBottom: 36 }}>

        {/* SEO Health */}
        <div className="dash-card">
          <div className="dash-card-head">
            <span>SEO Health Audit</span>
            <span style={{ color: scoreColor(s.seoScore), fontWeight: 700 }}>{s.seoScore}/100</span>
          </div>

          {/* Score bar */}
          <div style={{ marginBottom: 24 }}>
            <div className="progress-bg">
              <div className="progress-fill" style={{ width: `${s.seoScore}%`, background: scoreColor(s.seoScore) }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 6 }}>
              {s.seoTotal === 0
                ? 'No published posts yet'
                : `Score based on ${s.seoTotal} published post${s.seoTotal !== 1 ? 's' : ''}`}
            </div>
          </div>

          <div className="seo-audit-list">
            <SeoRow label="Meta titles set"       missing={s.missingMetaTitle} total={s.seoTotal} weight={20} />
            <SeoRow label="Meta descriptions set" missing={s.missingMetaDesc}  total={s.seoTotal} weight={20} />
            <SeoRow label="Image alt texts"       missing={s.missingAlt}       total={s.seoTotal} weight={25} />
            <SeoRow label="SEO keywords filled"   missing={s.missingKeywords}  total={s.seoTotal} weight={20} />
            <SeoRow label="Post descriptions"     missing={s.missingBody}      total={s.seoTotal} weight={10} />
            <SeoRow label="Tags added"            missing={s.missingTags}      total={s.seoTotal} weight={5}  />
          </div>

          {s.seoScore < 100 && s.seoTotal > 0 && (
            <Link href="/admin" className="btn ghost small" style={{ marginTop: 20 }}>Fix issues →</Link>
          )}
        </div>

        {/* Top Posts by Views */}
        <div className="dash-card">
          <div className="dash-card-head">
            <span>Top Posts by Views</span>
          </div>
          {s.topPosts.length === 0 ? (
            <div style={{ color: 'var(--faint)', fontSize: 14, paddingTop: 16 }}>
              No views tracked yet — views are counted when visitors open a post page.
            </div>
          ) : (
            <div className="bar-list">
              {s.topPosts.map((p) => (
                <div className="bar-row" key={p.slug}>
                  <div className="bar-row-meta">
                    <Link href={`/admin/posts/${p._id}`} className="bar-row-title">{p.title}</Link>
                    <span className="bar-row-sub">{[p.carMake, p.carModel].filter(Boolean).join(' ') || p.city}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 140 }}>
                    <div className="thin-bar-bg">
                      <div className="thin-bar-fill" style={{ width: `${Math.round((p.views / s.maxViews) * 100)}%` }} />
                    </div>
                    <span className="bar-row-count">{fmt(p.views)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom row: makes + cities ── */}
      <div className="dash-grid-2" style={{ marginBottom: 36 }}>

        {/* Posts by Make */}
        <div className="dash-card">
          <div className="dash-card-head"><span>Posts by Car Make</span></div>
          {s.byMake.length === 0 ? (
            <div style={{ color: 'var(--faint)', fontSize: 14 }}>No car makes catalogued yet.</div>
          ) : (
            <div className="bar-list">
              {s.byMake.map((m) => (
                <div className="bar-row" key={m._id}>
                  <span className="bar-row-title" style={{ cursor: 'default' }}>{m._id}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 140 }}>
                    <div className="thin-bar-bg">
                      <div className="thin-bar-fill" style={{ width: `${Math.round((m.count / s.maxMakeCount) * 100)}%` }} />
                    </div>
                    <span className="bar-row-count">{m.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Posts by City */}
        <div className="dash-card">
          <div className="dash-card-head"><span>Posts by City</span></div>
          {s.byCity.length === 0 ? (
            <div style={{ color: 'var(--faint)', fontSize: 14 }}>No cities logged yet.</div>
          ) : (
            <div className="bar-list">
              {s.byCity.map((c) => (
                <div className="bar-row" key={c._id}>
                  <span className="bar-row-title" style={{ cursor: 'default' }}>{c._id}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 140 }}>
                    <div className="thin-bar-bg">
                      <div className="thin-bar-fill" style={{ width: `${Math.round((c.count / s.maxCityCount) * 100)}%` }} />
                    </div>
                    <span className="bar-row-count">{c.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="dash-card">
        <div className="dash-card-head">
          <span>Recent Activity</span>
          <Link href="/admin" style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>All posts →</Link>
        </div>
        <div className="table-wrap" style={{ marginTop: 0, border: 'none' }}>
          <table className="admin">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Views</th>
                <th>Last updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {s.recentPosts.map((p) => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 600 }}>{p.title}</td>
                  <td><span className={`badge ${p.status === 'published' ? 'pub' : ''}`}>{p.status}</span></td>
                  <td style={{ color: 'var(--muted)' }}>{fmt(p.views ?? 0)}</td>
                  <td style={{ color: 'var(--faint)', fontSize: 13 }}>{new Date(p.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td><Link href={`/admin/posts/${p._id}`} className="btn ghost small">Edit</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function SeoRow({ label, missing, total, weight }) {
  const ok = missing === 0;
  const pct = total > 0 ? Math.round(((total - missing) / total) * 100) : 100;
  return (
    <div className="seo-audit-row">
      <span className={`seo-dot ${ok ? 'ok' : 'warn'}`} />
      <span className="seo-audit-label">{label}</span>
      <span className="seo-audit-pct" style={{ color: ok ? '#86efac' : '#fde68a' }}>
        {ok ? '✓ All set' : `${missing} missing`}
      </span>
      <div className="seo-mini-bar-bg">
        <div className="seo-mini-bar-fill" style={{
          width: `${pct}%`,
          background: ok ? '#16a34a' : pct > 60 ? '#ca8a04' : '#b91c1c',
        }} />
      </div>
      <span className="seo-audit-weight">×{weight}%</span>
    </div>
  );
}
