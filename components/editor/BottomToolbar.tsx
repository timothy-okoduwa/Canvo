'use client';

import { useState, useRef, useEffect } from 'react';
import type * as fabric from 'fabric';
import { addText, addShape, addImageFromFile } from '@/lib/fabric-utils';
import type { ShapeType } from '@/types/canvas';

interface BottomToolbarProps {
  canvas: fabric.Canvas | null;
}

const SHAPES: { type: ShapeType; label: string; icon: React.ReactNode }[] = [
  {
    type: 'rect',
    label: 'Rectangle',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>,
  },
  {
    type: 'circle',
    label: 'Circle',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>,
  },
  {
    type: 'triangle',
    label: 'Triangle',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 22h20L12 2z" /></svg>,
  },
  {
    type: 'line',
    label: 'Line',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="19" x2="19" y2="5" /></svg>,
  },
  {
    type: 'arrow',
    label: 'Arrow',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  },
  {
    type: 'star',
    label: 'Star',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  },
];

export default function BottomToolbar({ canvas }: BottomToolbarProps) {
  const [shapesOpen, setShapesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!shapesOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShapesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [shapesOpen]);

  return (
    <div className="bottom-toolbar">
      {/* Shapes */}
      <div className="relative" ref={dropdownRef}>
        <button
          className="toolbar-btn"
          onClick={() => setShapesOpen(!shapesOpen)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
          Shapes
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="opacity-50">
            <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {shapesOpen && (
          <div className="shapes-dropdown">
            {SHAPES.map((shape) => (
              <button
                key={shape.type}
                onClick={() => {
                  if (canvas) addShape(canvas, shape.type);
                  setShapesOpen(false);
                }}
              >
                {shape.icon}
                <span>{shape.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-[var(--color-border)] mx-1" />

      {/* Text */}
      <button
        className="toolbar-btn"
        onClick={() => canvas && addText(canvas)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" y1="20" x2="15" y2="20" />
          <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
        Text
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-[var(--color-border)] mx-1" />

      {/* Image */}
      <button
        className="toolbar-btn"
        onClick={() => fileInputRef.current?.click()}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        Image
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && canvas) {
            addImageFromFile(canvas, file);
          }
          e.target.value = '';
        }}
      />
    </div>
  );
}
