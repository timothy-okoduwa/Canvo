'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import type { Canvas } from 'fabric';
import { exportCanvas, type ExportOptions } from '@/lib/export';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  canvas: Canvas | null;
  fileName: string;
}

type Format = 'png' | 'jpg' | 'svg' | 'pdf';

const FORMAT_OPTIONS: { format: Format; label: string; desc: string }[] = [
  { format: 'png', label: 'PNG', desc: 'Lossless, with transparency' },
  { format: 'jpg', label: 'JPG', desc: 'Compressed, smaller file size' },
  { format: 'svg', label: 'SVG', desc: 'Scalable vector format' },
  { format: 'pdf', label: 'PDF', desc: 'Print-ready document' },
];

export default function ExportModal({
  open,
  onClose,
  canvas,
  fileName,
}: ExportModalProps) {
  const [format, setFormat] = useState<Format>('png');
  const [quality, setQuality] = useState(100);
  const [scale, setScale] = useState(2);
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (!canvas) return;
    setExporting(true);
    try {
      await exportCanvas(canvas, fileName, {
        format,
        quality: quality / 100,
        scale,
      });
      onClose();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="440px">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-5">Export</h2>

        {/* Format */}
        <div className="space-y-2 mb-5">
          <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
            Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FORMAT_OPTIONS.map((opt) => (
              <button
                key={opt.format}
                className={`export-option ${format === opt.format ? 'selected' : ''}`}
                onClick={() => setFormat(opt.format)}
              >
                <div>
                  <div className="text-sm font-semibold">{opt.label}</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quality (JPG only) */}
        {format === 'jpg' && (
          <div className="mb-5">
            <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
              Quality: {quality}%
            </label>
            <input
              type="range"
              min={10}
              max={100}
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="w-full mt-2 accent-[var(--color-accent)]"
            />
          </div>
        )}

        {/* Scale */}
        {(format === 'png' || format === 'jpg' || format === 'pdf') && (
          <div className="mb-6">
            <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-2 block">
              Scale
            </label>
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                    scale === s
                      ? 'border-[var(--color-accent)] bg-[rgba(232,113,90,0.05)] text-[var(--color-accent)]'
                      : 'border-[var(--color-border)] hover:bg-[var(--color-bg)]'
                  }`}
                  onClick={() => setScale(s)}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={exporting || !canvas}
          >
            {exporting ? 'Exporting…' : 'Download'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
