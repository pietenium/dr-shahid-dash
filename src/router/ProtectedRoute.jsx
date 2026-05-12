import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "@store/auth.store";

/**
 * Route guard for authenticated pages
 * Redirects to login if user is not authenticated
 * Preserves intended destination for post-login redirect
 * @returns {JSX.Element} Protected route outlet or redirect
 */
function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
