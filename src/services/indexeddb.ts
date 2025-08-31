import { openDB } from 'idb';

const DB_NAME = 'try240-db';
const DB_VERSION = 1;

export const dbReady = openDB(DB_NAME, DB_VERSION, {
  upgrade(db, oldVersion) {
    if (!db.objectStoreNames.contains('artwork')) {
      db.createObjectStore('artwork', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('timeline')) {
      db.createObjectStore('timeline', { keyPath: 'id' });
    }
  }
});

export async function cacheArtwork(id: string, data: Blob, etag?: string) {
  const db = await dbReady;
  await db.put('artwork', { id, blob: data, etag, ts: Date.now() });
}

export async function getArtwork(id: string): Promise<{ blob: Blob; etag?: string } | null> {
  const db = await dbReady;
  const v = await db.get('artwork', id);
  return v ? { blob: v.blob, etag: v.etag } : null;
}