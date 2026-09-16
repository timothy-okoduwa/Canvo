'use client';

import type * as fabric from 'fabric';
import { addImageFrame } from '@/lib/fabric-utils';
import Panel from '../Panel';

interface FramesPanelProps {
  canvas: fabric.Canvas | null;
  onClose: () => void;
}

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop',
];

export default function FramesPanel({ canvas, onClose }: FramesPanelProps) {
  const handleAddFrame = (shape: 'circle' | 'rect' | 'phone') => {
    if (!canvas) return;
    const url = SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)];
    addImageFrame(canvas, url, shape);
  };

  return (
    <Panel title="Image Frames & Masking" onClose={onClose}>
      <div className="p-4 space-y-4">
        <p className="text-xs text-neutral-500">
          Select a frame shape to insert a clipped masked image onto your canvas.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleAddFrame('circle')}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-neutral-200 bg-white hover:border-neutral-900 transition-all text-center group"
          >
            <div className="w-16 h-16 rounded-full bg-neutral-100 border-2 border-dashed border-neutral-400 group-hover:border-neutral-900 flex items-center justify-center text-xl">
              ⭕
            </div>
            <span className="text-xs font-semibold text-neutral-700">Circle Frame</span>
          </button>

          <button
            type="button"
            onClick={() => handleAddFrame('rect')}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-neutral-200 bg-white hover:border-neutral-900 transition-all text-center group"
          >
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 border-2 border-dashed border-neutral-400 group-hover:border-neutral-900 flex items-center justify-center text-xl">
              🔲
            </div>
            <span className="text-xs font-semibold text-neutral-700">Rounded Card</span>
          </button>

          <button
            type="button"
            onClick={() => handleAddFrame('phone')}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-neutral-200 bg-white hover:border-neutral-900 transition-all text-center group col-span-2"
          >
            <div className="w-12 h-20 rounded-2xl bg-neutral-100 border-2 border-dashed border-neutral-400 group-hover:border-neutral-900 flex items-center justify-center text-xl">
              📱
            </div>
            <span className="text-xs font-semibold text-neutral-700">Smartphone Screen Frame</span>
          </button>
        </div>
      </div>
    </Panel>
  );
}
