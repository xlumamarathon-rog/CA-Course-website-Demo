import { vi, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';

/* ---- next/navigation ---- */
export const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: push, back: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/',
  useParams: () => ({ id: 'audit' }),
  useSearchParams: () => new URLSearchParams(globalThis.__SEARCH__ || '')
}));

/* ---- next/link ---- */
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }) => React.createElement('a', { href, ...rest }, children)
}));

/* jsdom implements neither of these */
if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class {
    constructor(cb) { this.cb = cb; }
    observe(el) { this.cb([{ isIntersecting: true, target: el }], this); }
    unobserve() {}
    disconnect() {}
  };
}
if (!window.matchMedia) {
  window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {},
    addEventListener() {}, removeEventListener() {} });
}

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  push.mockClear();
  globalThis.__SEARCH__ = '';
  window.scrollTo = () => {};
});
