'use client';

interface NewFileButtonProps {
  onClick: () => void;
}

export default function NewFileButton({ onClick }: NewFileButtonProps) {
  return (
    <button
      id="new-file-button"
      onClick={onClick}
      className="inline-flex items-center gap-0 bg-[var(--color-text-primary)] text-white rounded-full cursor-pointer hover:opacity-90 transition-opacity text-sm font-medium overflow-hidden"
    >
      <span className="px-4 py-2.5">New file</span>
      <span className="w-px h-5 bg-white/20" />
      <span className="px-3 py-2.5">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <path d="M5 1L9 4.5L5 8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" transform="rotate(90, 5, 4.5)" />
        </svg>
      </span>
    </button>
  );
}
