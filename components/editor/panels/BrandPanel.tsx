'use client';

import { useState, useEffect } from 'react';
import type * as fabric from 'fabric';
import { getAllBrandKits, saveBrandKit } from '@/lib/db';
import type { BrandKit } from '@/types/canvas';
import Panel from '../Panel';

interface BrandPanelProps {
  canvas: fabric.Canvas | null;
  onClose: () => void;
}

const DEFAULT_KIT: BrandKit = {
  id: 'default-brand-kit',
  name: 'My Brand Kit',
  colors: [
    { id: '1', name: 'Primary', hex: '#1E293B' },
    { id: '2', name: 'Accent', hex: '#E8715A' },
    { id: '3', name: 'Secondary', hex: '#38BDF8' },
    { id: '4', name: 'Background', hex: '#F8FAFC' },
  ],
  logos: [],
  fonts: { header: 'DM Sans', body: 'Inter', accent: 'Georgia' },
};

export default function BrandPanel({ canvas, onClose }: BrandPanelProps) {
  const [brandKit, setBrandKit] = useState<BrandKit>(DEFAULT_KIT);
  const [newColorHex, setNewColorHex] = useState('#10B981');
  const [newColorName, setNewColorName] = useState('New Color');

  useEffect(() => {
    (async () => {
      const kits = await getAllBrandKits();
      if (kits && kits.length > 0) {
        setBrandKit(kits[0]);
      } else {
        await saveBrandKit(DEFAULT_KIT);
      }
    })();
  }, []);

  const applyColor = (hex: string) => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      active.set('fill', hex);
      canvas.renderAll();
      canvas.fire('object:modified');
    }
  };

  const handleAddColor = async () => {
    const updatedColors = [
      ...brandKit.colors,
      { id: Date.now().toString(), name: newColorName, hex: newColorHex },
    ];
    const updatedKit = { ...brandKit, colors: updatedColors };
    setBrandKit(updatedKit);
    await saveBrandKit(updatedKit);
  };

  return (
    <Panel title="Brand Kit" onClose={onClose}>
      <div className="p-4 space-y-6">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
            Brand Colors
          </h4>
          <div className="grid grid-cols-2 gap-2.5">
            {brandKit.colors.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => applyColor(c.hex)}
                className="flex items-center gap-2.5 p-2 rounded-xl border border-neutral-200/80 hover:border-neutral-400 bg-white transition-all text-left group"
              >
                <div
                  className="w-7 h-7 rounded-lg border border-black/10 shadow-inner shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-neutral-800 truncate">{c.name}</div>
                  <div className="text-[10px] text-neutral-400 uppercase font-mono">{c.hex}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Add Color Form */}
        <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200/60 space-y-2">
          <span className="text-xs font-semibold text-neutral-700 block">Add Brand Color</span>
          <div className="flex gap-2">
            <input
              type="text"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              placeholder="Color name"
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white"
            />
            <input
              type="color"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              className="w-9 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
            />
          </div>
          <button
            type="button"
            onClick={handleAddColor}
            className="w-full py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Add to Brand Kit
          </button>
        </div>

        {/* Brand Fonts */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
            Brand Typography
          </h4>
          <div className="space-y-2">
            <div className="p-3 rounded-xl border border-neutral-200 bg-white flex justify-between items-center">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block font-semibold">Header</span>
                <span className="text-sm font-bold text-neutral-800">{brandKit.fonts.header}</span>
              </div>
            </div>
            <div className="p-3 rounded-xl border border-neutral-200 bg-white flex justify-between items-center">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block font-semibold">Body</span>
                <span className="text-xs text-neutral-700">{brandKit.fonts.body}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
