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

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  push.mockClear();
  globalThis.__SEARCH__ = '';
  window.scrollTo = () => {};
});
