'use client';
import { createContext, useContext, useEffect } from 'react';
import { useStored, KEYS } from './storage';

const ThemeCtx = createContext({ theme: 'navy', setTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useStored(KEYS.theme, 'navy');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme || 'navy');
  }, [theme]);

  return (
    <ThemeCtx.Provider value={{ theme: theme || 'navy', setTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);

/* Runs before first paint so the correct accent is applied with no flash. */
export const themeBootScript = `(function(){try{var t=JSON.parse(localStorage.getItem('tb.theme'))||'navy';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','navy');}})();`;
