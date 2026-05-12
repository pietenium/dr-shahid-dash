import { useContext } from "react";
import { ThemeContext } from "@context/ThemeContext";

/**
 * Custom hook to access theme context
 * Provides theme state and toggle functionality
 * @returns {{ theme: 'light'|'dark', setTheme: Function, toggleTheme: Function }}
 * @throws {Error} If used outside ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
