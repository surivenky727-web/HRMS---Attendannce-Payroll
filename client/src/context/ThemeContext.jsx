import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'hrms-theme-mode';
const SYSTEM_MEDIA_QUERY = '(prefers-color-scheme: dark)';

const getStoredTheme = () => {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(STORAGE_KEY);
  return ['light', 'dark', 'system'].includes(stored) ? stored : 'system';
};

const resolveTheme = (mode) => {
  if (mode === 'system' && typeof window !== 'undefined') {
    return window.matchMedia(SYSTEM_MEDIA_QUERY).matches ? 'dark' : 'light';
  }
  return mode;
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mediaQuery = window.matchMedia(SYSTEM_MEDIA_QUERY);
    const applyTheme = () => {
      document.documentElement.dataset.theme = resolveTheme(theme);
      localStorage.setItem(STORAGE_KEY, theme);
    };

    applyTheme();
    if (theme !== 'system') return undefined;

    const listener = () => applyTheme();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }

    mediaQuery.addListener(listener);
    return () => mediaQuery.removeListener(listener);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme: resolveTheme(theme),
      setTheme,
      cycleTheme: () => setTheme((current) => {
        if (current === 'light') return 'dark';
        if (current === 'dark') return 'system';
        return 'light';
      }),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
}
