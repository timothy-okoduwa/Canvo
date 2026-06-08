// ============================================================
// Canvo — IndexedDB Storage Layer
// Uses the `idb` library for a Promise-based IndexedDB wrapper
// ============================================================

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { CanvoFile } from '@/types/canvas';

interface CanvoDB extends DBSchema {
  files: {
    key: string;
    value: CanvoFile;
    indexes: { 'by-updated': number };
  };
  uploads: {
    key: string;
    value: {
      id: string;
      name: string;
      dataUrl: string;
      createdAt: number;
    };
    indexes: { 'by-created': number };
  };
}

const DB_NAME = 'canvo-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<CanvoDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<CanvoDB>> {
  if (!dbPromise) {
    dbPromise = openDB<CanvoDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Files store
        if (!db.objectStoreNames.contains('files')) {
          const fileStore = db.createObjectStore('files', { keyPath: 'id' });
          fileStore.createIndex('by-updated', 'updatedAt');
        }
        // Uploads store (user-uploaded images)
        if (!db.objectStoreNames.contains('uploads')) {
          const uploadStore = db.createObjectStore('uploads', { keyPath: 'id' });
          uploadStore.createIndex('by-created', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
}

// ── File CRUD ──────────────────────────────────────────────

export async function saveFile(file: CanvoFile): Promise<void> {
  const db = await getDB();
  await db.put('files', file);
}

export async function getFile(id: string): Promise<CanvoFile | undefined> {
  const db = await getDB();
  return db.get('files', id);
}

export async function getAllFiles(): Promise<CanvoFile[]> {
  const db = await getDB();
  const files = await db.getAllFromIndex('files', 'by-updated');
  return files.reverse(); // most recently updated first
}

export async function deleteFile(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('files', id);
}

export async function updateFileName(id: string, name: string): Promise<void> {
  const db = await getDB();
  const file = await db.get('files', id);
  if (file) {
    file.name = name;
    file.updatedAt = Date.now();
    await db.put('files', file);
  }
}

// ── Uploads CRUD ───────────────────────────────────────────

export interface UploadedImage {
  id: string;
  name: string;
  dataUrl: string;
  createdAt: number;
}

export async function saveUpload(upload: UploadedImage): Promise<void> {
  const db = await getDB();
  await db.put('uploads', upload);
}

export async function getAllUploads(): Promise<UploadedImage[]> {
  const db = await getDB();
  const uploads = await db.getAllFromIndex('uploads', 'by-created');
  return uploads.reverse();
}

export async function deleteUpload(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('uploads', id);
}
