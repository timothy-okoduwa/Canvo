'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import type * as fabric from 'fabric';
import Panel from '@/components/editor/Panel';
import { saveUpload, getAllUploads, type UploadedImage } from '@/lib/db';
import { addImageFromURL } from '@/lib/fabric-utils';

interface UploadsPanelProps {
  canvas: fabric.Canvas | null;
  onClose: () => void;
}

export default function UploadsPanel({ canvas, onClose }: UploadsPanelProps) {
  const [uploads, setUploads] = useState<UploadedImage[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadUploads = useCallback(async () => {
    const all = await getAllUploads();
    setUploads(all);
  }, []);

  useEffect(() => {
    loadUploads();
  }, [loadUploads]);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        const upload: UploadedImage = {
          id: uuid(),
          name: file.name,
          dataUrl,
          createdAt: Date.now(),
        };
        await saveUpload(upload);
        await loadUploads();
      };
      reader.readAsDataURL(file);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  async function handleAddToCanvas(dataUrl: string) {
    if (!canvas) return;
    await addImageFromURL(canvas, dataUrl);
  }

  return (
    <Panel title="Uploads" onClose={onClose}>
      {/* Drop zone */}
      <div
        className={`drop-zone ${dragging ? 'dragging' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 opacity-50">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="text-sm">Drop files here or click to upload</p>
        <p className="text-xs mt-1 opacity-60">PNG, JPG, SVG, WebP</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {/* Uploaded images grid */}
      {uploads.length > 0 && (
        <div className="panel-grid-2">
          {uploads.map((img) => (
            <button
              key={img.id}
              onClick={() => handleAddToCanvas(img.dataUrl)}
              className="aspect-square rounded-lg overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors cursor-pointer bg-[var(--color-bg)]"
            >
              <img
                src={img.dataUrl}
                alt={img.name}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </Panel>
  );
}
