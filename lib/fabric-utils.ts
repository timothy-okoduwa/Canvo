// ============================================================
// Canvo — Fabric.js Utility Functions
// Fabric.js v6 API (ESM, class-based)
// ============================================================

import * as fabric from 'fabric';

// ── Add objects ──────────────────────────────────────────────

export function addText(canvas: fabric.Canvas) {
  const text = new fabric.IText('Edit me', {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 40,
    fill: '#1A1A18',
    left: canvas.getWidth() / 2 - 80,
    top: canvas.getHeight() / 2 - 20,
  });
  canvas.add(text);
  canvas.setActiveObject(text);
  canvas.renderAll();
  return text;
}

export function addShape(
  canvas: fabric.Canvas,
  type: 'rect' | 'circle' | 'triangle' | 'line' | 'arrow' | 'star'
) {
  const centerX = canvas.getWidth() / 2 - 100;
  const centerY = canvas.getHeight() / 2 - 100;

  let obj: fabric.FabricObject;

  switch (type) {
    case 'rect':
      obj = new fabric.Rect({
        width: 200,
        height: 200,
        fill: '#E8715A',
        rx: 12,
        ry: 12,
        left: centerX,
        top: centerY,
      });
      break;
    case 'circle':
      obj = new fabric.Circle({
        radius: 100,
        fill: '#4A90D9',
        left: centerX,
        top: centerY,
      });
      break;
    case 'triangle':
      obj = new fabric.Triangle({
        width: 200,
        height: 200,
        fill: '#4CAF50',
        left: centerX,
        top: centerY,
      });
      break;
    case 'line':
      obj = new fabric.Line([centerX, centerY + 100, centerX + 200, centerY + 100], {
        stroke: '#1A1A18',
        strokeWidth: 3,
      });
      break;
    case 'arrow': {
      // Arrow as a polygon
      const points = [
        { x: 0, y: 40 },
        { x: 150, y: 40 },
        { x: 150, y: 20 },
        { x: 200, y: 50 },
        { x: 150, y: 80 },
        { x: 150, y: 60 },
        { x: 0, y: 60 },
      ];
      obj = new fabric.Polygon(points, {
        fill: '#1A1A18',
        left: centerX,
        top: centerY,
      });
      break;
    }
    case 'star': {
      // 5-pointed star
      const starPoints: fabric.XY[] = [];
      const outerR = 100;
      const innerR = 45;
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        starPoints.push({
          x: r * Math.cos(angle) + outerR,
          y: r * Math.sin(angle) + outerR,
        });
      }
      obj = new fabric.Polygon(starPoints, {
        fill: '#FFD700',
        left: centerX,
        top: centerY,
      });
      break;
    }
    default:
      return;
  }

  canvas.add(obj);
  canvas.setActiveObject(obj);
  canvas.renderAll();
}

export function addImageFromURL(canvas: fabric.Canvas, url: string): Promise<fabric.FabricImage> {
  return new Promise((resolve, reject) => {
    const imgEl = new Image();
    imgEl.crossOrigin = 'anonymous';
    imgEl.onload = () => {
      const fabricImg = new fabric.FabricImage(imgEl, {
        left: 50,
        top: 50,
      });
      // Scale to fit reasonably
      const maxDim = Math.min(canvas.getWidth() * 0.6, 600);
      if (fabricImg.width && fabricImg.width > maxDim) {
        fabricImg.scaleToWidth(maxDim);
      }
      canvas.add(fabricImg);
      canvas.setActiveObject(fabricImg);
      canvas.renderAll();
      resolve(fabricImg);
    };
    imgEl.onerror = reject;
    imgEl.src = url;
  });
}

export function addImageFromFile(canvas: fabric.Canvas, file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      try {
        await addImageFromURL(canvas, dataUrl);
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function addSVGToCanvas(canvas: fabric.Canvas, svgString: string): Promise<void> {
  return new Promise((resolve) => {
    fabric.loadSVGFromString(svgString).then((result) => {
      const group = fabric.util.groupSVGElements(result.objects.filter(Boolean) as fabric.FabricObject[], result.options);
      group.set({
        left: canvas.getWidth() / 2 - (group.width || 100) / 2,
        top: canvas.getHeight() / 2 - (group.height || 100) / 2,
      });
      group.scaleToWidth(Math.min(200, canvas.getWidth() * 0.3));
      canvas.add(group);
      canvas.setActiveObject(group);
      canvas.renderAll();
      resolve();
    });
  });
}

// ── Selection operations ─────────────────────────────────────

export function deleteSelected(canvas: fabric.Canvas) {
  const active = canvas.getActiveObjects();
  if (active.length === 0) return;
  active.forEach((obj) => canvas.remove(obj));
  canvas.discardActiveObject();
  canvas.renderAll();
}

export function duplicateSelected(canvas: fabric.Canvas) {
  const active = canvas.getActiveObject();
  if (!active) return;
  active.clone().then((cloned: fabric.FabricObject) => {
    cloned.set({
      left: (cloned.left || 0) + 20,
      top: (cloned.top || 0) + 20,
    });
    canvas.add(cloned);
    canvas.setActiveObject(cloned);
    canvas.renderAll();
  });
}

let clipboard: fabric.FabricObject | null = null;

export function copySelected(canvas: fabric.Canvas) {
  const active = canvas.getActiveObject();
  if (!active) return;
  active.clone().then((cloned: fabric.FabricObject) => {
    clipboard = cloned;
  });
}

export function pasteFromClipboard(canvas: fabric.Canvas) {
  if (!clipboard) return;
  clipboard.clone().then((cloned: fabric.FabricObject) => {
    cloned.set({
      left: (cloned.left || 0) + 20,
      top: (cloned.top || 0) + 20,
    });
    canvas.add(cloned);
    canvas.setActiveObject(cloned);
    canvas.renderAll();
    // Move clipboard position for next paste
    if (clipboard) {
      clipboard.set({
        left: (clipboard.left || 0) + 20,
        top: (clipboard.top || 0) + 20,
      });
    }
  });
}

export function selectAll(canvas: fabric.Canvas) {
  const objs = canvas.getObjects();
  if (objs.length === 0) return;
  canvas.discardActiveObject();
  const selection = new fabric.ActiveSelection(objs, { canvas });
  canvas.setActiveObject(selection);
  canvas.renderAll();
}

export function groupSelected(canvas: fabric.Canvas) {
  const active = canvas.getActiveObject();
  if (!active) return;
  const type = active.type?.toLowerCase();
  if (type !== 'activeselection' && type !== 'active-selection') return;

  const objects = (active as fabric.ActiveSelection).getObjects();
  canvas.discardActiveObject();
  objects.forEach((obj) => {
    canvas.remove(obj);
  });

  const group = new fabric.Group(objects);
  canvas.add(group);
  canvas.setActiveObject(group);
  canvas.renderAll();
  canvas.fire('object:modified');
}

export function ungroupSelected(canvas: fabric.Canvas) {
  const active = canvas.getActiveObject();
  if (!active) return;
  const type = active.type?.toLowerCase();
  if (type !== 'group') return;

  const group = active as fabric.Group;
  const objects = group.removeAll();
  canvas.remove(group);
  objects.forEach((obj) => {
    canvas.add(obj);
  });

  const activeSelection = new fabric.ActiveSelection(objects, { canvas });
  canvas.setActiveObject(activeSelection);
  canvas.renderAll();
  canvas.fire('object:modified');
}

// ── Layer operations ─────────────────────────────────────────

export function moveLayerForward(canvas: fabric.Canvas) {
  const active = canvas.getActiveObject();
  if (!active) return;
  canvas.bringObjectForward(active);
  canvas.renderAll();
}

export function moveLayerBackward(canvas: fabric.Canvas) {
  const active = canvas.getActiveObject();
  if (!active) return;
  canvas.sendObjectBackwards(active);
  canvas.renderAll();
}

export function moveLayerToFront(canvas: fabric.Canvas) {
  const active = canvas.getActiveObject();
  if (!active) return;
  canvas.bringObjectToFront(active);
  canvas.renderAll();
}

export function moveLayerToBack(canvas: fabric.Canvas) {
  const active = canvas.getActiveObject();
  if (!active) return;
  canvas.sendObjectToBack(active);
  canvas.renderAll();
}
