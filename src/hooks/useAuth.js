import { useCallback } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@store/auth.store";
import * as authApi from "@api/auth.api";
import { toast } from "sonner";
import { formatError } from "@utils/formatError";

export function useAuth() {
  const navigate = useNavigate();
  const {
    user,
    accessToken,
    isAuthenticated,
    setAuth,
    clearAuth,
    updateUser: updateStoreUser,
  } = useAuthStore();

  /**
   * Login with email and password
   * On success: stores user + token, navigates to dashboard
   * On failure: displays appropriate error toast
   *
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<boolean>} Login success status
   */
  const login = useCallback(
    async (email, password) => {
      try {
        const response = await authApi.login(email, password);
        const { user: userData, accessToken: token } = response.data;
        setAuth(userData, token);
        toast.success(`Welcome back, ${userData.name}!`);
        navigate("/dashboard", { replace: true });
        return true;
      } catch (error) {
        const status = error?.response?.status;
        if (status === 401) {
          toast.error("Invalid email or password");
        } else if (status === 403) {
          toast.error("Account is inactive. Please contact administrator.");
        } else if (status === 429) {
          toast.error("Too many login attempts. Please try again later.");
        } else {
          toast.error(formatError(error, "Login failed. Please try again."));
        }
        return false;
      }
    },
    [setAuth, navigate],
  );

  /**
   * Logout current user
   * Calls API to invalidate tokens, clears store, redirects to login
   */
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout API errors - clear local state anyway
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
      toast.success("Logged out successfully");
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
    updateUser: updateStoreUser,
  };
}
