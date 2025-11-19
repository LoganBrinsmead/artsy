import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

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

  const value = useMemo(() => ({ isDark, setDark, toggle, ready }), [isDark, ready]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeProvider');
  return ctx;
}
