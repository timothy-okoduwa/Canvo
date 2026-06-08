'use client';

import type { CanvoFile } from '@/types/canvas';
import FileCard from './FileCard';

interface FileGridProps {
  files: CanvoFile[];
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function FileGrid({
  files,
  onRename,
  onDuplicate,
  onDelete,
}: FileGridProps) {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        {/* Empty state illustration */}
        <div className="w-24 h-24 mb-6 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-1">
          No designs yet
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] text-center max-w-xs">
          Click &quot;New file&quot; to create your first design. It&apos;ll be saved right here in your browser.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          onRename={onRename}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
