'use client';

import { useEffect, useState } from 'react';
import type * as fabric from 'fabric';
import Panel from '@/components/editor/Panel';

interface LayersPanelProps {
  canvas: fabric.Canvas | null;
  onClose: () => void;
}

interface LayerInfo {
  index: number;
  type: string;
  name: string;
  visible: boolean;
}

function getLayerName(obj: fabric.FabricObject, index: number): string {
  if ((obj as any).text) return `Text: "${(obj as any).text.substring(0, 20)}"`;
  const type = obj.type || 'object';
  const typeNames: Record<string, string> = {
    rect: 'Rectangle',
    circle: 'Circle',
    triangle: 'Triangle',
    line: 'Line',
    polygon: 'Polygon',
    image: 'Image',
    group: 'Group',
    path: 'Path',
    i_text: 'Text',
    itext: 'Text',
    textbox: 'Textbox',
  };
  return typeNames[type.toLowerCase()] || `${type} ${index + 1}`;
}

export default function LayersPanel({ canvas, onClose }: LayersPanelProps) {
  const [layers, setLayers] = useState<LayerInfo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const refreshLayers = () => {
    if (!canvas) return;
    const objects = canvas.getObjects();
    const newLayers = objects.map((obj, i) => ({
      index: i,
      type: obj.type || 'object',
      name: getLayerName(obj, i),
      visible: obj.visible !== false,
    }));
    setLayers(newLayers.reverse()); // Top layer first

    const active = canvas.getActiveObject();
    if (active) {
      const idx = objects.indexOf(active);
      setSelectedIndex(idx);
    } else {
      setSelectedIndex(null);
    }
  };

  useEffect(() => {
    refreshLayers();
    if (!canvas) return;

    const handler = () => refreshLayers();
    canvas.on('object:added', handler);
    canvas.on('object:removed', handler);
    canvas.on('object:modified', handler);
    canvas.on('selection:created', handler);
    canvas.on('selection:updated', handler);
    canvas.on('selection:cleared', handler);

    return () => {
      canvas.off('object:added', handler);
      canvas.off('object:removed', handler);
      canvas.off('object:modified', handler);
      canvas.off('selection:created', handler);
      canvas.off('selection:updated', handler);
      canvas.off('selection:cleared', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas]);

  function handleSelectLayer(objectIndex: number) {
    if (!canvas) return;
    const objects = canvas.getObjects();
    const obj = objects[objectIndex];
    if (obj) {
      canvas.setActiveObject(obj);
      canvas.renderAll();
      setSelectedIndex(objectIndex);
    }
  }

  function toggleVisibility(objectIndex: number) {
    if (!canvas) return;
    const objects = canvas.getObjects();
    const obj = objects[objectIndex];
    if (obj) {
      obj.set('visible', !obj.visible);
      canvas.renderAll();
      refreshLayers();
    }
  }

  return (
    <Panel title="Layers" onClose={onClose}>
      {layers.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-[var(--color-text-secondary)]">
          No objects on canvas yet.
          <br />
          Add shapes, text, or images to see layers.
        </div>
      ) : (
        <div className="px-2 py-1">
          {layers.map((layer) => (
            <button
              key={layer.index}
              onClick={() => handleSelectLayer(layer.index)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                selectedIndex === layer.index
                  ? 'bg-[var(--color-bg)]'
                  : 'hover:bg-[var(--color-bg)]'
              }`}
            >
              {/* Type indicator */}
              <div className="w-8 h-8 rounded-md bg-[var(--color-bg-editor)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-medium text-[var(--color-text-secondary)] uppercase">
                  {layer.type.substring(0, 3)}
                </span>
              </div>

              {/* Name */}
              <span className="text-xs font-medium text-[var(--color-text-primary)] truncate flex-1">
                {layer.name}
              </span>

              {/* Visibility toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibility(layer.index);
                }}
                className="w-6 h-6 rounded flex items-center justify-center hover:bg-[var(--color-border)] transition-colors cursor-pointer"
                aria-label={layer.visible ? 'Hide' : 'Show'}
              >
                {layer.visible ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </button>
          ))}
        </div>
      )}
    </Panel>
  );
}
