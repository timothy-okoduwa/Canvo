'use client';

import { useState } from 'react';
import type * as fabric from 'fabric';
import Panel from '@/components/editor/Panel';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { generateQRDataURL } from '@/lib/qr';
import { addImageFromURL } from '@/lib/fabric-utils';

interface AppsPanelProps {
  canvas: fabric.Canvas | null;
  onClose: () => void;
}

export default function AppsPanel({ canvas, onClose }: AppsPanelProps) {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [generating, setGenerating] = useState(false);

  async function handleGenerateQR() {
    if (!qrUrl.trim() || !canvas) return;
    setGenerating(true);
    try {
      const dataUrl = await generateQRDataURL(qrUrl.trim());
      await addImageFromURL(canvas, dataUrl);
      setQrModalOpen(false);
      setQrUrl('');
    } catch (err) {
      console.error('QR generation failed:', err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Panel title="Apps" onClose={onClose}>
      <div className="px-5 py-2">
        {/* QR Code App */}
        <button
          onClick={() => setQrModalOpen(true)}
          className="w-full flex items-center gap-4 p-4 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors cursor-pointer text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--color-text-primary)] flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="3" height="3" />
              <line x1="21" y1="14" x2="21" y2="14.01" />
              <line x1="21" y1="21" x2="21" y2="21.01" />
              <line x1="14" y1="21" x2="14" y2="21.01" />
              <line x1="18" y1="18" x2="18" y2="18.01" />
              <line x1="21" y1="18" x2="21" y2="18.01" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-[var(--color-text-primary)]">
              QR Code
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Encode a URL and place it on the artboard.
            </div>
          </div>
        </button>
      </div>

      {/* QR Code Modal */}
      <Modal open={qrModalOpen} onClose={() => setQrModalOpen(false)} maxWidth="400px">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Generate QR Code</h2>
          <div className="mb-4">
            <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 block">
              URL or text
            </label>
            <input
              type="url"
              placeholder="https://example.com"
              value={qrUrl}
              onChange={(e) => setQrUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerateQR();
              }}
              className="w-full"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setQrModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleGenerateQR}
              disabled={!qrUrl.trim() || generating}
            >
              {generating ? 'Generating…' : 'Add to canvas'}
            </Button>
          </div>
        </div>
      </Modal>
    </Panel>
  );
}
