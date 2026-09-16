'use client';

import { useState } from 'react';
import type * as fabric from 'fabric';
import { addChartToCanvas } from '@/lib/fabric-utils';
import Panel from '../Panel';

interface ChartsPanelProps {
  canvas: fabric.Canvas | null;
  onClose: () => void;
}

export default function ChartsPanel({ canvas, onClose }: ChartsPanelProps) {
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line' | 'donut'>('bar');
  const [title, setTitle] = useState('Quarterly Growth');

  const handleAddChart = () => {
    if (!canvas) return;
    addChartToCanvas(canvas, chartType, title);
  };

  return (
    <Panel title="Charts & Graphs" onClose={onClose}>
      <div className="p-4 space-y-5">
        <div>
          <label className="text-xs font-semibold text-neutral-700 block mb-1">Chart Type</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'bar', label: '📊 Bar Chart' },
              { id: 'pie', label: '🥧 Pie Chart' },
              { id: 'line', label: '📈 Line Graph' },
              { id: 'donut', label: '🍩 Donut Chart' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setChartType(item.id as any)}
                className={`p-3 rounded-xl border text-xs font-semibold transition-all text-center ${
                  chartType === item.id
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-neutral-700 block mb-1">Chart Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200 bg-white"
          />
        </div>

        <button
          type="button"
          onClick={handleAddChart}
          className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
        >
          Add Chart to Canvas
        </button>
      </div>
    </Panel>
  );
}
