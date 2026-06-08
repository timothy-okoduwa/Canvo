'use client';

interface ZoomControlProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export default function ZoomControl({ zoom, onZoomChange }: ZoomControlProps) {
  return (
    <div className="zoom-control">
      <button
        className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
        onClick={() => onZoomChange(Math.max(0.1, zoom - 0.1))}
        aria-label="Zoom out"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <input
        type="range"
        min={10}
        max={400}
        value={Math.round(zoom * 100)}
        onChange={(e) => onZoomChange(parseInt(e.target.value) / 100)}
        aria-label="Zoom level"
      />
      <button
        className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
        onClick={() => onZoomChange(Math.min(4, zoom + 0.1))}
        aria-label="Zoom in"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <span>{Math.round(zoom * 100)}%</span>
    </div>
  );
}
