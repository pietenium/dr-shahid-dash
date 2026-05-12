import { useCallback } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@store/auth.store";
import * as authApi from "@api/auth.api";

/**
 * Authentication hook
 * Wraps auth store and API calls for convenient access
 * @returns {Object} Auth state and actions
 * @returns {Object} returns.user - Current user object
 * @returns {string|null} returns.accessToken - JWT access token
 * @returns {boolean} returns.isAuthenticated - Auth status
 * @returns {string} returns.role - User role
 * @returns {boolean} returns.isAdmin - Whether user is ADMIN
 * @returns {Function} returns.login - Login function
 * @returns {Function} returns.logout - Logout function
 * @returns {Function} returns.updateUser - Update user function
 */
export function useAuth() {
  const navigate = useNavigate();
  const { user, accessToken, isAuthenticated, setAuth, clearAuth, updateUser } =
    useAuthStore();

  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<void>}
   */
  const login = useCallback(
    async (email, password) => {
      try {
        const response = await authApi.login(email, password);
        const { user, accessToken } = response.data;
        setAuth(user, accessToken);
        navigate("/dashboard");
      } catch (error) {
        console.log("Login failed:", error);
        throw new Error(
          error.response?.data?.message || "Login failed. Please try again.",
        );
      }
    },
    [setAuth, navigate],
  );

  /**
   * Logout user
   * Clears auth state and redirects to login
   */
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout API errors
    } finally {
      clearAuth();
      navigate("/login");
    }
  }, [clearAuth, navigate]);

  return {
    user,
    accessToken,
    isAuthenticated,
    role: user?.role,
    isAdmin: user?.role === "ADMIN",
    login,
    logout,
    updateUser,
  };
}
