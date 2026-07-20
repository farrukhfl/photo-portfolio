'use client';

import { useEffect } from 'react';

// Fires once on mount; view tracking must never block or break the page.
export default function ViewTracker({ slug }) {
  useEffect(() => {
    fetch(`/api/posts/${slug}/view`, { method: 'POST' }).catch(() => {});
  }, [slug]);

  return null;
}
