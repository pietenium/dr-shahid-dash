import { create } from "zustand";

/**
 * Authentication store
 * Manages user session with memory-only accessToken for security
 * User object synced to sessionStorage as backup
 *
 * @typedef {Object} User
 * @property {string} _id - User ID
 * @property {string} name - Full name
 * @property {string} email - Email address
 * @property {'ADMIN'|'MODERATOR'} role - User role
 * @property {boolean} isActive - Account status
 * @property {string} lastLogin - ISO date string
 *
 * @typedef {Object} AuthState
 * @property {User|null} user - Current user object
 * @property {string|null} accessToken - JWT access token (memory only)
 * @property {boolean} isAuthenticated - Whether user is logged in
 * @property {function} setAuth - Set authentication state
 * @property {function} clearAuth - Clear authentication state
 * @property {function} updateUser - Update user object partially
 */
export const useAuthStore = create((set) => ({
  user: JSON.parse(sessionStorage.getItem("user") || "null"),
  accessToken: null,
  isAuthenticated: false,

  /**
   * Set authentication state after successful login
   * @param {User} user - User object from API
   * @param {string} token - JWT access token
   */
  setAuth: (user, token) => {
    sessionStorage.setItem("user", JSON.stringify(user));
    set({
      user,
      accessToken: token,
      isAuthenticated: true,
    });
  },

  /**
   * Clear authentication state (logout)
   */
  clearAuth: () => {
    sessionStorage.removeItem("user");
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },

  /**
   * Update user object partially
   * @param {Partial<User>} updates - User fields to update
   */
  updateUser: (updates) => {
    set((state) => {
      const updatedUser = { ...state.user, ...updates };
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },
}));
