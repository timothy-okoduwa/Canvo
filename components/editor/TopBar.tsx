'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { updateFileName, getFile } from '@/lib/db';

interface TopBarProps {
  fileId: string;
  fileName: string;
  onFileNameChange: (name: string) => void;
  onExport: () => void;
}

export default function TopBar({
  fileId,
  fileName,
  onFileNameChange,
  onExport,
}: TopBarProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(fileName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(fileName);
  }, [fileName]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  async function handleSave() {
    const trimmed = name.trim() || 'Untitled';
    setEditing(false);
    if (trimmed !== fileName) {
      onFileNameChange(trimmed);
      await updateFileName(fileId, trimmed);
    }
  }

  return (
    <div className="editor-topbar">
      {/* Home button */}
      <button
        onClick={() => router.push('/')}
        className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg)] transition-colors cursor-pointer mr-3"
        aria-label="Back to files"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-[var(--color-border)] mr-3" />

      {/* File name */}
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') {
              setName(fileName);
              setEditing(false);
            }
          }}
          className="text-sm font-medium bg-transparent border-b-2 border-[var(--color-accent)] outline-none py-0.5 px-1 min-w-[120px]"
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] px-2 py-1 rounded-md transition-colors cursor-pointer truncate max-w-[240px]"
        >
          {fileName}
        </button>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Export button */}
      <button
        onClick={onExport}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export
      </button>
    </div>
  );
}
