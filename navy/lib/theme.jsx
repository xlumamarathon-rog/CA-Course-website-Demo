'use client';

/* This build is locked to Direction B — Navy Authority.
   The switchable two-direction build lives in the repository root. */
export const THEME = 'navy';

export function ThemeProvider({ children }) {
  return children;
}

export const useTheme = () => ({ theme: THEME, setTheme: () => {} });
