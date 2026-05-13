import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "@store/auth.store";
import Spinner from "@components/ui/Spinner";

/**
 * Route guard for authenticated pages
 * Redirects to login if user is not authenticated
 * Shows loading spinner while auth is initializing
 * Preserves intended destination for post-login redirect
 *
 * @returns {JSX.Element} Protected route outlet or redirect
 */
function ProtectedRoute() {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const location = useLocation();
  console.log(
    "ProtectedRoute - isAuthenticated:",
    isAuthenticated,
    "isInitialized:",
    isInitialized,
  );
  // Show loading while auth is being initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
