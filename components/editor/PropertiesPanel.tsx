'use client';

import { useState, useEffect, useCallback } from 'react';
import type * as fabric from 'fabric';
import { deleteSelected, moveLayerForward, moveLayerBackward, moveLayerToFront, moveLayerToBack } from '@/lib/fabric-utils';

interface PropertiesPanelProps {
  canvas: fabric.Canvas | null;
}

export default function PropertiesPanel({ canvas }: PropertiesPanelProps) {
  const [selected, setSelected] = useState<fabric.FabricObject | null>(null);
  const [props, setProps] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    angle: 0,
    opacity: 100,
    fill: '#000000',
    stroke: '',
    strokeWidth: 0,
    fontSize: 40,
    fontFamily: 'DM Sans',
    textAlign: 'left',
    rx: 0,
  });

  const refreshProps = useCallback(() => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) {
      setSelected(null);
      return;
    }
    setSelected(obj);

    const scaleX = obj.scaleX || 1;
    const scaleY = obj.scaleY || 1;

    setProps({
      left: Math.round(obj.left || 0),
      top: Math.round(obj.top || 0),
      width: Math.round((obj.width || 0) * scaleX),
      height: Math.round((obj.height || 0) * scaleY),
      angle: Math.round(obj.angle || 0),
      opacity: Math.round((obj.opacity ?? 1) * 100),
      fill: typeof obj.fill === 'string' ? obj.fill : '#000000',
      stroke: typeof obj.stroke === 'string' ? obj.stroke : '',
      strokeWidth: obj.strokeWidth || 0,
      fontSize: (obj as any).fontSize || 40,
      fontFamily: (obj as any).fontFamily || 'DM Sans',
      textAlign: (obj as any).textAlign || 'left',
      rx: (obj as any).rx || 0,
    });
  }, [canvas]);

  useEffect(() => {
    if (!canvas) return;
    const handler = () => refreshProps();
    canvas.on('selection:created', handler);
    canvas.on('selection:updated', handler);
    canvas.on('selection:cleared', handler);
    canvas.on('object:modified', handler);
    canvas.on('object:scaling', handler);
    canvas.on('object:moving', handler);
    canvas.on('object:rotating', handler);

    return () => {
      canvas.off('selection:created', handler);
      canvas.off('selection:updated', handler);
      canvas.off('selection:cleared', handler);
      canvas.off('object:modified', handler);
      canvas.off('object:scaling', handler);
      canvas.off('object:moving', handler);
      canvas.off('object:rotating', handler);
    };
  }, [canvas, refreshProps]);

  if (!selected || !canvas) return null;

  function updateProp(key: string, value: any) {
    if (!selected || !canvas) return;
    selected.set(key as keyof fabric.FabricObject, value);
    canvas.renderAll();
    refreshProps();
  }

  const isText = selected.type === 'i-text' || selected.type === 'text' || selected.type === 'textbox' || (selected as any).text !== undefined;
  const isRect = selected.type === 'rect';

  return (
    <div className="properties-panel animate-fade-in">
      {/* Position & Size */}
      <div className="prop-section">
        <h3>Position & Size</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="prop-row">
            <span className="prop-label">X</span>
            <input
              type="number"
              className="prop-input"
              value={props.left}
              onChange={(e) => updateProp('left', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="prop-row">
            <span className="prop-label">Y</span>
            <input
              type="number"
              className="prop-input"
              value={props.top}
              onChange={(e) => updateProp('top', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="prop-row">
            <span className="prop-label">W</span>
            <input
              type="number"
              className="prop-input"
              value={props.width}
              onChange={(e) => {
                const w = parseInt(e.target.value) || 1;
                selected.scaleToWidth(w);
                canvas.renderAll();
                refreshProps();
              }}
            />
          </div>
          <div className="prop-row">
            <span className="prop-label">H</span>
            <input
              type="number"
              className="prop-input"
              value={props.height}
              onChange={(e) => {
                const h = parseInt(e.target.value) || 1;
                selected.scaleToHeight(h);
                canvas.renderAll();
                refreshProps();
              }}
            />
          </div>
        </div>
        <div className="prop-row mt-2">
          <span className="prop-label">R</span>
          <input
            type="number"
            className="prop-input"
            value={props.angle}
            onChange={(e) => updateProp('angle', parseInt(e.target.value) || 0)}
          />
          <span className="text-xs text-[var(--color-text-secondary)]">°</span>
        </div>
      </div>

      {/* Appearance */}
      <div className="prop-section">
        <h3>Appearance</h3>
        <div className="prop-row">
          <span className="prop-label text-xs">Fill</span>
          <div className="flex items-center gap-2 flex-1">
            <input
              type="color"
              value={props.fill}
              onChange={(e) => updateProp('fill', e.target.value)}
              className="w-8 h-8 rounded-md border border-[var(--color-border)] cursor-pointer p-0"
            />
            <input
              type="text"
              className="prop-input flex-1"
              value={props.fill}
              onChange={(e) => updateProp('fill', e.target.value)}
            />
          </div>
        </div>
        <div className="prop-row">
          <span className="prop-label text-xs">Stroke</span>
          <div className="flex items-center gap-2 flex-1">
            <input
              type="color"
              value={props.stroke || '#000000'}
              onChange={(e) => updateProp('stroke', e.target.value)}
              className="w-8 h-8 rounded-md border border-[var(--color-border)] cursor-pointer p-0"
            />
            <input
              type="number"
              className="prop-input w-16"
              value={props.strokeWidth}
              min={0}
              onChange={(e) => updateProp('strokeWidth', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
        <div className="prop-row">
          <span className="prop-label text-xs">Opacity</span>
          <input
            type="range"
            min={0}
            max={100}
            value={props.opacity}
            onChange={(e) => updateProp('opacity', parseInt(e.target.value) / 100)}
            className="flex-1 accent-[var(--color-accent)]"
          />
          <span className="text-xs text-[var(--color-text-secondary)] w-8 text-right">
            {props.opacity}%
          </span>
        </div>
        {isRect && (
          <div className="prop-row">
            <span className="prop-label text-xs">Radius</span>
            <input
              type="number"
              className="prop-input flex-1"
              value={props.rx}
              min={0}
              onChange={(e) => {
                const r = parseInt(e.target.value) || 0;
                updateProp('rx', r);
                updateProp('ry', r);
              }}
            />
          </div>
        )}
      </div>

      {/* Text properties */}
      {isText && (
        <div className="prop-section">
          <h3>Text</h3>
          <div className="prop-row">
            <span className="prop-label text-xs">Font</span>
            <select
              className="prop-input flex-1"
              value={props.fontFamily}
              onChange={(e) => updateProp('fontFamily', e.target.value)}
            >
              <option value="DM Sans">DM Sans</option>
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Verdana">Verdana</option>
              <option value="Impact">Impact</option>
            </select>
          </div>
          <div className="prop-row">
            <span className="prop-label text-xs">Size</span>
            <input
              type="number"
              className="prop-input flex-1"
              value={props.fontSize}
              min={1}
              onChange={(e) => updateProp('fontSize', parseInt(e.target.value) || 16)}
            />
          </div>
          <div className="flex gap-1 mt-1">
            {(['left', 'center', 'right'] as const).map((align) => (
              <button
                key={align}
                onClick={() => updateProp('textAlign', align)}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                  props.textAlign === align
                    ? 'border-[var(--color-accent)] bg-[rgba(232,113,90,0.05)] text-[var(--color-accent)]'
                    : 'border-[var(--color-border)] hover:bg-[var(--color-bg)]'
                }`}
              >
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-1 mt-2">
            <button
              onClick={() => {
                const current = (selected as any).fontWeight;
                updateProp('fontWeight', current === 'bold' ? 'normal' : 'bold');
              }}
              className="flex-1 py-1.5 rounded-md text-xs font-bold border border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
            >
              B
            </button>
            <button
              onClick={() => {
                const current = (selected as any).fontStyle;
                updateProp('fontStyle', current === 'italic' ? 'normal' : 'italic');
              }}
              className="flex-1 py-1.5 rounded-md text-xs italic border border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
            >
              I
            </button>
            <button
              onClick={() => {
                const current = (selected as any).underline;
                updateProp('underline', !current);
              }}
              className="flex-1 py-1.5 rounded-md text-xs underline border border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
            >
              U
            </button>
          </div>
        </div>
      )}

      {/* Layer controls */}
      <div className="prop-section">
        <h3>Layer</h3>
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => moveLayerToFront(canvas)}
            className="py-2 rounded-md text-[10px] font-medium border border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
            title="Bring to front"
          >
            Front
          </button>
          <button
            onClick={() => moveLayerForward(canvas)}
            className="py-2 rounded-md text-[10px] font-medium border border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
            title="Move forward"
          >
            Fwd
          </button>
          <button
            onClick={() => moveLayerBackward(canvas)}
            className="py-2 rounded-md text-[10px] font-medium border border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
            title="Move backward"
          >
            Bwd
          </button>
          <button
            onClick={() => moveLayerToBack(canvas)}
            className="py-2 rounded-md text-[10px] font-medium border border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
            title="Send to back"
          >
            Back
          </button>
        </div>
      </div>

      {/* Delete */}
      <div className="prop-section border-b-0">
        <button
          onClick={() => deleteSelected(canvas)}
          className="w-full py-2 rounded-lg text-sm font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
