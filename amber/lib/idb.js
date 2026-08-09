'use client';

/* =========================================================
   INDEXEDDB — the local database engine
   ---------------------------------------------------------
   Two object stores:

     kv     { key, value }   the JSON collections — courses,
                             accounts, purchases, progress,
                             notes, homepage settings, theme
     media  { id, blob,      uploaded video, stored as a real
              name, size,    Blob so it survives a reload
              type, at }

   No dependencies; a thin promise wrapper over the raw API.
   Everything degrades to localStorage when IndexedDB is
   unavailable (private windows, ancient browsers).
   ========================================================= */

export const DB_NAME = 'ledgerline';
export const DB_VERSION = 1;
export const STORE_KV = 'kv';
export const STORE_MEDIA = 'media';

export function idbAvailable() {
  try {
    return typeof window !== 'undefined' && !!window.indexedDB;
  } catch (e) { return false; }
}

let dbPromise = null;

export function openDb() {
  if (!idbAvailable()) return Promise.reject(new Error('IndexedDB unavailable'));
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_KV)) db.createObjectStore(STORE_KV, { keyPath: 'key' });
      if (!db.objectStoreNames.contains(STORE_MEDIA)) db.createObjectStore(STORE_MEDIA, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('IndexedDB blocked by another tab'));
  }).catch(err => { dbPromise = null; throw err; });

  return dbPromise;
}

function tx(store, mode, fn) {
  return openDb().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const s = t.objectStore(store);
    let out;
    try { out = fn(s); } catch (e) { reject(e); return; }
    t.oncomplete = () => resolve(out && out.result !== undefined ? out.result : out);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  }));
}

const wrap = (req) => new Promise((resolve, reject) => {
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

/* ---------- kv ---------- */
export function kvGetAll() {
  return openDb().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(STORE_KV, 'readonly');
    const req = t.objectStore(STORE_KV).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  }));
}
export const kvSet    = (key, value) => tx(STORE_KV, 'readwrite', s => s.put({ key, value }));
export const kvDelete = (key)        => tx(STORE_KV, 'readwrite', s => s.delete(key));
export const kvClear  = ()           => tx(STORE_KV, 'readwrite', s => s.clear());

/* ---------- media ---------- */
export function mediaPut(blob, name) {
  const id = 'm_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const rec = { id, blob, name: name || 'video', size: blob.size, type: blob.type, at: Date.now() };
  return tx(STORE_MEDIA, 'readwrite', s => s.put(rec)).then(() => id);
}
export function mediaGet(id) {
  return openDb().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(STORE_MEDIA, 'readonly');
    const req = t.objectStore(STORE_MEDIA).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  }));
}
export function mediaList() {
  return openDb().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(STORE_MEDIA, 'readonly');
    const req = t.objectStore(STORE_MEDIA).getAll();
    req.onsuccess = () => resolve((req.result || []).map(r =>
      ({ id: r.id, name: r.name, size: r.size, type: r.type, at: r.at })));
    req.onerror = () => reject(req.error);
  }));
}
export const mediaDelete = (id) => tx(STORE_MEDIA, 'readwrite', s => s.delete(id));
export const mediaClear  = ()   => tx(STORE_MEDIA, 'readwrite', s => s.clear());

/* object URLs are cached so the same clip isn't re-created on every render */
const urlCache = new Map();
export function mediaUrl(id) {
  if (urlCache.has(id)) return Promise.resolve(urlCache.get(id));
  return mediaGet(id).then(rec => {
    if (!rec || !rec.blob) return null;
    const url = URL.createObjectURL(rec.blob);
    urlCache.set(id, url);
    return url;
  });
}
export function revokeMediaUrl(id) {
  const u = urlCache.get(id);
  if (u) { URL.revokeObjectURL(u); urlCache.delete(id); }
}

/* ---------- quota ---------- */
export function estimate() {
  if (typeof navigator === 'undefined' || !navigator.storage || !navigator.storage.estimate) {
    return Promise.resolve(null);
  }
  return navigator.storage.estimate().then(e => ({ usage: e.usage || 0, quota: e.quota || 0 }))
    .catch(() => null);
}

export function deleteDatabase() {
  dbPromise = null;
  return new Promise((resolve) => {
    if (!idbAvailable()) return resolve();
    const req = window.indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = req.onerror = req.onblocked = () => resolve();
  });
}
