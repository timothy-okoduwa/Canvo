'use client';

import { useState } from 'react';
import type * as fabric from 'fabric';
import { configureDrawingBrush } from '@/lib/fabric-utils';
import type { DrawingTool } from '@/types/canvas';

interface DrawingToolbarProps {
  canvas: fabric.Canvas | null;
  onExit: () => void;
}

const PALETTE = [
  '#1A1A18',
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#FFFFFF',
];

export default function DrawingToolbar({ canvas, onExit }: DrawingToolbarProps) {
  const [activeTool, setActiveTool] = useState<'pen' | 'marker' | 'highlighter' | 'eraser'>('pen');
  const [color, setColor] = useState('#1A1A18');
  const [width, setWidth] = useState(6);

  const applyBrush = (
    t: 'pen' | 'marker' | 'highlighter' | 'eraser',
    c: string,
    w: number
  ) => {
    if (!canvas) return;
    setActiveTool(t);
    setColor(c);
    setWidth(w);
    configureDrawingBrush(canvas, t, c, w);
  };

  const handleDone = () => {
    if (canvas) {
      canvas.isDrawingMode = false;
    }
    onExit();
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur-md border border-neutral-200/80 shadow-2xl rounded-full px-5 py-2.5 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
      {/* Tool buttons */}
      <div className="flex items-center gap-1.5 border-r border-neutral-200 pr-3">
        <button
          type="button"
          onClick={() => applyBrush('pen', color, width)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
            activeTool === 'pen'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          ✏️ Pen
        </button>
        <button
          type="button"
          onClick={() => applyBrush('marker', color, width)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
            activeTool === 'marker'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          🖊️ Marker
        </button>
        <button
          type="button"
          onClick={() => applyBrush('highlighter', '#FDE047', width)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
            activeTool === 'highlighter'
              ? 'bg-amber-400 text-neutral-900 shadow-sm font-bold'
              : 'text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          🖍️ Highlighter
        </button>
        <button
          type="button"
          onClick={() => applyBrush('eraser', '#FFFFFF', width)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
            activeTool === 'eraser'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          🧹 Eraser
        </button>
      </div>

      {/* Thickness slider */}
      <div className="flex items-center gap-2 border-r border-neutral-200 pr-3">
        <span className="text-xs text-neutral-500 font-medium">Size:</span>
        <input
          type="range"
          min="1"
          max="40"
          value={width}
          onChange={(e) => applyBrush(activeTool, color, Number(e.target.value))}
          className="w-24 accent-neutral-900 cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
        />
        <span className="text-xs font-bold text-neutral-700 w-5">{width}</span>
      </div>

      {/* Color Palette */}
      {activeTool !== 'eraser' && (
        <div className="flex items-center gap-1.5 pr-2">
          {PALETTE.map((hex) => (
            <button
              key={hex}
              type="button"
              onClick={() => applyBrush(activeTool, hex, width)}
              style={{ backgroundColor: hex }}
              className={`w-6 h-6 rounded-full border border-neutral-300 transition-transform ${
                color === hex ? 'scale-125 ring-2 ring-neutral-900 ring-offset-1' : 'hover:scale-110'
              }`}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => applyBrush(activeTool, e.target.value, width)}
            className="w-6 h-6 rounded-full cursor-pointer border-0 bg-transparent"
          />
        </div>
      )}

      {/* Done button */}
      <button
        type="button"
        onClick={handleDone}
        className="ml-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full shadow-md transition-all active:scale-95"
      >
        Done Drawing
      </button>
    </div>
  );
}
