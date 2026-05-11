import { create } from "zustand";

/**
 * UI state store
 * Manages sidebar state and theme preferences
 * Theme persisted to localStorage for cross-session consistency
 *
 * @typedef {Object} UIState
 * @property {boolean} sidebarOpen - Desktop sidebar expanded state
 * @property {'light'|'dark'} theme - Current theme mode
 * @property {function} toggleSidebar - Toggle sidebar open/close
 * @property {function} setSidebar - Set sidebar state explicitly
 * @property {function} setTheme - Set theme explicitly
 * @property {function} toggleTheme - Toggle between light and dark
 */
export const useUIStore = create((set) => ({
  sidebarOpen: true,
  theme: localStorage.getItem("theme") || "light",

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebar: (open) => set({ sidebarOpen: open }),

  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    set({ theme });
  },

  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      return { theme: newTheme };
    }),
}));
