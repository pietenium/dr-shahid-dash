/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useMemo } from "react";
import { useUIStore } from "@store/ui.store";

/**
 * Theme context with light/dark/system mode support
 * Provides theme state and toggle function to entire app
 */
export const ThemeContext = createContext(null);

/**
 * Theme provider component
 * Manages theme class on HTML element and provides theme context
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export function ThemeProvider({ children }) {
  const { theme, setTheme, toggleTheme } = useUIStore();

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const contextValue = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
