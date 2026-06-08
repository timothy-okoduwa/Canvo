'use client';

import { type ReactNode, useState, useRef } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

export default function Tooltip({
  content,
  children,
  position = 'right',
}: TooltipProps) {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const positionStyles: Record<string, React.CSSProperties> = {
    top: {
      bottom: 'calc(100% + 8px)',
      left: '50%',
      transform: 'translateX(-50%)',
    },
    right: {
      left: 'calc(100% + 8px)',
      top: '50%',
      transform: 'translateY(-50%)',
    },
    bottom: {
      top: 'calc(100% + 8px)',
      left: '50%',
      transform: 'translateX(-50%)',
    },
    left: {
      right: 'calc(100% + 8px)',
      top: '50%',
      transform: 'translateY(-50%)',
    },
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => {
        timeoutRef.current = setTimeout(() => setShow(true), 400);
      }}
      onMouseLeave={() => {
        clearTimeout(timeoutRef.current);
        setShow(false);
      }}
    >
      {children}
      {show && (
        <div
          className="absolute z-[100] whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium pointer-events-none animate-fade-in"
          style={{
            ...positionStyles[position],
            background: 'var(--color-text-primary)',
            color: 'var(--color-surface)',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}
