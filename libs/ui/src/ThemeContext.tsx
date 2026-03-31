import React, { createContext, useContext } from 'react';

interface Theme {
  color: string;
}

// Этот лог позволяет увидеть в DevTools сколько раз создаётся Context.
// Если логов два — Context дублирован, MF загружает @demo/ui дважды.
// Если лог один — всё нормально.
console.log('%c[ui] ThemeContext создан', 'color: purple; font-weight: bold');

const defaultTheme: Theme = { color: '#888' };

export const ThemeContext = createContext<Theme>(defaultTheme);

interface ProviderProps {
  children: React.ReactNode;
  color: string;
}

export const ThemeProvider = ({ children, color }: ProviderProps) => (
  <ThemeContext.Provider value={{ color }}>
    {children}
  </ThemeContext.Provider>
);

export const useTheme = () => useContext(ThemeContext);
