'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { CanvoFile } from '@/types/canvas';

interface FileCardProps {
  file: CanvoFile;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function FileCard({
  file,
  onRename,
  onDuplicate,
  onDelete,
}: FileCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  // Focus input when renaming
  useEffect(() => {
    if (renaming) inputRef.current?.focus();
  }, [renaming]);

  function handleRenameSubmit() {
    if (newName.trim() && newName !== file.name) {
      onRename(file.id, newName.trim());
    }
    setRenaming(false);
  }

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) + ', ' + d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="file-card relative group" id={`file-card-${file.id}`}>
      {/* Thumbnail */}
      <div
        className="relative overflow-hidden bg-[var(--color-bg)] cursor-pointer"
        style={{ height: 230 }}
        onClick={() => router.push(`/editor/${file.id}`)}
      >
        {file.thumbnail ? (
          <img
            src={file.thumbnail}
            alt={file.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div
              className="rounded-md border border-[var(--color-border)]"
              style={{
                width: Math.min(120, file.width / 10),
                height: Math.min(160, file.height / 10),
                background: '#fff',
              }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {renaming ? (
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit();
              if (e.key === 'Escape') setRenaming(false);
            }}
            className="w-full text-[15px] font-semibold text-[var(--color-text-primary)] bg-transparent border-b border-[var(--color-accent)] outline-none pb-0.5"
          />
        ) : (
          <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)] truncate">
            {file.name}
          </h3>
        )}
        <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
          {file.width} × {file.height}px
        </p>
        <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5 font-mono">
          {formatDate(file.updatedAt)}
        </p>
      </div>

      {/* Menu button */}
      <div className="absolute top-3 right-3" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/80 backdrop-blur-sm border border-[var(--color-border)] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-white"
          aria-label="File options"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="8" cy="13" r="1.5" />
          </svg>
        </button>

        {menuOpen && (
          <div className="context-menu" style={{ top: '100%', right: 0, marginTop: 4 }}>
            <button
              onClick={() => {
                setMenuOpen(false);
                setRenaming(true);
                setNewName(file.name);
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
              Rename
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                onDuplicate(file.id);
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Duplicate
            </button>
            <button
              className="danger"
              onClick={() => {
                setMenuOpen(false);
                onDelete(file.id);
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
