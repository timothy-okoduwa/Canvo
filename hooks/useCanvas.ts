'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import * as fabric from 'fabric';

const MAX_HISTORY = 50;

interface UseCanvasParams {
  initialJson: string;
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  onModified: (json: string) => void;
  onActivate: () => void;
  registerCanvas: (canvas: fabric.Canvas) => void;
  unregisterCanvas: () => void;
}

interface UseCanvasReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  fabricCanvas: fabric.Canvas | null;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useCanvas({
  initialJson,
  canvasWidth,
  canvasHeight,
  zoom,
  onModified,
  onActivate,
  registerCanvas,
  unregisterCanvas,
}: UseCanvasParams): UseCanvasReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ✅ Ref-wrap all unstable callbacks — keeps undo/redo/scheduleSave dep-free
  const onModifiedRef = useRef(onModified);
  useEffect(() => { onModifiedRef.current = onModified; }, [onModified]);

  const onActivateRef = useRef(onActivate);
  useEffect(() => { onActivateRef.current = onActivate; }, [onActivate]);

  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const isLoadingRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateUndoRedoState = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  const saveState = useCallback((canvas: fabric.Canvas) => {
    if (isLoadingRef.current) return;
    const json = JSON.stringify(canvas.toJSON());
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(json);
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
    historyIndexRef.current = historyRef.current.length - 1;
    updateUndoRedoState();
  }, [updateUndoRedoState]);

  // ✅ No onModified in deps — reads via ref
  const undo = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    isLoadingRef.current = true;
    canvas.loadFromJSON(historyRef.current[historyIndexRef.current]).then(() => {
      canvas.renderAll();
      isLoadingRef.current = false;
      updateUndoRedoState();
      onModifiedRef.current(JSON.stringify(canvas.toJSON()));
    });
  }, [updateUndoRedoState]);

  // ✅ No onModified in deps — reads via ref
  const redo = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    isLoadingRef.current = true;
    canvas.loadFromJSON(historyRef.current[historyIndexRef.current]).then(() => {
      canvas.renderAll();
      isLoadingRef.current = false;
      updateUndoRedoState();
      onModifiedRef.current(JSON.stringify(canvas.toJSON()));
    });
  }, [updateUndoRedoState]);

  // ✅ No onModified in deps
  const scheduleSave = useCallback((canvas: fabric.Canvas) => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      onModifiedRef.current(JSON.stringify(canvas.toJSON()));
    }, 1000);
  }, []);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const canvas = new fabric.Canvas(canvasEl, {
      width: canvasWidth * zoom,
      height: canvasHeight * zoom,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: true,
    });

    fabricRef.current = canvas;
    registerCanvas(canvas);
    canvas.setZoom(zoom);

    if (initialJson) {
      isLoadingRef.current = true;
      canvas.loadFromJSON(initialJson).then(() => {
        canvas.renderAll();
        isLoadingRef.current = false;
        saveState(canvas);
      });
    } else {
      saveState(canvas);
    }

    const handleModified = () => {
      saveState(canvas);
      scheduleSave(canvas);
    };

    // ✅ Use ref so onActivate doesn't need to be a dep or re-registered
    const handleSelect = () => onActivateRef.current();

    canvas.on('object:modified', handleModified);
    canvas.on('object:added', handleModified);
    canvas.on('object:removed', handleModified);
    canvas.on('selection:created', handleSelect);
    canvas.on('selection:updated', handleSelect);
    canvas.on('mouse:down', handleSelect);

    return () => {
      clearTimeout(saveTimerRef.current);
      canvas.off('object:modified', handleModified);
      canvas.off('object:added', handleModified);
      canvas.off('object:removed', handleModified);
      canvas.off('selection:created', handleSelect);
      canvas.off('selection:updated', handleSelect);
      canvas.off('mouse:down', handleSelect);
      canvas.dispose();
      fabricRef.current = null;
      unregisterCanvas();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialJson, canvasWidth, canvasHeight]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (canvas) {
      canvas.setZoom(zoom);
      canvas.setDimensions({ width: canvasWidth * zoom, height: canvasHeight * zoom });
      canvas.renderAll();
    }
  }, [zoom, canvasWidth, canvasHeight]);

  return {
    canvasRef,
    fabricCanvas: fabricRef.current,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}