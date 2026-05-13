import React, { useEffect, useState } from "react";
import { useTheme } from "@hooks/useTheme";
import AppRouter from "@router/AppRouter";
import { useAuthStore } from "@store/auth.store";
import Spinner from "@components/ui/Spinner";

/**
 * Root application component
 *
 * Features:
 * - Initializes authentication on mount (token refresh)
 * - Manages theme class on HTML element
 * - Shows loading spinner while auth is being initialized
 * - Prevents flash of unauthenticated content
 *
 * @returns {JSX.Element} Application with theme and auth support
 */
function App() {
  const { theme } = useTheme();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isAppReady, setIsAppReady] = useState(false);
  const navigate = useNavigate();
  /**
   * Initialize auth on mount
   * Only runs once when the app first loads
   */
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        await initializeAuth();
      } catch {
        navigate("/login");
        // Auth initialization failed - user will need to login
      } finally {
        if (isMounted) {
          setIsAppReady(true);
        }
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [initializeAuth, navigate]);

  /**
   * Set up proactive token refresh interval
   * Refreshes token every 14 minutes (assuming 15min expiry)
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    // Refresh token every 14 minutes to prevent expiry
    const refreshInterval = setInterval(
      async () => {
        try {
          const { data } = await api.post("/auth/refresh-token");
          const { accessToken } = data.data;
          useAuthStore.getState().setTokens(accessToken);
        } catch {
          console.warn("⚠️ Proactive token refresh failed");
          // The axios interceptor will handle 401 on next request
        }
      },
      14 * 60 * 1000, // 14 minutes
    );

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated]);

  /**
   * Apply theme class to HTML element
   */
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Show loading screen while auth is initializing
  if (!isAppReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a]">
        {/* Animated Logo */}
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2FA084] to-[#578FCA] flex items-center justify-center shadow-lg shadow-[#2FA084]/20">
            <span className="text-white font-bold text-xl">KS</span>
          </div>
          {/* Pulse ring */}
          <div className="absolute inset-[-4px] rounded-2xl border-2 border-[#2FA084]/30 animate-ping" />
        </div>

        {/* Loading text */}
        <p className="text-sm text-[#6b7280] dark:text-[#cbd5e1] mb-4">
          Loading your dashboard...
        </p>

        {/* Spinner */}
        <Spinner size="md" />
      </div>
    );
  }

  return <AppRouter />;
}

// Need to import api for the interval refresh
import api from "@api/axios";
import { useNavigate } from "react-router";

export default App;
