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

// ── Advanced Text Effects ────────────────────────────────────

export type TextEffectType = 'none' | 'shadow' | 'glow' | 'stroke' | 'neon' | 'background';

export function applyTextEffect(
  canvas: fabric.Canvas,
  effect: TextEffectType,
  options?: { color?: string; width?: number; blur?: number; bg?: string }
) {
  const active = canvas.getActiveObject();
  if (!active || !(active instanceof fabric.IText || active instanceof fabric.Textbox || active instanceof fabric.Text)) {
    return;
  }

  const { color = '#000000', width = 2, blur = 10, bg = '#FFD700' } = options || {};

  switch (effect) {
    case 'shadow':
      active.set({
        shadow: new fabric.Shadow({
          color: color || 'rgba(0,0,0,0.4)',
          blur: blur || 8,
          offsetX: 4,
          offsetY: 4,
        }),
      });
      break;
    case 'glow':
      active.set({
        shadow: new fabric.Shadow({
          color: color || '#E8715A',
          blur: blur || 20,
          offsetX: 0,
          offsetY: 0,
        }),
      });
      break;
    case 'neon':
      active.set({
        stroke: color || '#38BDF8',
        strokeWidth: width || 2,
        shadow: new fabric.Shadow({
          color: color || '#38BDF8',
          blur: 25,
          offsetX: 0,
          offsetY: 0,
        }),
      });
      break;
    case 'stroke':
      active.set({
        stroke: color || '#000000',
        strokeWidth: width || 3,
        shadow: undefined,
      });
      break;
    case 'background':
      active.set({
        backgroundColor: bg || '#FEF08A',
        shadow: undefined,
      });
      break;
    case 'none':
    default:
      active.set({
        shadow: undefined,
        stroke: undefined,
        strokeWidth: 0,
        backgroundColor: undefined,
      });
      break;
  }
  canvas.renderAll();
  canvas.fire('object:modified');
}

export function addCurvedText(canvas: fabric.Canvas, textString = 'Curved Text Banner') {
  const path = new fabric.Path('M 50 150 Q 250 50 450 150', {
    fill: '',
    stroke: '',
    visible: false,
  });

  const curved = new fabric.IText(textString, {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 32,
    fill: '#1A1A18',
    path: path,
    left: canvas.getWidth() / 2 - 200,
    top: canvas.getHeight() / 2 - 50,
  });

  canvas.add(path);
  canvas.add(curved);
  canvas.setActiveObject(curved);
  canvas.renderAll();
}

// ── Chart Generator ──────────────────────────────────────────

export function addChartToCanvas(
  canvas: fabric.Canvas,
  type: 'bar' | 'pie' | 'line' | 'donut',
  title = 'Sales Report',
  data = [
    { label: 'Q1', value: 40, color: '#3B82F6' },
    { label: 'Q2', value: 65, color: '#10B981' },
    { label: 'Q3', value: 85, color: '#F59E0B' },
    { label: 'Q4', value: 50, color: '#EC4899' },
  ]
) {
  const elements: fabric.FabricObject[] = [];
  const width = 400;
  const height = 300;
  const padding = 40;

  // Background card
  const card = new fabric.Rect({
    width,
    height,
    fill: '#FFFFFF',
    rx: 16,
    ry: 16,
    stroke: '#E5E7EB',
    strokeWidth: 1,
    shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.06)', blur: 15, offsetX: 0, offsetY: 4 }),
  });
  elements.push(card);

  // Title
  const titleText = new fabric.Text(title, {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'DM Sans, sans-serif',
    fill: '#1F2937',
    left: 20,
    top: 20,
  });
  elements.push(titleText);

  if (type === 'bar') {
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2 - 20;
    const maxValue = Math.max(...data.map((d) => d.value), 100);
    const barWidth = (chartWidth / data.length) * 0.6;
    const gap = (chartWidth / data.length) * 0.4;

    data.forEach((d, i) => {
      const barHeight = (d.value / maxValue) * chartHeight;
      const x = padding + i * (barWidth + gap) + gap / 2;
      const y = height - padding - barHeight;

      const bar = new fabric.Rect({
        left: x,
        top: y,
        width: barWidth,
        height: barHeight,
        fill: d.color,
        rx: 6,
        ry: 6,
      });
      const lbl = new fabric.Text(d.label, {
        left: x + barWidth / 2 - 8,
        top: height - padding + 8,
        fontSize: 12,
        fontFamily: 'DM Sans, sans-serif',
        fill: '#6B7280',
      });
      elements.push(bar, lbl);
    });
  } else if (type === 'pie' || type === 'donut') {
    const total = data.reduce((acc, d) => acc + d.value, 0);
    const cx = width / 2;
    const cy = height / 2 + 10;
    const r = 80;
    let startAngle = -Math.PI / 2;

    data.forEach((d) => {
      const sliceAngle = (d.value / total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;

      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = sliceAngle > Math.PI ? 1 : 0;

      const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      const slice = new fabric.Path(pathData, {
        fill: d.color,
        stroke: '#FFFFFF',
        strokeWidth: 2,
      });
      elements.push(slice);
      startAngle = endAngle;
    });

    if (type === 'donut') {
      const hole = new fabric.Circle({
        left: cx - 40,
        top: cy - 40,
        radius: 40,
        fill: '#FFFFFF',
      });
      elements.push(hole);
    }
  } else if (type === 'line') {
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2 - 20;
    const maxValue = Math.max(...data.map((d) => d.value), 100);
    const step = chartWidth / (data.length - 1 || 1);

    const points: fabric.XY[] = data.map((d, i) => ({
      x: padding + i * step,
      y: height - padding - (d.value / maxValue) * chartHeight,
    }));

    let pathStr = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathStr += ` L ${points[i].x} ${points[i].y}`;
    }

    const linePath = new fabric.Path(pathStr, {
      fill: '',
      stroke: '#3B82F6',
      strokeWidth: 4,
    });
    elements.push(linePath);

    points.forEach((p, i) => {
      const dot = new fabric.Circle({
        left: p.x - 5,
        top: p.y - 5,
        radius: 5,
        fill: '#3B82F6',
        stroke: '#FFFFFF',
        strokeWidth: 2,
      });
      const lbl = new fabric.Text(data[i].label, {
        left: p.x - 10,
        top: height - padding + 8,
        fontSize: 12,
        fontFamily: 'DM Sans, sans-serif',
        fill: '#6B7280',
      });
      elements.push(dot, lbl);
    });
  }

  const group = new fabric.Group(elements, {
    left: canvas.getWidth() / 2 - width / 2,
    top: canvas.getHeight() / 2 - height / 2,
  });

  canvas.add(group);
  canvas.setActiveObject(group);
  canvas.renderAll();
}

// ── Masked Image Frames ──────────────────────────────────────

export function addImageFrame(
  canvas: fabric.Canvas,
  imageUrl: string,
  shapeType: 'circle' | 'rect' | 'star' | 'phone'
) {
  const imgEl = new Image();
  imgEl.crossOrigin = 'anonymous';
  imgEl.onload = () => {
    const img = new fabric.FabricImage(imgEl);
    const w = 260;
    const h = 260;
    img.scaleToWidth(w);

    let clipObj: fabric.FabricObject;
    if (shapeType === 'circle') {
      clipObj = new fabric.Circle({
        radius: w / 2,
        originX: 'center',
        originY: 'center',
      });
    } else if (shapeType === 'phone') {
      clipObj = new fabric.Rect({
        width: 180,
        height: 360,
        rx: 24,
        ry: 24,
        originX: 'center',
        originY: 'center',
      });
    } else {
      clipObj = new fabric.Rect({
        width: w,
        height: h,
        rx: 16,
        ry: 16,
        originX: 'center',
        originY: 'center',
      });
    }

    img.set({
      clipPath: clipObj,
      left: canvas.getWidth() / 2 - w / 2,
      top: canvas.getHeight() / 2 - h / 2,
    });

    canvas.add(img);
    canvas.setActiveObject(img);
    canvas.renderAll();
  };
  imgEl.src = imageUrl;
}

// ── Freehand Drawing Utilities ───────────────────────────────

export function configureDrawingBrush(
  canvas: fabric.Canvas,
  tool: 'pen' | 'marker' | 'highlighter' | 'eraser',
  color = '#1A1A18',
  width = 5
) {
  if (tool === 'eraser') {
    // In Fabric v6/v7, EraserBrush is available or PencilBrush with clear stroke
    const eraser = new fabric.PencilBrush(canvas);
    eraser.color = '#FFFFFF'; // or background color
    eraser.width = width * 3;
    canvas.freeDrawingBrush = eraser;
    canvas.isDrawingMode = true;
    return;
  }

  const brush = new fabric.PencilBrush(canvas);
  brush.width = tool === 'marker' ? width * 2.5 : width;

  if (tool === 'highlighter') {
    // Semi-transparent highlighter color
    brush.color = color.startsWith('#') ? hexToRgba(color, 0.4) : color;
    brush.width = width * 4;
  } else {
    brush.color = color;
  }

  canvas.freeDrawingBrush = brush;
  canvas.isDrawingMode = true;
}

function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}

