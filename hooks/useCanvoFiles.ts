'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import {
  getAllFiles,
  saveFile,
  deleteFile as dbDeleteFile,
  updateFileName,
  getFile,
} from '@/lib/db';
import type { CanvoFile } from '@/types/canvas';

export function useCanvoFiles() {
  const [files, setFiles] = useState<CanvoFile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFiles = useCallback(async () => {
    try {
      const allFiles = await getAllFiles();
      setFiles(allFiles);
    } catch (err) {
      console.error('Failed to load files:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const createFile = useCallback(
    async (name: string, width: number, height: number): Promise<string> => {
      const id = uuid();
      const now = Date.now();
      const file: CanvoFile = {
        id,
        name,
        width,
        height,
        thumbnail: '',
        fabricJson: JSON.stringify({
          version: '6.0.0',
          objects: [],
          background: '#ffffff',
        }),
        createdAt: now,
        updatedAt: now,
      };
      await saveFile(file);
      await loadFiles();
      return id;
    },
    [loadFiles]
  );

  const removeFile = useCallback(
    async (id: string) => {
      await dbDeleteFile(id);
      await loadFiles();
    },
    [loadFiles]
  );

  const renameFile = useCallback(
    async (id: string, newName: string) => {
      await updateFileName(id, newName);
      await loadFiles();
    },
    [loadFiles]
  );

  const duplicateFile = useCallback(
    async (id: string) => {
      const original = await getFile(id);
      if (!original) return;
      const newId = uuid();
      const now = Date.now();
      await saveFile({
        ...original,
        id: newId,
        name: `${original.name} (copy)`,
        createdAt: now,
        updatedAt: now,
      });
      await loadFiles();
    },
    [loadFiles]
  );

  return {
    files,
    loading,
    createFile,
    removeFile,
    renameFile,
    duplicateFile,
    refreshFiles: loadFiles,
  };
}
