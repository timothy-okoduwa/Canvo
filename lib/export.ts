// ============================================================
// Canvo — Export System
// Supports PNG, JPG, SVG, PDF
// ============================================================

import type { Canvas } from 'fabric';

function downloadDataURL(dataURL: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  downloadDataURL(url, filename);
  URL.revokeObjectURL(url);
}

export interface ExportOptions {
  format: 'png' | 'jpg' | 'svg' | 'pdf';
  quality?: number; // 0-1 for JPG
  scale?: number; // multiplier: 1, 2, 3
}

export async function exportCanvas(
  canvas: Canvas,
  filename: string,
  options: ExportOptions
) {
  const { format, quality = 1, scale = 1 } = options;

  if (format === 'png' || format === 'jpg') {
    const dataURL = canvas.toDataURL({
      format: format === 'jpg' ? 'jpeg' : 'png',
      quality,
      multiplier: scale,
    });
    downloadDataURL(dataURL, `${filename}.${format}`);
  }

  if (format === 'svg') {
    const svg = canvas.toSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    downloadBlob(blob, `${filename}.svg`);
  }

  if (format === 'pdf') {
    const { jsPDF } = await import('jspdf');
    const w = canvas.getWidth();
    const h = canvas.getHeight();
    const pdf = new jsPDF({
      orientation: w > h ? 'landscape' : 'portrait',
      unit: 'px',
      format: [w * scale, h * scale],
    });
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: scale,
    });
    pdf.addImage(dataURL, 'PNG', 0, 0, w * scale, h * scale);
    pdf.save(`${filename}.pdf`);
  }
}
