'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getFile, saveFile } from '@/lib/db';
import type { PanelId, CanvoFile } from '@/types/canvas';
import {
  deleteSelected,
  duplicateSelected,
  copySelected,
  pasteFromClipboard,
  selectAll,
  groupSelected,
  ungroupSelected,
  addText,
  addShape,
  moveLayerForward,
  moveLayerBackward,
} from '@/lib/fabric-utils';

import TopBar from './TopBar';
import Sidebar from './Sidebar';
import Panel from './Panel';
import CanvasPage from './CanvasPage';
import BottomToolbar from './BottomToolbar';
import ZoomControl from './ZoomControl';
import ExportModal from './ExportModal';
import PropertiesPanel from './PropertiesPanel';
import InspectorBar from './InspectorBar';
import type * as fabric from 'fabric';

// Panels
import LayersPanel from './panels/LayersPanel';
import UploadsPanel from './panels/UploadsPanel';
import ImagesPanel from './panels/ImagesPanel';
import IconsPanel from './panels/IconsPanel';
import VectorsPanel from './panels/VectorsPanel';
import AppsPanel from './panels/AppsPanel';

interface EditorLayoutProps {
  fileId: string;
}

export default function EditorLayout({ fileId }: EditorLayoutProps) {
  const [file, setFile] = useState<CanvoFile | null>(null);
  const [fileName, setFileName] = useState('Untitled');
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Stacked canvas states
  const [pages, setPages] = useState<string[]>(['']);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pageControls, setPageControls] = useState<{
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
  } | null>(null);

  const canvasesRef = useRef<(fabric.Canvas | null)[]>([]);

  // Load file info
  useEffect(() => {
    (async () => {
      const f = await getFile(fileId);
      if (f) {
        setFile(f);
        setFileName(f.name);
        let filePages = f.pages || [];
        if (filePages.length === 0) {
          filePages = [f.fabricJson || ''];
        }
        setPages(filePages);
      }
      setLoading(false);
    })();
  }, [fileId]);

  const registerCanvas = (idx: number, canvas: fabric.Canvas) => {
    canvasesRef.current[idx] = canvas;
  };

  const unregisterCanvas = (idx: number) => {
    canvasesRef.current[idx] = null;
  };

  const activeCanvas = canvasesRef.current[activePageIndex] || null;

  // Zoom-to-fit logic
  const fitToScreen = useCallback(() => {
    if (!file) return;
    const isPanelOpen = document.querySelector('.editor-panel') !== null;
    const isPropsOpen = document.querySelector('.properties-panel') !== null;
    const sidebarWidth = 64;
    const panelWidth = isPanelOpen ? 360 : 0;
    const propsWidth = isPropsOpen ? 280 : 0;
    const topbarHeight = 56;
    const availableW = window.innerWidth - sidebarWidth - panelWidth - propsWidth - 120;
    const availableH = window.innerHeight - topbarHeight - 200;
    const fitZoom = Math.min(availableW / file.width, availableH / file.height);
    const clampedZoom = Math.max(0.05, Math.min(2, fitZoom));
    setZoom(clampedZoom);
  }, [file]);

  useEffect(() => {
    window.addEventListener('resize', fitToScreen);
    return () => window.removeEventListener('resize', fitToScreen);
  }, [fitToScreen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fitToScreen();
    }, 150);
    return () => clearTimeout(timer);
  }, [activePanel, fitToScreen]);

  useEffect(() => {
    if (file) {
      setTimeout(() => {
        fitToScreen();
      }, 100);
    }
  }, [file, fitToScreen]);

  // Panel toggle
  const handlePanelToggle = useCallback((panel: PanelId) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  }, []);

  // Page Operations
  // After — use functional setState everywhere so `pages` leaves the deps
  const handlePageUpdate = useCallback(
    async (idx: number, newJson: string) => {
      setPages((prev) => {
        const updated = [...prev];
        updated[idx] = newJson;

        if (file) {
          const firstCanvas = canvasesRef.current[0];
          let thumbnail = file.thumbnail;
          if (idx === 0 && firstCanvas) {
            try {
              thumbnail = firstCanvas.toDataURL({
                format: 'png',
                quality: 0.6,
                multiplier: 400 / firstCanvas.getWidth(),
              });
            } catch { }
          }
          saveFile({ ...file, fabricJson: updated[0], pages: updated, thumbnail, updatedAt: Date.now() });
        }
        return updated;
      });
    },
    [file] // `file` is still a dep, but it only changes on load — acceptable
  );

  const handleAddPage = useCallback(
    async (afterIdx: number) => {
      if (!file) return;
      const newPageJson = JSON.stringify({
        version: '6.0.0',
        objects: [],
        background: '#ffffff',
      });
      const updated = [...pages];
      updated.splice(afterIdx + 1, 0, newPageJson);
      setPages(updated);

      const updatedFile = {
        ...file,
        fabricJson: updated[0],
        pages: updated,
        updatedAt: Date.now(),
      };
      await saveFile(updatedFile);
      setActivePageIndex(afterIdx + 1);
    },
    [file, pages]
  );

  const handleDuplicatePage = useCallback(
    async (idx: number) => {
      if (!file) return;
      const canvas = canvasesRef.current[idx];
      const pageJson = canvas ? JSON.stringify(canvas.toJSON()) : pages[idx];

      const updated = [...pages];
      updated.splice(idx + 1, 0, pageJson);
      setPages(updated);

      const updatedFile = {
        ...file,
        fabricJson: updated[0],
        pages: updated,
        updatedAt: Date.now(),
      };
      await saveFile(updatedFile);
      setActivePageIndex(idx + 1);
    },
    [file, pages]
  );

  const handleDeletePage = useCallback(
    async (idx: number) => {
      if (!file || pages.length <= 1) return;
      const updated = [...pages];
      updated.splice(idx, 1);
      setPages(updated);

      const updatedFile = {
        ...file,
        fabricJson: updated[0],
        pages: updated,
        updatedAt: Date.now(),
      };
      await saveFile(updatedFile);
      setActivePageIndex(Math.max(0, idx - 1));
    },
    [file, pages]
  );

  const handleActivatePage = useCallback((idx: number) => {
    setActivePageIndex(idx);
    // Deselect other canvases
    canvasesRef.current.forEach((canvas, i) => {
      if (i !== idx && canvas) {
        canvas.discardActiveObject();
        canvas.renderAll();
      }
    });
  }, []);

  // Delegate Page Undo/Redo
  const undo = () => pageControls?.undo();
  const redo = () => pageControls?.redo();
  const canUndo = pageControls?.canUndo || false;
  const canRedo = pageControls?.canRedo || false;

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const canvas = activeCanvas;
      if (!canvas) return;

      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected(canvas);
        return;
      }

      if (isCtrlOrCmd && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      if (isCtrlOrCmd && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
        return;
      }

      if (isCtrlOrCmd && e.key === 'c') {
        e.preventDefault();
        copySelected(canvas);
        return;
      }

      if (isCtrlOrCmd && e.key === 'v') {
        e.preventDefault();
        pasteFromClipboard(canvas);
        return;
      }

      if (isCtrlOrCmd && e.key === 'd') {
        e.preventDefault();
        duplicateSelected(canvas);
        return;
      }

      if (isCtrlOrCmd && e.key === 'a') {
        e.preventDefault();
        selectAll(canvas);
        return;
      }

      if (isCtrlOrCmd && e.key === 'g' && !e.shiftKey) {
        e.preventDefault();
        groupSelected(canvas);
        return;
      }

      if (isCtrlOrCmd && e.key === 'g' && e.shiftKey) {
        e.preventDefault();
        ungroupSelected(canvas);
        return;
      }

      if (isCtrlOrCmd && e.key === '[') {
        e.preventDefault();
        moveLayerBackward(canvas);
        return;
      }

      if (isCtrlOrCmd && e.key === ']') {
        e.preventDefault();
        moveLayerForward(canvas);
        return;
      }

      if (e.key === 't' && !isCtrlOrCmd) {
        e.preventDefault();
        addText(canvas);
        return;
      }

      if (e.key === 'r' && !isCtrlOrCmd) {
        e.preventDefault();
        addShape(canvas, 'rect');
        return;
      }

      if (e.key === 'o' && !isCtrlOrCmd) {
        e.preventDefault();
        addShape(canvas, 'circle');
        return;
      }

      if (e.key === 'Escape') {
        if (activePanel) {
          setActivePanel(null);
        } else {
          canvas.discardActiveObject();
          canvas.renderAll();
        }
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCanvas, pageControls, activePanel]);

  if (loading || !file) {
    return (
      <div className="editor-container items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-border)] border-t-[var(--color-text-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  // Render active sidebar panel
  function renderPanel() {
    if (!activePanel) return null;

    const panelMap: Record<PanelId, React.ReactNode> = {
      layers: (
        <LayersPanel
          canvas={activeCanvas}
          onClose={() => setActivePanel(null)}
        />
      ),
      uploads: (
        <UploadsPanel
          canvas={activeCanvas}
          onClose={() => setActivePanel(null)}
        />
      ),
      images: (
        <ImagesPanel
          canvas={activeCanvas}
          onClose={() => setActivePanel(null)}
        />
      ),
      icons: (
        <IconsPanel
          canvas={activeCanvas}
          onClose={() => setActivePanel(null)}
        />
      ),
      vectors: (
        <VectorsPanel
          canvas={activeCanvas}
          onClose={() => setActivePanel(null)}
        />
      ),
      apps: (
        <AppsPanel
          canvas={activeCanvas}
          onClose={() => setActivePanel(null)}
        />
      ),
    };

    return panelMap[activePanel];
  }

  return (
    <div className="editor-container">
      {/* Top bar */}
      <TopBar
        fileId={fileId}
        fileName={fileName}
        onFileNameChange={setFileName}
        onExport={() => setExportOpen(true)}
      />

      {/* Inspector bar */}
      <InspectorBar
        canvas={activeCanvas}
        zoom={zoom}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        fitToScreen={fitToScreen}
      />

      {/* Body: sidebar + panel + scrollable stack + properties */}
      <div className="editor-body">
        {/* Left sidebar */}
        <Sidebar
          activePanel={activePanel}
          onPanelToggle={handlePanelToggle}
        />

        {/* Panel */}
        {renderPanel()}

        {/* Canvas Area (Scrollable vertical stack) */}
        <div className="editor-canvas-area overflow-y-auto overflow-x-auto flex flex-col items-center gap-12 py-16">
          <div className="flex flex-col items-center gap-12 min-w-max">
            {pages.map((pageJson, idx) => (
              <CanvasPage
                key={`${idx}-${pages.length}`}
                pageIndex={idx}
                initialJson={pageJson}
                width={file.width}
                height={file.height}
                zoom={zoom}
                isActive={activePageIndex === idx}
                onActivate={() => handleActivatePage(idx)}
                onUpdate={(newJson) => handlePageUpdate(idx, newJson)}
                onDuplicate={() => handleDuplicatePage(idx)}
                onDelete={() => handleDeletePage(idx)}
                onAddPage={() => handleAddPage(idx)}
                registerCanvas={(canvas) => registerCanvas(idx, canvas)}
                unregisterCanvas={() => unregisterCanvas(idx)}
                deleteDisabled={pages.length <= 1}
                setPageControls={setPageControls}
              />
            ))}
          </div>

          {/* Bottom toolbar */}
          <BottomToolbar canvas={activeCanvas} />

          {/* Zoom control */}
          <ZoomControl zoom={zoom} onZoomChange={setZoom} />
        </div>

        {/* Properties panel (right) */}
        <PropertiesPanel canvas={activeCanvas} />
      </div>

      {/* Export modal */}
      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        canvas={activeCanvas}
        fileName={fileName}
      />
    </div>
  );
}
