'use client';

import { useState, useEffect } from 'react';
import type * as fabric from 'fabric';

interface PresentationModalProps {
  open: boolean;
  onClose: () => void;
  pages: string[];
  width: number;
  height: number;
}

export default function PresentationModal({
  open,
  onClose,
  pages,
  width,
  height,
}: PresentationModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        setCurrentIndex((prev) => Math.min(pages.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, pages.length, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center select-none animate-in fade-in duration-300">
      {/* Top Overlay controls */}
      <div className="absolute top-6 left-8 right-8 flex justify-between items-center z-10 text-white/80">
        <div className="text-sm font-semibold tracking-wide">
          Presentation Mode — Slide {currentIndex + 1} of {pages.length}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-semibold backdrop-blur-md transition-all text-white"
        >
          Exit Presentation (Esc)
        </button>
      </div>

      {/* Slide Canvas Render Container */}
      <div className="relative max-w-full max-h-[85vh] aspect-[16/9] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl overflow-hidden transition-transform duration-300 transform scale-100 flex items-center justify-center text-neutral-400 text-lg font-mono"
          style={{
            width: Math.min(window.innerWidth * 0.85, width),
            height: Math.min(window.innerHeight * 0.8, height),
          }}
        >
          {/* Render Slide indicator preview */}
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🖥️</div>
            <div className="text-2xl font-bold text-neutral-800 mb-2">Slide {currentIndex + 1}</div>
            <div className="text-sm text-neutral-500 font-sans">
              Press Arrow Keys or Space to Navigate
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Floating Nav Bar */}
      <div className="absolute bottom-8 z-10 flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 text-white">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          className="disabled:opacity-40 hover:bg-white/20 p-2 rounded-full transition-all"
        >
          ◀ Prev
        </button>
        <span className="text-sm font-mono px-3">
          {currentIndex + 1} / {pages.length}
        </span>
        <button
          type="button"
          disabled={currentIndex === pages.length - 1}
          onClick={() => setCurrentIndex((prev) => Math.min(pages.length - 1, prev + 1))}
          className="disabled:opacity-40 hover:bg-white/20 p-2 rounded-full transition-all"
        >
          Next ▶
        </button>
      </div>
    </div>
  );
}
