'use client';

import type * as fabric from 'fabric';
import { addImageFromURL } from '@/lib/fabric-utils';
import Panel from '../Panel';

interface MockupsPanelProps {
  canvas: fabric.Canvas | null;
  onClose: () => void;
}

const MOCKUPS = [
  {
    name: 'iPhone 15 Pro',
    category: 'Device',
    url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop',
  },
  {
    name: 'MacBook Pro 16"',
    category: 'Device',
    url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop',
  },
  {
    name: 'Minimal Coffee Mug',
    category: 'Product',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop',
  },
  {
    name: 'Cotton T-Shirt Mockup',
    category: 'Apparel',
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop',
  },
];

export default function MockupsPanel({ canvas, onClose }: MockupsPanelProps) {
  const handleInsertMockup = async (url: string) => {
    if (!canvas) return;
    await addImageFromURL(canvas, url);
  };

  return (
    <Panel title="Mockups Library" onClose={onClose}>
      <div className="p-4 space-y-4">
        <p className="text-xs text-neutral-500">
          Place realistic product, apparel, and device mockups directly onto your design.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {MOCKUPS.map((m) => (
            <button
              key={m.name}
              type="button"
              onClick={() => handleInsertMockup(m.url)}
              className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white hover:border-neutral-900 transition-all text-left"
            >
              <div className="w-full h-28 bg-neutral-100 overflow-hidden">
                <img
                  src={m.url}
                  alt={m.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-2.5">
                <span className="text-[10px] text-neutral-400 font-semibold uppercase block">
                  {m.category}
                </span>
                <span className="text-xs font-semibold text-neutral-800 truncate block">
                  {m.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Panel>
  );
}
