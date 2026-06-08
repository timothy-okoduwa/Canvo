// ============================================================
// Canvo — Core Types
// ============================================================

/** A design file persisted in IndexedDB */
export interface CanvoFile {
  id: string;
  name: string;
  width: number;
  height: number;
  /** base64 PNG thumbnail for the file card preview */
  thumbnail: string;
  /** JSON.stringify(canvas.toJSON()) — the full Fabric.js state */
  fabricJson: string;
  /** Array of fabric JSON states for multi-page support */
  pages?: string[];
  createdAt: number;
  updatedAt: number;
}

/** A canvas size preset shown in the NewCanvasModal */
export interface CanvasPreset {
  name: string;
  category: 'general' | 'presentation' | 'print' | 'social';
  width: number;
  height: number;
}

/** Category metadata for grouping presets */
export const CATEGORY_META: Record<
  CanvasPreset['category'],
  { label: string; color: string }
> = {
  general: { label: 'General', color: '#4A90D9' },
  presentation: { label: 'Presentation', color: '#4A90D9' },
  print: { label: 'Print', color: '#4CAF50' },
  social: { label: 'Social media', color: '#E8715A' },
};

/** The 9 curated presets (matching Avnac's set) */
export const PRESETS: CanvasPreset[] = [
  { name: 'Large square (4000)', category: 'general', width: 4000, height: 4000 },
  { name: 'HD (1920×1080)', category: 'presentation', width: 1920, height: 1080 },
  { name: 'Print A4 @300dpi', category: 'print', width: 2480, height: 3508 },
  { name: 'Instagram square (1080)', category: 'social', width: 1080, height: 1080 },
  { name: 'Instagram portrait (1080×1350)', category: 'social', width: 1080, height: 1350 },
  { name: 'Story / Reels (1080×1920)', category: 'social', width: 1080, height: 1920 },
  { name: 'X / Twitter post (1200×675)', category: 'social', width: 1200, height: 675 },
  { name: 'LinkedIn share (1200×627)', category: 'social', width: 1200, height: 627 },
  { name: 'YouTube thumbnail (1280×720)', category: 'social', width: 1280, height: 720 },
];

/** Sidebar panel identifiers */
export type PanelId = 'layers' | 'uploads' | 'images' | 'icons' | 'vectors' | 'apps';

/** Shape types available in the bottom toolbar */
export type ShapeType = 'rect' | 'circle' | 'triangle' | 'line' | 'arrow' | 'star';

/** Layer representation for the layers panel */
export interface LayerItem {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
}
