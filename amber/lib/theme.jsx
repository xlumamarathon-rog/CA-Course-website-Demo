'use client';

/* This build is locked to Direction A — Amber Continuity.
   The switchable two-direction build lives in the repository root. */
export const THEME = 'amber';

export function ThemeProvider({ children }) {
  return children;
}

export const useTheme = () => ({ theme: THEME, setTheme: () => {} });
