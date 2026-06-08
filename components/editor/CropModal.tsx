'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import type * as fabric from 'fabric';
import { RotateCw, X } from 'lucide-react';

interface CropModalProps {
  open: boolean;
  onClose: () => void;
  imageObject: fabric.FabricImage | null;
  canvas: fabric.Canvas | null;
}

interface CropBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const PRESETS = [
  { name: 'Original', ratio: -1 },
  { name: 'Free', ratio: 0 },
  { name: '1:1', ratio: 1 },
  { name: '16:9', ratio: 16 / 9 },
  { name: '9:16', ratio: 9 / 16 },
  { name: '4:5', ratio: 4 / 5 },
  { name: '5:4', ratio: 5 / 4 },
  { name: '3:2', ratio: 3 / 2 },
  { name: '4:3', ratio: 4 / 3 },
];

export default function CropModal({ open, onClose, imageObject, canvas }: CropModalProps) {
  const [imgUrl, setImgUrl] = useState('');
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [dispSize, setDispSize] = useState({ w: 0, h: 0 });
  const [cropBox, setCropBox] = useState<CropBox>({ x: 0, y: 0, w: 0, h: 0 });
  const [preset, setPreset] = useState('Free');
  const [rotation, setRotation] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<string | null>(null); // 'move' | handle name
  const [startMouse, setStartMouse] = useState({ x: 0, y: 0 });
  const [startBox, setStartBox] = useState<CropBox>({ x: 0, y: 0, w: 0, h: 0 });

  // Load image details
  useEffect(() => {
    if (!open || !imageObject) return;

    const el = imageObject.getElement() as HTMLImageElement;
    if (el) {
      setImgUrl(el.src);
      const nw = el.naturalWidth || el.width;
      const nh = el.naturalHeight || el.height;
      setNaturalSize({ w: nw, h: nh });

      // Determine fit size
      const maxW = 560;
      const maxH = 360;
      const aspect = nw / nh;
      let dw = nw;
      let dh = nh;

      if (dw > maxW) {
        dw = maxW;
        dh = maxW / aspect;
      }
      if (dh > maxH) {
        dh = maxH;
        dw = maxH * aspect;
      }

      setDispSize({ w: dw, h: dh });

      // Load existing crop coords or full dimensions
      const scale = dw / nw;
      const cropX = imageObject.cropX || 0;
      const cropY = imageObject.cropY || 0;
      const cropW = imageObject.width || nw;
      const cropH = imageObject.height || nh;

      setCropBox({
        x: cropX * scale,
        y: cropY * scale,
        w: cropW * scale,
        h: cropH * scale,
      });

      setPreset('Free');
      setRotation(imageObject.angle || 0);
    }
  }, [open, imageObject]);

  // Set preset ratio
  const handlePresetSelect = (name: string, ratio: number) => {
    setPreset(name);
    if (ratio === 0) return; // Free form

    let actualRatio = ratio;
    if (ratio === -1) {
      actualRatio = naturalSize.w / naturalSize.h; // Original
    }

    // Centered crop box fitting the aspect ratio
    let nw = dispSize.w;
    let nh = dispSize.w / actualRatio;

    if (nh > dispSize.h) {
      nh = dispSize.h;
      nw = dispSize.h * actualRatio;
    }

    const nx = (dispSize.w - nw) / 2;
    const ny = (dispSize.h - nh) / 2;

    setCropBox({ x: nx, y: ny, w: nw, h: nh });
  };

  const handleMouseDown = (e: React.MouseEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragType(type);
    setStartMouse({ x: e.clientX, y: e.clientY });
    setStartBox({ ...cropBox });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startMouse.x;
      const dy = e.clientY - startMouse.y;

      let newX = startBox.x;
      let newY = startBox.y;
      let newW = startBox.w;
      let newH = startBox.h;

      // Current locked ratio
      const activePreset = PRESETS.find((p) => p.name === preset);
      const lockedRatio =
        activePreset && activePreset.ratio !== 0
          ? activePreset.ratio === -1
            ? naturalSize.w / naturalSize.h
            : activePreset.ratio
          : null;

      if (dragType === 'move') {
        newX = Math.max(0, Math.min(dispSize.w - startBox.w, startBox.x + dx));
        newY = Math.max(0, Math.min(dispSize.h - startBox.h, startBox.y + dy));
      } else {
        // Edge/Corner Resizing
        if (dragType?.includes('right')) {
          newW = Math.max(30, Math.min(dispSize.w - startBox.x, startBox.w + dx));
        }
        if (dragType?.includes('bottom')) {
          newH = Math.max(30, Math.min(dispSize.h - startBox.y, startBox.h + dy));
        }
        if (dragType?.includes('left')) {
          const possibleX = startBox.x + dx;
          if (possibleX >= 0 && possibleX <= startBox.x + startBox.w - 30) {
            newX = possibleX;
            newW = startBox.w - dx;
          }
        }
        if (dragType?.includes('top')) {
          const possibleY = startBox.y + dy;
          if (possibleY >= 0 && possibleY <= startBox.y + startBox.h - 30) {
            newY = possibleY;
            newH = startBox.h - dy;
          }
        }

        // Apply aspect ratio locks
        if (lockedRatio) {
          if (dragType === 'bottom-right' || dragType === 'right' || dragType === 'bottom') {
            newH = newW / lockedRatio;
            if (newY + newH > dispSize.h) {
              newH = dispSize.h - newY;
              newW = newH * lockedRatio;
            }
          } else if (dragType === 'bottom-left' || dragType === 'left') {
            newH = newW / lockedRatio;
            if (newY + newH > dispSize.h) {
              newH = dispSize.h - newY;
              newW = newH * lockedRatio;
              newX = startBox.x + (startBox.w - newW);
            }
          } else if (dragType === 'top-right' || dragType === 'top') {
            newW = newH * lockedRatio;
            if (startBox.x + newW > dispSize.w) {
              newW = dispSize.w - startBox.x;
              newH = newW / lockedRatio;
              newY = startBox.y + (startBox.h - newH);
            } else {
              newY = startBox.y + (startBox.h - newH);
            }
          } else if (dragType === 'top-left') {
            newW = newH * lockedRatio;
            if (newX < 0) {
              newW = (startBox.x + startBox.w);
              newH = newW / lockedRatio;
              newX = 0;
              newY = startBox.y + (startBox.h - newH);
            } else {
              newX = startBox.x + (startBox.w - newW);
              newY = startBox.y + (startBox.h - newH);
            }
          }
        }
      }

      setCropBox({
        x: Math.max(0, newX),
        y: Math.max(0, newY),
        w: Math.max(30, newW),
        h: Math.max(30, newH),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragType(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragType, startMouse, startBox, dispSize, preset, naturalSize]);

  // Apply crop coordinates
  const handleApplyCrop = () => {
    if (!imageObject || !canvas) return;

    const scale = naturalSize.w / dispSize.w;
    const newCropX = cropBox.x * scale;
    const newCropY = cropBox.y * scale;
    const newCropW = cropBox.w * scale;
    const newCropH = cropBox.h * scale;

    const oldCropX = imageObject.cropX || 0;
    const oldCropY = imageObject.cropY || 0;

    const diffX = newCropX - oldCropX;
    const diffY = newCropY - oldCropY;

    // Calculate canvas shift for rotation-aware cropping
    const angleRad = (imageObject.angle || 0) * (Math.PI / 180);
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    const deltaLeft = diffX * imageObject.scaleX * cos - diffY * imageObject.scaleY * sin;
    const deltaTop = diffX * imageObject.scaleX * sin + diffY * imageObject.scaleY * cos;

    imageObject.set({
      left: (imageObject.left || 0) + deltaLeft,
      top: (imageObject.top || 0) + deltaTop,
      cropX: newCropX,
      cropY: newCropY,
      width: newCropW,
      height: newCropH,
      angle: rotation,
    });

    canvas.renderAll();
    canvas.fire('object:modified');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="880px">
      <div className="bg-white rounded-3xl overflow-hidden flex flex-col h-[640px] border border-neutral-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 select-none">
          <h2 className="text-lg font-bold text-neutral-900">Crop image</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 flex flex-col bg-[#F3F4F6] p-6 relative overflow-hidden select-none">
          {/* Aspect Ratios selection */}
          <div className="mb-4">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
              Aspect Ratio
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => handlePresetSelect(p.name, p.ratio)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    preset === p.name
                      ? 'border-neutral-900 bg-neutral-950 text-white'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Main Cropping Area */}
          <div className="flex-1 flex items-center justify-center bg-neutral-800 rounded-2xl relative overflow-hidden shadow-inner p-4">
            <div
              ref={containerRef}
              className="relative shadow-md"
              style={{
                width: dispSize.w,
                height: dispSize.h,
                transform: `rotate(${rotation - (imageObject?.angle || 0)}deg)`,
                transition: 'transform 0.1s ease-out',
              }}
            >
              {/* Loaded Image */}
              {imgUrl && (
                <img
                  ref={imageRef}
                  src={imgUrl}
                  crossOrigin="anonymous"
                  alt="Crop preview"
                  className="w-full h-full object-cover rounded-sm pointer-events-none select-none"
                  draggable={false}
                />
              )}

              {/* Crop box guidelines & borders */}
              <div
                className="absolute border-2 border-white cursor-move z-20 shadow-2xl"
                style={{
                  left: cropBox.x,
                  top: cropBox.y,
                  width: cropBox.w,
                  height: cropBox.h,
                }}
                onMouseDown={(e) => handleMouseDown(e, 'move')}
              >
                {/* Rule of Thirds guidelines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30 pointer-events-none">
                  <div className="border-r border-b border-white border-dashed" />
                  <div className="border-r border-b border-white border-dashed" />
                  <div className="border-b border-white border-dashed" />
                  <div className="border-r border-b border-white border-dashed" />
                  <div className="border-r border-b border-white border-dashed" />
                  <div className="border-b border-white border-dashed" />
                  <div className="border-r border-white border-dashed" />
                  <div className="border-r border-white border-dashed" />
                  <div className="border-none" />
                </div>

                {/* Corners handles */}
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'top-left')}
                  className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-neutral-600 rounded-full cursor-nwse-resize hover:scale-125 transition-transform"
                />
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'top-right')}
                  className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-neutral-600 rounded-full cursor-nesw-resize hover:scale-125 transition-transform"
                />
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}
                  className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-neutral-600 rounded-full cursor-nesw-resize hover:scale-125 transition-transform"
                />
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
                  className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-neutral-600 rounded-full cursor-nwse-resize hover:scale-125 transition-transform"
                />

                {/* Edges handles */}
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'top')}
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-white border border-neutral-500 rounded-full cursor-ns-resize"
                />
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'bottom')}
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-white border border-neutral-500 rounded-full cursor-ns-resize"
                />
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'left')}
                  className="absolute top-1/2 -translate-y-1/2 -left-1 w-1.5 h-6 bg-white border border-neutral-500 rounded-full cursor-ew-resize"
                />
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'right')}
                  className="absolute top-1/2 -translate-y-1/2 -right-1 w-1.5 h-6 bg-white border border-neutral-500 rounded-full cursor-ew-resize"
                />
              </div>

              {/* Shading/dimming overlays */}
              <div
                className="absolute bg-black/40 z-10 pointer-events-none"
                style={{ top: 0, left: 0, width: dispSize.w, height: cropBox.y }}
              />
              <div
                className="absolute bg-black/40 z-10 pointer-events-none"
                style={{
                  top: cropBox.y + cropBox.h,
                  left: 0,
                  width: dispSize.w,
                  height: dispSize.h - (cropBox.y + cropBox.h),
                }}
              />
              <div
                className="absolute bg-black/40 z-10 pointer-events-none"
                style={{ top: cropBox.y, left: 0, width: cropBox.x, height: cropBox.h }}
              />
              <div
                className="absolute bg-black/40 z-10 pointer-events-none"
                style={{
                  top: cropBox.y,
                  left: cropBox.x + cropBox.w,
                  width: dispSize.w - (cropBox.x + cropBox.w),
                  height: cropBox.h,
                }}
              />
            </div>
          </div>

          {/* Slider for rotation */}
          <div className="mt-4 flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-neutral-200/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500">Image rotation</span>
              <input
                type="range"
                min={-180}
                max={180}
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value) || 0)}
                className="w-48 accent-neutral-900"
              />
              <span className="text-xs font-mono font-bold w-12 text-center">{rotation}°</span>
            </div>
            <button
              onClick={() => setRotation(imageObject?.angle || 0)}
              className="text-xs text-neutral-600 hover:text-neutral-900 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCw size={12} /> Reset
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-neutral-100 select-none">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleApplyCrop} className="font-bold">
            ✓ Apply crop
          </Button>
        </div>
      </div>
    </Modal>
  );
}
