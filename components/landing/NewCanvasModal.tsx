'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { PRESETS, CATEGORY_META, type CanvasPreset } from '@/types/canvas';

interface NewCanvasModalProps {
  open: boolean;
  onClose: () => void;
  onCreateFile: (name: string, width: number, height: number) => Promise<string>;
}

function PresetIcon({ width, height }: { width: number; height: number }) {
  const maxDim = 32;
  const aspect = width / height;
  let w: number, h: number;
  if (aspect >= 1) {
    w = maxDim;
    h = maxDim / aspect;
  } else {
    h = maxDim;
    w = maxDim * aspect;
  }

  return (
    <div
      className="flex items-center justify-center"
      style={{ width: 40, height: 40 }}
    >
      <div
        className="rounded-sm border-2 border-[var(--color-text-secondary)]"
        style={{ width: Math.max(w, 8), height: Math.max(h, 8), opacity: 0.5 }}
      />
    </div>
  );
}

export default function NewCanvasModal({
  open,
  onClose,
  onCreateFile,
}: NewCanvasModalProps) {
  const router = useRouter();
  const [tab, setTab] = useState<'presets' | 'customize'>('presets');
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1080);
  const [creating, setCreating] = useState(false);

  async function handleSelectPreset(preset: CanvasPreset) {
    setCreating(true);
    try {
      const id = await onCreateFile(preset.name, preset.width, preset.height);
      onClose();
      router.push(`/editor/${id}`);
    } finally {
      setCreating(false);
    }
  }

  async function handleCreateCustom() {
    if (customWidth < 1 || customHeight < 1) return;
    setCreating(true);
    try {
      const id = await onCreateFile(
        `Custom (${customWidth}×${customHeight})`,
        customWidth,
        customHeight
      );
      onClose();
      router.push(`/editor/${id}`);
    } finally {
      setCreating(false);
    }
  }

  // Group presets by category
  const grouped: Record<string, CanvasPreset[]> = {};
  for (const p of PRESETS) {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="780px">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
            New canvas
          </h2>
          <div className="flex items-center gap-3">
            {tab === 'presets' && (
              <span className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg)] px-3 py-1 rounded-full">
                9 curated presets
              </span>
            )}
            <div className="tab-switcher">
              <button
                className={tab === 'presets' ? 'active' : ''}
                onClick={() => setTab('presets')}
              >
                Presets
              </button>
              <button
                className={tab === 'customize' ? 'active' : ''}
                onClick={() => setTab('customize')}
              >
                Customize
              </button>
            </div>
          </div>
        </div>

        {/* Presets tab */}
        {tab === 'presets' && (
          <div className="space-y-5">
            {Object.entries(grouped).map(([category, presets]) => {
              const meta = CATEGORY_META[category as keyof typeof CATEGORY_META];
              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: meta.color }}
                    />
                    <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
                      {meta.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {presets.map((preset) => (
                      <button
                        key={preset.name}
                        disabled={creating}
                        onClick={() => handleSelectPreset(preset)}
                        className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-white hover:bg-[var(--color-bg)] transition-colors cursor-pointer text-left disabled:opacity-50"
                      >
                        <PresetIcon width={preset.width} height={preset.height} />
                        <div>
                          <div className="text-sm font-medium text-[var(--color-text-primary)]">
                            {preset.name}
                          </div>
                          <div className="text-xs text-[var(--color-text-secondary)]">
                            {preset.width} × {preset.height}px
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Customize tab */}
        {tab === 'customize' && (
          <div className="py-8 flex flex-col items-center gap-6">
            <div className="flex items-end gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                  Width (px)
                </label>
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-32 text-center"
                  min={1}
                  max={10000}
                />
              </div>
              <span className="text-[var(--color-text-secondary)] mb-2">×</span>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                  Height (px)
                </label>
                <input
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-32 text-center"
                  min={1}
                  max={10000}
                />
              </div>
            </div>
            <Button
              variant="primary"
              size="lg"
              disabled={creating || customWidth < 1 || customHeight < 1}
              onClick={handleCreateCustom}
            >
              {creating ? 'Creating…' : 'Create canvas'}
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-4 border-t border-[var(--color-border)]">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
