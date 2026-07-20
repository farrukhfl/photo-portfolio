'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function PortfolioFilters({ options }) {
  const router = useRouter();
  const params = useSearchParams();

  const make = params.get('make') || '';
  const city = params.get('city') || '';
  const tag = params.get('tag') || '';

  function setFilter(key, value) {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    next.delete('page');
    router.replace(`/portfolio${next.size ? `?${next}` : ''}`, { scroll: false });
  }

  return (
    <div className="filters">
      <select value={make} onChange={(e) => setFilter('make', e.target.value)} aria-label="Filter by car make">
        <option value="">All makes</option>
        {options.makes.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
      <select value={city} onChange={(e) => setFilter('city', e.target.value)} aria-label="Filter by city">
        <option value="">All cities</option>
        {options.cities.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      {options.tags.slice(0, 10).map((t) => (
        <button key={t} className={`chip ${tag === t ? 'on' : ''}`} onClick={() => setFilter('tag', tag === t ? '' : t)}>
          {t}
        </button>
      ))}
      {(make || city || tag) && (
        <button className="chip" onClick={() => router.replace('/portfolio', { scroll: false })}>× Clear</button>
      )}
    </div>
  );
}
