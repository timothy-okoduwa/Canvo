'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { searchPhotos, type UnsplashPhoto } from '@/lib/unsplash';

export function useUnsplash() {
  const [query, setQuery] = useState('');
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fetchPhotos = useCallback(async (q: string, p: number, append = false) => {
    setLoading(true);
    try {
      const result = await searchPhotos(q, p);
      if (append) {
        setPhotos((prev) => [...prev, ...result.photos]);
      } else {
        setPhotos(result.photos);
      }
      setHasMore(p < result.totalPages);
    } catch (err) {
      console.error('Unsplash search failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPhotos('', 1);
  }, [fetchPhotos]);

  const search = useCallback(
    (q: string) => {
      setQuery(q);
      setPage(1);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchPhotos(q, 1);
      }, 400);
    },
    [fetchPhotos]
  );

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPhotos(query, nextPage, true);
  }, [loading, hasMore, page, query, fetchPhotos]);

  return { query, photos, loading, hasMore, search, loadMore };
}
