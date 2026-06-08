'use client';

import { useRef } from 'react';
import type * as fabric from 'fabric';

interface CanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  width: number;
  height: number;
  zoom: number;
}

export default function Canvas({ canvasRef, width, height, zoom }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="editor-canvas-area" ref={containerRef}>
      {/* Canvas wrapper — centers the artboard */}
      <div
        className="relative"
        style={{
          width: width * zoom,
          height: height * zoom,
          boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
        }}
      >
        <canvas
          ref={canvasRef}
          id="canvo-canvas"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      </div>
    </div>
  );
}
