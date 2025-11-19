import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const ThemeContext = createContext();

// Custom light theme matching current app aesthetic
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#000000',
    onPrimary: '#ffffff',
    primaryContainer: '#e5e5e5',
    onPrimaryContainer: '#000000',
    secondary: '#000000',
    onSecondary: '#ffffff',
    background: '#ffffff',
    onBackground: '#000000',
    surface: '#ffffff',
    onSurface: '#000000',
    surfaceVariant: '#f5f5f5',
    onSurfaceVariant: '#6b7280',
    outline: '#d1d5db',
    error: '#ef4444',
  },
};

// Custom dark theme matching current app aesthetic
const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#ffffff',
    onPrimary: '#000000',
    primaryContainer: '#262626',
    onPrimaryContainer: '#ffffff',
    secondary: '#ffffff',
    onSecondary: '#000000',
    background: '#000000',
    onBackground: '#ffffff',
    surface: '#171717',
    onSurface: '#ffffff',
    surfaceVariant: '#262626',
    onSurfaceVariant: '#d1d5db',
    outline: '#404040',
    error: '#ef4444',
  },
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('theme:isDark');
        if (stored !== null) setIsDark(stored === '1');
      } catch {}
      setReady(true);
    })();
  }, []);

  const setDark = async (next) => {
    setIsDark(next);
    try { await AsyncStorage.setItem('theme:isDark', next ? '1' : '0'); } catch {}
  };

  const toggle = () => setDark(!isDark);

  const theme = useMemo(() => isDark ? darkTheme : lightTheme, [isDark]);

  const value = useMemo(() => ({ isDark, setDark, toggle, ready, theme }), [isDark, ready, theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within ThemeProvider');
  return ctx;
}
