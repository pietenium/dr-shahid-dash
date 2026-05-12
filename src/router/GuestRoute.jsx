import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@store/auth.store";

/**
 * Route guard for guest-only pages (login, forgot password, etc.)
 * Redirects to dashboard if user is already authenticated
 * @returns {JSX.Element} Guest route outlet or redirect
 */
function GuestRoute() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default GuestRoute;
