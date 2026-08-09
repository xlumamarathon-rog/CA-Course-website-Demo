'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  idbAvailable, kvGetAll, kvSet, kvClear,
  mediaPut, mediaList, mediaDelete, mediaClear, mediaUrl, estimate, deleteDatabase
} from './idb';

/* =========================================================
   THE LOCAL DATABASE
   ---------------------------------------------------------
   Engine: IndexedDB (see lib/idb.js). Falls back to
   localStorage automatically when IndexedDB is unavailable.

   IndexedDB is asynchronous, but the whole app reads state
   synchronously during render. So the document is hydrated
   into an in-memory cache once on boot, reads are served
   from that cache, and writes are applied to the cache
   immediately then flushed to disk in the background. The
   key-based API below is unchanged from the localStorage
   version, so no component knows the engine swapped.
   ========================================================= */

export const SCHEMA_VERSION = 1;
const EVT = 'll:change';
const LS_DOC = 'll.db';                    // fallback document
const LS_LEGACY = ['theme','courses','purchases','enrolled','progress','notes',
                   'cart','user','site','announcementHidden'];
const browser = () => typeof window !== 'undefined';

export const KEYS = {
  theme:'theme', courses:'courses', purchases:'purchases', progress:'progress',
  notes:'notes', cart:'cart', user:'user', site:'site'
};

/* ---------- in-memory cache ---------- */
const cache = new Map();
let engine = 'memory';            // 'indexeddb' | 'localstorage' | 'memory'
let ready = false;
let hydration = null;
let lastWrite = null;

const emit = (key) => {
  if (browser()) window.dispatchEvent(new CustomEvent(EVT, { detail: { key } }));
};

/* ---------- fallback document I/O ---------- */
function lsRead() {
  try {
    const raw = window.localStorage.getItem(LS_DOC);
    if (raw) { const p = JSON.parse(raw); if (p && p.data) return p.data; }
  } catch (e) {}
  return null;
}
function lsWriteAll() {
  try {
    window.localStorage.setItem(LS_DOC, JSON.stringify({
      __v: SCHEMA_VERSION, updatedAt: new Date().toISOString(), data: Object.fromEntries(cache)
    }));
  } catch (e) {}
}
/* fold pre-existing per-key localStorage into the cache, once */
function adoptLegacy() {
  let found = false;
  LS_LEGACY.forEach(k => {
    try {
      const raw = window.localStorage.getItem('ll.' + k);
      if (raw === null) return;
      cache.set(k, JSON.parse(raw));
      window.localStorage.removeItem('ll.' + k);
      found = true;
    } catch (e) {}
  });
  return found;
}

/* ---------- boot ---------- */
export function hydrate() {
  if (hydration) return hydration;
  if (!browser()) { ready = true; return Promise.resolve(); }

  hydration = (async () => {
    let migrated = false;

    if (idbAvailable()) {
      try {
        const rows = await kvGetAll();
        rows.forEach(r => cache.set(r.key, r.value));
        engine = 'indexeddb';

        if (rows.length === 0) {
          // first run on this engine — bring anything across from localStorage
          const doc = lsRead();
          if (doc) { Object.keys(doc).forEach(k => cache.set(k, doc[k])); migrated = true; }
          if (adoptLegacy()) migrated = true;
          if (migrated) {
            await Promise.all(Array.from(cache.entries()).map(([k, v]) => kvSet(k, v).catch(() => {})));
            try { window.localStorage.removeItem(LS_DOC); } catch (e) {}
          }
        }
      } catch (e) {
        engine = 'localstorage';
      }
    } else {
      engine = 'localstorage';
    }

    if (engine === 'localstorage') {
      const doc = lsRead();
      if (doc) Object.keys(doc).forEach(k => cache.set(k, doc[k]));
      else if (adoptLegacy()) lsWriteAll();
    }

    ready = true;
    emit('*');
  })();

  return hydration;
}

if (browser()) hydrate();

export const whenReady = () => hydration || hydrate();
export const isReady = () => ready;
export const getEngine = () => engine;

/* ---------- key API ---------- */
export function read(key, fallback) {
  return cache.has(key) ? cache.get(key) : fallback;
}

export function write(key, value) {
  cache.set(key, value);
  lastWrite = new Date().toISOString();
  if (browser()) {
    if (engine === 'indexeddb') kvSet(key, value).catch(() => { engine = 'localstorage'; lsWriteAll(); });
    else lsWriteAll();
  }
  emit(key);
}

export function clearAll() {
  cache.clear();
  if (browser()) {
    if (engine === 'indexeddb') { kvClear().catch(() => {}); mediaClear().catch(() => {}); }
    else { try { window.localStorage.removeItem(LS_DOC); } catch (e) {} }
  }
  emit('*');
}

export const dumpAll = () => Object.fromEntries(cache);

/* ---------- database-level helpers ---------- */
export const getDb = () => ({
  __v: SCHEMA_VERSION,
  engine,
  updatedAt: lastWrite,
  data: Object.fromEntries(cache)
});

export function replaceDb(next) {
  if (!next || typeof next !== 'object') return { error: 'That is not a JSON object.' };
  const data = next.data && typeof next.data === 'object' ? next.data : next;
  cache.clear();
  Object.keys(data).forEach(k => cache.set(k, data[k]));
  lastWrite = new Date().toISOString();
  if (browser()) {
    if (engine === 'indexeddb') {
      kvClear()
        .then(() => Promise.all(Array.from(cache.entries()).map(([k, v]) => kvSet(k, v))))
        .catch(() => {});
    } else lsWriteAll();
  }
  emit('*');
  return { ok: true };
}

export function dbStats() {
  const json = JSON.stringify(getDb());
  const count = (v) => Array.isArray(v) ? v.length
    : (v && typeof v === 'object' ? Object.keys(v).length : (v == null ? 0 : 1));
  return {
    version: SCHEMA_VERSION,
    engine,
    updatedAt: lastWrite,
    bytes: json.length,
    collections: Array.from(cache.keys()).map(k => ({
      key: k,
      type: Array.isArray(cache.get(k)) ? 'array'
        : (cache.get(k) && typeof cache.get(k) === 'object' ? 'map' : typeof cache.get(k)),
      count: count(cache.get(k))
    }))
  };
}

export function exportDbFile(filename) {
  if (!browser()) return;
  const blob = new Blob([JSON.stringify(getDb(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || ('ledgerline-demo-' + new Date().toISOString().slice(0, 10) + '.json');
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* media passthrough — uploaded video lives in its own store */
export { mediaPut, mediaList, mediaDelete, mediaClear, mediaUrl, estimate, deleteDatabase };

/* ---------- React binding ---------- */
export function useStored(key, fallback) {
  const [value, setValue] = useState(fallback);
  const [rdy, setRdy] = useState(false);

  useEffect(() => {
    let alive = true;
    whenReady().then(() => {
      if (!alive) return;
      setValue(read(key, fallback));
      setRdy(true);
    });
    const handler = (e) => {
      if (!e.detail || e.detail.key === key || e.detail.key === '*') setValue(read(key, fallback));
    };
    window.addEventListener(EVT, handler);
    return () => { alive = false; window.removeEventListener(EVT, handler); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const latest = useRef(fallback);
  useEffect(() => { latest.current = value; }, [value]);

  const set = useCallback((next) => {
    const resolved = typeof next === 'function' ? next(latest.current) : next;
    latest.current = resolved;
    setValue(resolved);
    write(key, resolved);
  }, [key]);

  return [value, set, rdy];
}

/* ---------- domain helpers ---------- */
export function useProgress(courseId) {
  const [all, setAll, rdy] = useStored(KEYS.progress, {});
  const mine = all[courseId] || { done: {}, last: 0, sec: {} };

  const patch = (fn) => setAll(prev => {
    const cur = prev[courseId] || { done: {}, last: 0, sec: {} };
    return Object.assign({}, prev, { [courseId]: fn(cur) });
  });

  return {
    ready: rdy,
    done: mine.done || {},
    last: mine.last || 0,
    sec: mine.sec || {},
    doneCount: Object.keys(mine.done || {}).length,
    markDone:   (idx) => patch(c => Object.assign({}, c, { done: Object.assign({}, c.done, { [idx]: true }) })),
    unmarkDone: (idx) => { patch(c => { const d = Object.assign({}, c.done); delete d[idx]; return Object.assign({}, c, { done: d }); }); },
    setLast:    (idx) => patch(c => Object.assign({}, c, { last: idx })),
    setSeconds: (idx, s) => patch(c => Object.assign({}, c, { sec: Object.assign({}, c.sec, { [idx]: Math.floor(s) }) }))
  };
}

export function useNotes(courseId) {
  const [all, setAll] = useStored(KEYS.notes, {});
  const list = all[courseId] || [];
  const add = (note) => setAll(prev => {
    const cur = prev[courseId] || [];
    return Object.assign({}, prev, { [courseId]: [note].concat(cur) });
  });
  const remove = (ts) => setAll(prev => {
    const cur = (prev[courseId] || []).filter(n => n.ts !== ts);
    return Object.assign({}, prev, { [courseId]: cur });
  });
  return { list, add, remove };
}

/* Resolves a lesson source: `idb:<id>` becomes an object URL for the
   stored Blob; anything else passes straight through. */
export function useMediaSrc(src) {
  const [url, setUrl] = useState(() => (src && src.startsWith('idb:') ? null : src || null));

  useEffect(() => {
    let alive = true;
    if (!src) { setUrl(null); return; }
    if (!src.startsWith('idb:')) { setUrl(src); return; }
    setUrl(null);
    mediaUrl(src.slice(4)).then(u => { if (alive) setUrl(u); }).catch(() => { if (alive) setUrl(null); });
    return () => { alive = false; };
  }, [src]);

  return url;
}
