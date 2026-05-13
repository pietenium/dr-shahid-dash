import axios from "axios";
import { useAuthStore } from "@store/auth.store";

/**
 * Configured Axios instance for API communication
 *
 * Features:
 * - Auto-attaches accessToken from Zustand store
 * - Detects token expiry and proactively refreshes
 * - Handles 401 with refresh token retry logic
 * - Queues concurrent requests during token refresh
 * - Includes credentials for httpOnly refreshToken cookie
 */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Refresh token state management
let isRefreshing = false;
let failedQueue = [];
let refreshPromise = null;

/**
 * Process queued requests after token refresh
 * @param {Error|null} error - Error from refresh attempt
 * @param {string|null} token - New access token
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Decode JWT token to get expiry time
 * @param {string} token - JWT access token
 * @returns {Object|null} Decoded payload or null
 */
function decodeToken(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Check if token is expired or about to expire
 * @param {string} token - JWT access token
 * @param {number} [bufferSeconds=60] - Buffer time before expiry in seconds
 * @returns {boolean} True if token needs refresh
 */
function isTokenExpired(token, bufferSeconds = 60) {
  if (!token) return true;
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  // Check if token will expire within buffer time
  const expiryTime = decoded.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  return currentTime >= expiryTime - bufferSeconds * 1000;
}

/**
 * Refresh the access token
 * @returns {Promise<string>} New access token
 */
async function performTokenRefresh() {
  try {
    const { data } = await api.post("/auth/refresh-token");
    const { accessToken: newToken, user } = data.data;

    // Update store with new token
    useAuthStore.getState().setTokens(newToken, user);

    return newToken;
  } catch (error) {
    // Refresh failed - clear auth and redirect
    useAuthStore.getState().clearAuth();

    // Only redirect if not already on auth pages
    if (
      !window.location.pathname.startsWith("/login") &&
      !window.location.pathname.startsWith("/forgot-password") &&
      !window.location.pathname.startsWith("/magic-login")
    ) {
      window.location.href = "/login";
    }
    throw error;
  }
}

/**
 * Request interceptor - attaches access token & checks expiry
 */
api.interceptors.request.use(
  async (config) => {
    const { accessToken } = useAuthStore.getState();

    // Skip token check for refresh endpoint and public routes
    if (
      config.url === "/auth/refresh-token" ||
      config.url === "/auth/login" ||
      config.url === "/auth/forgot-password" ||
      config.url === "/auth/verify-otp" ||
      config.url === "/auth/magic-login" ||
      config.url === "/auth/reset-password"
    ) {
      return config;
    }

    // If we have a token but it's about to expire, refresh proactively
    if (accessToken && isTokenExpired(accessToken, 60)) {
      // If already refreshing, wait for it
      if (isRefreshing) {
        try {
          const newToken = await refreshPromise;
          config.headers.Authorization = `Bearer ${newToken}`;
          return config;
        } catch {
          // Refresh failed, let the request proceed and handle 401
        }
      } else {
        // Start proactive refresh
        isRefreshing = true;
        refreshPromise = performTokenRefresh();

        try {
          const newToken = await refreshPromise;
          config.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return config;
        } catch (error) {
          processQueue(error, null);
          // Don't throw - let the request try with old token and handle 401
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      }
    }

    // Attach current token if available
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response interceptor - handles 401 with refresh token retry
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry refresh token requests themselves
    if (originalRequest.url === "/auth/refresh-token") {
      return Promise.reject(error);
    }

    // Don't retry if already retried
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Only handle 401 errors
    if (error.response?.status === 401) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post("/auth/refresh-token");
        const { accessToken: newToken } = data.data;

        // Update store with new token
        useAuthStore.getState().setTokens(newToken);

        // Process queue
        processQueue(null, newToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear auth and redirect
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();

        // Redirect to login
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
