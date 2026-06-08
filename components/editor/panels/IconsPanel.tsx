'use client';

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import type * as fabric from 'fabric';
import Panel from '@/components/editor/Panel';
import { addSVGToCanvas } from '@/lib/fabric-utils';
import { createRoot } from 'react-dom/client';
import * as Hugeicons from 'hugeicons-react';

interface IconsPanelProps {
  canvas: fabric.Canvas | null;
  onClose: () => void;
}

// Extract all valid icon components exported from hugeicons-react
const ALL_ICONS = Object.entries(Hugeicons)
  .filter(([key, value]) => typeof value === 'function' && key.endsWith('Icon'))
  .map(([key, Component]) => {
    // Convert e.g., "Home01Icon" to a user-friendly search string "home 01"
    const label = key
      .replace(/Icon$/, '')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .toLowerCase();
    return {
      name: key.replace(/Icon$/, ''),
      label,
      Component: Component as React.ComponentType<any>,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

async function getSVGStringFromComponent(Component: any): Promise<string> {
  return new Promise((resolve) => {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = '-9999px';
    div.style.top = '-9999px';
    document.body.appendChild(div);

    const root = createRoot(div);
    root.render(<Component size={48} color="#1A1A18" />);

    setTimeout(() => {
      const svg = div.querySelector('svg');
      let svgString = '';
      if (svg) {
        if (!svg.getAttribute('viewBox')) {
          svg.setAttribute('viewBox', '0 0 24 24');
        }
        svgString = svg.outerHTML;
      }
      root.unmount();
      document.body.removeChild(div);
      resolve(svgString);
    }, 25);
  });
}

export default function IconsPanel({ canvas, onClose }: IconsPanelProps) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 80;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_ICONS;
    return ALL_ICONS.filter((icon) => icon.label.includes(q));
  }, [query]);

  const displayed = useMemo(() => {
    return filtered.slice(0, page * ITEMS_PER_PAGE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  // Infinite scroll intersection observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastIconRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;
      
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && displayed.length < filtered.length) {
          setPage((p) => p + 1);
        }
      });
      observerRef.current.observe(node);
    },
    [displayed.length, filtered.length]
  );

  async function handleAddIcon(Component: any) {
    if (!canvas) return;
    const svgString = await getSVGStringFromComponent(Component);
    if (svgString) {
      await addSVGToCanvas(canvas, svgString);
    }
  }

  return (
    <Panel title="Icons" subtitle="Click to add to canvas" onClose={onClose}>
      {/* Search */}
      <div className="px-5 pb-4">
        <input
          type="search"
          placeholder={`Search ${ALL_ICONS.length} icons...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Icon grid */}
      <div className="panel-grid-4">
        {displayed.map((icon, i) => {
          const IconComponent = icon.Component;
          const isLast = i === displayed.length - 1;
          return (
            <button
              key={`${icon.name}-${i}`}
              ref={isLast ? lastIconRef : undefined}
              onClick={() => handleAddIcon(IconComponent)}
              className="aspect-square rounded-lg border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-bg)] hover:border-[var(--color-accent)] transition-colors cursor-pointer p-3"
              title={icon.name}
            >
              <IconComponent size={24} color="#1A1A18" />
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="px-5 py-8 text-center text-sm text-[var(--color-text-secondary)]">
          No icons matching &quot;{query}&quot;
        </div>
      )}

      {displayed.length < filtered.length && (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-[var(--color-border)] border-t-[var(--color-text-primary)] rounded-full animate-spin" />
        </div>
      )}
    </Panel>
  );
}
