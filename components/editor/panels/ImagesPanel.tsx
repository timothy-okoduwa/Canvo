'use client';

import { useRef, useCallback } from 'react';
import type * as fabric from 'fabric';
import Panel from '@/components/editor/Panel';
import { useUnsplash } from '@/hooks/useUnsplash';
import { addImageFromURL } from '@/lib/fabric-utils';

interface ImagesPanelProps {
  canvas: fabric.Canvas | null;
  onClose: () => void;
}

export default function ImagesPanel({ canvas, onClose }: ImagesPanelProps) {
  const { query, photos, loading, hasMore, search, loadMore } = useUnsplash();
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Infinite scroll via intersection observer
  const lastPhotoRef = useCallback(
    (node: HTMLElement | null) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, loadMore]
  );

  async function handleAddImage(url: string) {
    if (!canvas) return;
    await addImageFromURL(canvas, url);
  }

  return (
    <Panel title="Images" subtitle="Powered by Unsplash" onClose={onClose}>
      {/* Search */}
      <div className="px-5 pb-4">
        <input
          type="search"
          placeholder="Search Unsplash..."
          value={query}
          onChange={(e) => search(e.target.value)}
          className="w-full"
        />
      </div>

      {/* No API key message */}
      {photos.length === 0 && !loading && (
        <div className="px-5 py-8 text-center text-sm text-[var(--color-text-secondary)]">
          {query ? (
            'No results found.'
          ) : (
            <>
              Add your Unsplash API key to
              <br />
              <code className="text-xs bg-[var(--color-bg)] px-1.5 py-0.5 rounded">.env.local</code>
              <br />
              <span className="text-xs mt-2 block opacity-70">
                NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_key
              </span>
            </>
          )}
        </div>
      )}

      {/* Photo grid */}
      <div className="panel-grid-2">
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            ref={i === photos.length - 1 ? lastPhotoRef : undefined}
            className="relative group cursor-pointer"
            onClick={() => handleAddImage(photo.urls.regular)}
          >
            <div className="aspect-square rounded-lg overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors bg-[var(--color-bg)]">
              <img
                src={photo.urls.small}
                alt={photo.alt_description || 'Unsplash photo'}
                className="w-full h-full object-cover"
                loading="lazy"
                draggable={false}
              />
            </div>
            {/* Credit overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent rounded-b-lg px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <a
                href={`${photo.user.links.html}?utm_source=canvo&utm_medium=referral`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-white/90 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {photo.user.name}
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-[var(--color-border)] border-t-[var(--color-text-primary)] rounded-full animate-spin" />
        </div>
      )}
    </Panel>
  );
}
