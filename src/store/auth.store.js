import { create } from "zustand";
import api from "@api/axios";
import { me } from "@/api/auth.api";

/**
 * Authentication store
 * Manages user session with memory-only accessToken for security
 * User object synced to sessionStorage as backup
 * Token refresh handled on app initialization
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
 * @property {boolean} isInitialized - Whether auth has been initialized
 * @property {boolean} isRefreshing - Token refresh in progress
 * @property {function} initializeAuth - Initialize auth on app load
 * @property {function} setAuth - Set authentication state after login
 * @property {function} setTokens - Update tokens only (for refresh)
 * @property {function} clearAuth - Clear authentication state
 * @property {function} updateUser - Update user object partially
 */
export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitialized: false,
  isRefreshing: false,

  /**
   * Initialize authentication on app load
   * Attempts to refresh token using httpOnly cookie
   * Called once when App mounts
   *
   * @returns {Promise<boolean>} Whether initialization succeeded
   */
  initializeAuth: async () => {
    const state = get();

    // Prevent multiple simultaneous initializations
    if (state.isInitialized || state.isRefreshing) {
      return state.isAuthenticated;
    }

    set({ isRefreshing: true });

    try {
      // Try to get a fresh access token using the refresh token cookie
      const { data } = await api.post("/auth/refresh-token");
      const user = await me();
      const { accessToken } = data.data;

      if (accessToken && user) {
        // Store user in sessionStorage as backup
        sessionStorage.setItem("user", JSON.stringify(user));

        set({
          user,
          accessToken,
          isAuthenticated: true,
          isInitialized: true,
          isRefreshing: false,
        });

        console.log("✅ Auth initialized successfully");
        return true;
      }

      // No valid session
      set({
        isInitialized: true,
        isRefreshing: false,
      });
      return false;
    } catch (error) {
      // No valid refresh token - user needs to login
      console.log(error?.message || "🔒 No valid session, user needs to login");

      // Clear any stale data
      sessionStorage.removeItem("user");

      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isInitialized: true,
        isRefreshing: false,
      });

      return false;
    }
  },

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
      isInitialized: true,
    });
  },

  /**
   * Update tokens only - used during token refresh
   * Does NOT update sessionStorage (user already stored)
   * @param {string} token - New JWT access token
   * @param {User} [user] - Updated user object (optional)
   */
  setTokens: (token) => {
    const updates = { accessToken: token };
    set(updates);
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
      isInitialized: true,
      isRefreshing: false,
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
