'use client';

import { useState, useEffect, useCallback } from 'react';
import type * as fabric from 'fabric';
import * as FabricImport from 'fabric';
import {
  Undo2,
  Redo2,
  Maximize,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Crop,
} from 'lucide-react';
import { deleteSelected } from '@/lib/fabric-utils';
import PauseBgModal from '@/components/ui/PauseBgModal';
import CropModal from '@/components/editor/CropModal';

interface InspectorBarProps {
  canvas: fabric.Canvas | null;
  zoom: number;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  fitToScreen: () => void;
}

export default function InspectorBar({
  canvas,
  zoom,
  undo,
  redo,
  canUndo,
  canRedo,
  fitToScreen,
}: InspectorBarProps) {
  const [selected, setSelected] = useState<fabric.FabricObject | null>(null);
  const [props, setProps] = useState({
    fill: '#000000',
    stroke: '',
    strokeWidth: 0,
    fontSize: 40,
    fontFamily: 'DM Sans',
    textAlign: 'left',
    opacity: 100,
    rx: 0,
    blur: 0,
    hasShadow: false,
    bgColor: '#ffffff',
  });

  const [bgInput, setBgInput] = useState('#ffffff');
  const [bgModalOpen, setBgModalOpen] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);

  // Sync canvas background color inputs
  useEffect(() => {
    if (canvas) {
      const bg = canvas.backgroundColor;
      if (typeof bg === 'string') {
        setBgInput(bg);
        setProps((prev) => ({ ...prev, bgColor: bg }));
      }
    }
  }, [canvas]);

  const refreshProps = useCallback(() => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) {
      setSelected(null);
      // Update canvas background color state
      const bg = canvas.backgroundColor;
      if (typeof bg === 'string') {
        setProps((prev) => ({ ...prev, bgColor: bg }));
      }
      return;
    }
    setSelected(obj);

    // Read image filters for blur
    let currentBlur = 0;
    let currentHasShadow = false;

    if (obj.type === 'image' || obj.type === 'fabricImage') {
      const img = obj as fabric.FabricImage;
      const blurFilter = img.filters?.find(
        (f) => f && f.type === 'Blur'
      ) as any;
      if (blurFilter) {
        currentBlur = blurFilter.blur || 0;
      }
      currentHasShadow = !!img.shadow;
    }

    setProps({
      fill: typeof obj.fill === 'string' ? obj.fill : '#000000',
      stroke: typeof obj.stroke === 'string' ? obj.stroke : '',
      strokeWidth: obj.strokeWidth || 0,
      fontSize: (obj as any).fontSize || 40,
      fontFamily: (obj as any).fontFamily || 'DM Sans',
      textAlign: (obj as any).textAlign || 'left',
      opacity: Math.round((obj.opacity ?? 1) * 100),
      rx: (obj as any).rx || 0,
      blur: currentBlur,
      hasShadow: currentHasShadow,
      bgColor: typeof canvas.backgroundColor === 'string' ? canvas.backgroundColor : '#ffffff',
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

    return () => {
      canvas.off('selection:created', handler);
      canvas.off('selection:updated', handler);
      canvas.off('selection:cleared', handler);
      canvas.off('object:modified', handler);
      canvas.off('object:scaling', handler);
    };
  }, [canvas, refreshProps]);

  function updateProp(key: string, value: any) {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) {
      if (key === 'bgColor') {
        canvas.set({ backgroundColor: value });
        canvas.renderAll();
        canvas.fire('object:modified');
        setProps((prev) => ({ ...prev, bgColor: value }));
      }
      return;
    }

    obj.set(key as keyof fabric.FabricObject, value);
    canvas.renderAll();
    canvas.fire('object:modified');
    refreshProps();
  }

  // Corner radius for images using ClipPath
  const updateImageCornerRadius = (radius: number) => {
    if (!canvas || !selected) return;
    const obj = selected as fabric.FabricObject;
    if (obj.type === 'image' || obj.type === 'fabricImage') {
      const img = obj as fabric.FabricImage;
      if (radius === 0) {
        img.set({ clipPath: undefined });
      } else {
        const clipPath = new FabricImport.Rect({
          width: img.width,
          height: img.height,
          rx: radius,
          ry: radius,
          originX: 'center',
          originY: 'center',
        });
        img.set({ clipPath });
      }
      canvas.renderAll();
      canvas.fire('object:modified');
      setProps((prev) => ({ ...prev, rx: radius }));
    }
  };

  // Image blur filter
  const updateImageBlur = (blurVal: number) => {
    if (!canvas || !selected) return;
    const img = selected as fabric.FabricImage;
    if (img.type === 'image' || img.type === 'fabricImage') {
      if (!img.filters) img.filters = [];
      
      // Remove existing blur filter
      img.filters = img.filters.filter((f) => f && f.type !== 'Blur');
      
      if (blurVal > 0) {
        // In fabric v6, filters are instantiated like this
        const blurFilter = new FabricImport.filters.Blur({ blur: blurVal });
        img.filters.push(blurFilter);
      }
      img.applyFilters();
      canvas.renderAll();
      canvas.fire('object:modified');
      setProps((prev) => ({ ...prev, blur: blurVal }));
    }
  };

  // Image Drop shadow
  const toggleImageShadow = (enabled: boolean) => {
    if (!canvas || !selected) return;
    if (enabled) {
      const shadow = new FabricImport.Shadow({
        color: 'rgba(0, 0, 0, 0.25)',
        blur: 15,
        offsetX: 6,
        offsetY: 6,
      });
      selected.set({ shadow });
    } else {
      selected.set({ shadow: undefined });
    }
    canvas.renderAll();
    canvas.fire('object:modified');
    setProps((prev) => ({ ...prev, hasShadow: enabled }));
  };

  const handleRemoveBg = () => {
    setBgModalOpen(true);
  };

  const handleCrop = () => {
    setCropModalOpen(true);
  };

  const isText =
    selected &&
    (selected.type === 'i-text' ||
      selected.type === 'text' ||
      selected.type === 'textbox' ||
      (selected as any).text !== undefined);
  const isRect = selected?.type === 'rect';
  const isImage = selected?.type === 'image' || selected?.type === 'fabricImage';

  // Render contextual controls
  return (
    <div className="h-12 border-b border-[var(--color-border)] bg-white px-4 flex items-center justify-between text-sm select-none z-10 shrink-0">
      {/* Selection Specific Controls */}
      <div className="flex items-center gap-4 overflow-x-auto py-1">
        {!selected ? (
          /* CANVAS SETTINGS (Nothing selected) */
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Canvas
            </span>
            <div className="h-4 w-[1px] bg-[var(--color-border)]" />
            
            {/* BG Color Picker */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[var(--color-text-secondary)]">Fill</span>
              <input
                type="color"
                value={props.bgColor}
                onChange={(e) => updateProp('bgColor', e.target.value)}
                className="w-6 h-6 rounded border border-[var(--color-border)] cursor-pointer p-0"
              />
              <input
                type="text"
                value={bgInput}
                onChange={(e) => {
                  setBgInput(e.target.value);
                  if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                    updateProp('bgColor', e.target.value);
                  }
                }}
                className="w-16 h-7 text-xs border border-[var(--color-border)] rounded px-1 text-center"
              />
            </div>
            
            <div className="h-4 w-[1px] bg-[var(--color-border)]" />
            <span className="text-xs text-[var(--color-text-secondary)] font-mono">
              Size: {canvas?.getWidth() ? Math.round(canvas.getWidth() / zoom) : 1080} ×{' '}
              {canvas?.getHeight() ? Math.round(canvas.getHeight() / zoom) : 1080} px
            </span>
          </div>
        ) : isText ? (
          /* TEXT CONTROLS */
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Text
            </span>
            <div className="h-4 w-[1px] bg-[var(--color-border)]" />

            {/* Font Family */}
            <select
              value={props.fontFamily}
              onChange={(e) => updateProp('fontFamily', e.target.value)}
              className="h-7 border border-[var(--color-border)] rounded px-2 text-xs bg-[var(--color-bg)]"
            >
              <option value="DM Sans">DM Sans</option>
              <option value="Playfair Display">Playfair</option>
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Georgia">Georgia</option>
              <option value="Courier New">Courier</option>
            </select>

            {/* Font Size */}
            <div className="flex items-center border border-[var(--color-border)] rounded overflow-hidden h-7">
              <button
                onClick={() => updateProp('fontSize', Math.max(8, props.fontSize - 2))}
                className="w-7 h-full flex items-center justify-center hover:bg-[var(--color-bg)] cursor-pointer"
              >
                -
              </button>
              <input
                type="number"
                value={props.fontSize}
                onChange={(e) => updateProp('fontSize', parseInt(e.target.value) || 12)}
                className="w-10 text-center h-full border-none text-xs p-0 bg-white focus:outline-none"
              />
              <button
                onClick={() => updateProp('fontSize', props.fontSize + 2)}
                className="w-7 h-full flex items-center justify-center hover:bg-[var(--color-bg)] cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Text Color */}
            <input
              type="color"
              value={props.fill}
              onChange={(e) => updateProp('fill', e.target.value)}
              className="w-7 h-7 rounded border border-[var(--color-border)] cursor-pointer p-0"
              title="Text Color"
            />

            {/* Text Style Toggles */}
            <div className="flex items-center border border-[var(--color-border)] rounded h-7 overflow-hidden">
              <button
                onClick={() => {
                  const val = (selected as any).fontWeight === 'bold' ? 'normal' : 'bold';
                  updateProp('fontWeight', val);
                }}
                className={`w-7 h-full flex items-center justify-center text-xs font-bold hover:bg-[var(--color-bg)] cursor-pointer ${
                  (selected as any).fontWeight === 'bold' ? 'bg-[var(--color-border)]' : ''
                }`}
              >
                <Bold size={13} />
              </button>
              <button
                onClick={() => {
                  const val = (selected as any).fontStyle === 'italic' ? 'normal' : 'italic';
                  updateProp('fontStyle', val);
                }}
                className={`w-7 h-full flex items-center justify-center text-xs italic hover:bg-[var(--color-bg)] cursor-pointer ${
                  (selected as any).fontStyle === 'italic' ? 'bg-[var(--color-border)]' : ''
                }`}
              >
                <Italic size={13} />
              </button>
              <button
                onClick={() => {
                  const val = !(selected as any).underline;
                  updateProp('underline', val);
                }}
                className={`w-7 h-full flex items-center justify-center text-xs underline hover:bg-[var(--color-bg)] cursor-pointer ${
                  (selected as any).underline ? 'bg-[var(--color-border)]' : ''
                }`}
              >
                <Underline size={13} />
              </button>
            </div>

            {/* Text Align */}
            <div className="flex items-center border border-[var(--color-border)] rounded h-7 overflow-hidden">
              {(['left', 'center', 'right'] as const).map((align) => {
                const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight;
                return (
                  <button
                    key={align}
                    onClick={() => updateProp('textAlign', align)}
                    className={`w-7 h-full flex items-center justify-center hover:bg-[var(--color-bg)] cursor-pointer ${
                      props.textAlign === align ? 'bg-[var(--color-border)]' : ''
                    }`}
                  >
                    <Icon size={13} />
                  </button>
                );
              })}
            </div>

            {/* Opacity */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-secondary)]">Opacity</span>
              <input
                type="range"
                min={0}
                max={100}
                value={props.opacity}
                onChange={(e) => updateProp('opacity', parseInt(e.target.value) / 100)}
                className="w-16 h-1 accent-[var(--color-accent)]"
              />
              <span className="text-xs font-mono w-7 text-right">{props.opacity}%</span>
            </div>
          </div>
        ) : isImage ? (
          /* IMAGE CONTROLS */
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Image
            </span>
            <div className="h-4 w-[1px] bg-[var(--color-border)]" />

            {/* Remove BG */}
            <button
              onClick={handleRemoveBg}
              className="h-7 px-2.5 rounded border border-[var(--color-border)] bg-violet-50 text-violet-700 text-xs font-medium flex items-center gap-1.5 hover:bg-violet-100 transition-colors cursor-pointer"
            >
              <Sparkles size={12} />
              Remove BG
            </button>

            {/* Crop */}
            <button
              onClick={handleCrop}
              className="h-7 px-2.5 rounded border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] text-xs font-medium flex items-center gap-1.5 hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
            >
              <Crop size={12} />
              Crop
            </button>

            <div className="h-4 w-[1px] bg-[var(--color-border)]" />

            {/* Corner Radius */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-secondary)]">Radius</span>
              <input
                type="range"
                min={0}
                max={100}
                value={props.rx}
                onChange={(e) => updateImageCornerRadius(parseInt(e.target.value))}
                className="w-16 h-1 accent-[var(--color-accent)]"
              />
              <span className="text-xs font-mono w-6 text-right">{props.rx}px</span>
            </div>

            {/* Blur */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-secondary)]">Blur</span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={Math.round(props.blur * 100)}
                onChange={(e) => updateImageBlur(parseInt(e.target.value) / 100)}
                className="w-16 h-1 accent-[var(--color-accent)]"
              />
              <span className="text-xs font-mono w-6 text-right">
                {Math.round(props.blur * 100)}%
              </span>
            </div>

            {/* Shadow Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={props.hasShadow}
                onChange={(e) => toggleImageShadow(e.target.checked)}
                className="rounded text-[var(--color-accent)] focus:ring-0"
              />
              <span className="text-xs text-[var(--color-text-secondary)]">Shadow</span>
            </label>

            {/* Opacity */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-secondary)]">Opacity</span>
              <input
                type="range"
                min={0}
                max={100}
                value={props.opacity}
                onChange={(e) => updateProp('opacity', parseInt(e.target.value) / 100)}
                className="w-16 h-1 accent-[var(--color-accent)]"
              />
              <span className="text-xs font-mono w-7 text-right">{props.opacity}%</span>
            </div>
          </div>
        ) : (
          /* SHAPE CONTROLS */
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Shape
            </span>
            <div className="h-4 w-[1px] bg-[var(--color-border)]" />

            {/* Fill Color */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[var(--color-text-secondary)]">Fill</span>
              <input
                type="color"
                value={props.fill}
                onChange={(e) => updateProp('fill', e.target.value)}
                className="w-6 h-6 rounded border border-[var(--color-border)] cursor-pointer p-0"
              />
            </div>

            {/* Stroke Color & Width */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[var(--color-text-secondary)]">Stroke</span>
              <input
                type="color"
                value={props.stroke || '#000000'}
                onChange={(e) => updateProp('stroke', e.target.value)}
                className="w-6 h-6 rounded border border-[var(--color-border)] cursor-pointer p-0"
              />
              <input
                type="number"
                value={props.strokeWidth}
                min={0}
                max={20}
                onChange={(e) => updateProp('strokeWidth', parseInt(e.target.value) || 0)}
                className="w-10 h-7 text-xs border border-[var(--color-border)] rounded px-1 text-center"
              />
            </div>

            {isRect && (
              /* Corner Radius for Rect */
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-text-secondary)]">Radius</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={props.rx}
                  onChange={(e) => {
                    const r = parseInt(e.target.value) || 0;
                    updateProp('rx', r);
                    updateProp('ry', r);
                  }}
                  className="w-16 h-1 accent-[var(--color-accent)]"
                />
                <span className="text-xs font-mono w-6 text-right">{props.rx}px</span>
              </div>
            )}

            {/* Opacity */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-secondary)]">Opacity</span>
              <input
                type="range"
                min={0}
                max={100}
                value={props.opacity}
                onChange={(e) => updateProp('opacity', parseInt(e.target.value) / 100)}
                className="w-16 h-1 accent-[var(--color-accent)]"
              />
              <span className="text-xs font-mono w-7 text-right">{props.opacity}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Global Canvas actions (Fit + Undo/Redo) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Zoom Fit */}
        <button
          onClick={fitToScreen}
          className="h-8 w-8 rounded-lg flex items-center justify-center border border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors cursor-pointer text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          title="Zoom to fit screen"
        >
          <Maximize size={14} />
        </button>

        <div className="w-[1px] h-4 bg-[var(--color-border)] mx-1" />

        {/* Undo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className="h-8 w-8 rounded-lg flex items-center justify-center border border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={14} />
        </button>

        {/* Redo */}
        <button
          onClick={redo}
          disabled={!canRedo}
          className="h-8 w-8 rounded-lg flex items-center justify-center border border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 size={14} />
        </button>
      </div>

      {/* Modals */}
      <PauseBgModal open={bgModalOpen} onClose={() => setBgModalOpen(false)} />
      {selected && (selected.type === 'image' || selected.type === 'fabricImage') && (
        <CropModal
          open={cropModalOpen}
          onClose={() => setCropModalOpen(false)}
          imageObject={selected as fabric.FabricImage}
          canvas={canvas}
        />
      )}
    </div>
  );
}
