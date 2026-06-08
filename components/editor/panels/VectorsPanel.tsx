'use client';

import { useRef } from 'react';
import type * as fabric from 'fabric';
import Panel from '@/components/editor/Panel';
import { addSVGToCanvas } from '@/lib/fabric-utils';

interface VectorsPanelProps {
  canvas: fabric.Canvas | null;
  onClose: () => void;
}

export default function VectorsPanel({ canvas, onClose }: VectorsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSVGUpload(file: File) {
    if (!canvas) return;
    const text = await file.text();
    await addSVGToCanvas(canvas, text);
  }

  return (
    <Panel title="Vector boards" onClose={onClose}>
      <div className="px-5 py-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
            <path d="M12 19l7-7 3 3-7 7-3-3z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            <path d="M2 2l7.586 7.586" />
            <circle cx="11" cy="11" r="2" />
          </svg>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          Upload SVG files to add vector graphics to your design.
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Upload SVG
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".svg,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleSVGUpload(file);
            e.target.value = '';
          }}
        />
      </div>
    </Panel>
  );
}
