'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

/* =========================================================
   DEVICE STORAGE
   Everything the user does lives on their own device.
   No backend, no database, no accounts on a server.
   Keys are namespaced `tb.` so they never collide.
   ========================================================= */

const P = 'tb.';
const EVT = 'tb:change';
const browser = () => typeof window !== 'undefined';

export const KEYS = {
  theme:     'theme',      // 'amber' | 'navy'
  courses:   'courses',    // the course catalogue the admin panel edits
  purchases: 'purchases',  // { 'learner@x.in': ['audit'] }  — per account
  enrolled:  'enrolled',   // legacy single-user list (kept for compatibility)
  progress:  'progress',   // { audit: { done:{'3':true}, last:3, sec:{'3':128} } }
  notes:     'notes',      // { audit: [{ idx, at, text, ts }] }
  cart:      'cart',       // courseId | null
  user:      'user'        // { name, email, role }
};

export function read(key, fallback) {
  if (!browser()) return fallback;
  try {
    const raw = window.localStorage.getItem(P + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (e) { return fallback; }
}

export function write(key, value) {
  if (!browser()) return;
  try {
    window.localStorage.setItem(P + key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(EVT, { detail: { key } }));
  } catch (e) { /* storage full or blocked — fail quietly */ }
}

export function clearAll() {
  if (!browser()) return;
  try {
    Object.values(KEYS).forEach(k => window.localStorage.removeItem(P + k));
    window.dispatchEvent(new CustomEvent(EVT, { detail: { key: '*' } }));
  } catch (e) {}
}

export function dumpAll() {
  const out = {};
  Object.entries(KEYS).forEach(([name, k]) => { out[name] = read(k, null); });
  return out;
}

/* ---- React binding -------------------------------------------------
   Starts from `fallback` so server and first client render match
   (no hydration mismatch), then fills in from the device on mount.   */
export function useStored(key, fallback) {
  const [value, setValue] = useState(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setValue(read(key, fallback));
    setReady(true);
    const handler = (e) => {
      if (!e.detail || e.detail.key === key || e.detail.key === '*') {
        setValue(read(key, fallback));
      }
    };
    window.addEventListener(EVT, handler);
    return () => window.removeEventListener(EVT, handler);
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

  return [value, set, ready];
}

/* ---- domain helpers ---- */
export function useProgress(courseId) {
  const [all, setAll, ready] = useStored(KEYS.progress, {});
  const mine = all[courseId] || { done: {}, last: 0, sec: {} };

  const patch = (fn) => setAll(prev => {
    const cur = prev[courseId] || { done: {}, last: 0, sec: {} };
    return Object.assign({}, prev, { [courseId]: fn(cur) });
  });

  return {
    ready,
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
