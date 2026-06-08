'use client';

import { useEffect } from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import type * as fabric from 'fabric';
import { Plus, Copy, Trash2 } from 'lucide-react';

interface CanvasPageProps {
  pageIndex: number;
  initialJson: string;
  width: number;
  height: number;
  zoom: number;
  isActive: boolean;
  onActivate: () => void;
  onUpdate: (json: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAddPage: () => void;
  registerCanvas: (canvas: fabric.Canvas) => void;
  unregisterCanvas: () => void;
  deleteDisabled: boolean;
  setPageControls: (controls: { undo: () => void; redo: () => void; canUndo: boolean; canRedo: boolean } | null) => void;
}

export default function CanvasPage({
  pageIndex,
  initialJson,
  width,
  height,
  zoom,
  isActive,
  onActivate,
  onUpdate,
  onDuplicate,
  onDelete,
  onAddPage,
  registerCanvas,
  unregisterCanvas,
  deleteDisabled,
  setPageControls,
}: CanvasPageProps) {
  const { canvasRef, fabricCanvas, undo, redo, canUndo, canRedo } = useCanvas({
    initialJson,
    canvasWidth: width,
    canvasHeight: height,
    zoom,
    onModified: onUpdate,
    onActivate,
    registerCanvas,
    unregisterCanvas,
  });

  // ✅ Sync controls to parent only when values actually change
  useEffect(() => {
    if (isActive) {
      setPageControls({ undo, redo, canUndo, canRedo });
    } else {
      setPageControls(null);
    }
  }, [isActive, undo, redo, canUndo, canRedo]);

  return (
    <div
      onClick={onActivate}
      className={`flex flex-col gap-2 group transition-all duration-200 select-none ${isActive ? 'scale-[1.002]' : 'opacity-85 hover:opacity-100'
        }`}
      style={{ width: width * zoom }}
    >
      {/* Page Header Toolbar */}
      <div className="flex items-center justify-between px-1 h-8 select-none">
        <span className="text-[13px] font-semibold text-neutral-500 group-hover:text-neutral-800 transition-colors">
          Page {pageIndex + 1}
        </span>
        <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-neutral-200/60 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
            title="Duplicate Page"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            disabled={deleteDisabled}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 text-neutral-500 hover:text-red-500 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-500 transition-colors cursor-pointer"
            title="Delete Page"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAddPage(); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-neutral-200/60 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
            title="Add Page Below"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Canvas Wrapper */}
      <div
        className={`relative bg-white border rounded-xl overflow-hidden transition-all duration-300 ${isActive
            ? 'border-neutral-400 shadow-xl shadow-neutral-300/60'
            : 'border-neutral-200/60 shadow-md shadow-neutral-200/40'
          }`}
        style={{ width: width * zoom, height: height * zoom }}
      >
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      </div>
    </div>
  );
}