/* eslint-disable no-unused-vars */
import { memo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faSun,
  faMoon,
  faBell,
  faUserCog,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useUIStore } from "@store/ui.store";
import { useAuth } from "@hooks/useAuth";
import { useBreadcrumb } from "@hooks/useBreadcrumb";
import { useTheme } from "@hooks/useTheme";
import Avatar from "@components/ui/Avatar";
import Dropdown from "@components/ui/Dropdown";
import ConfirmDialog from "@components/ui/ConfirmDialog";

/**
 * Navbar - Top navigation bar
 *
 * Features:
 * - Sticky at top (z-50)
 * - Backdrop blur effect on background
 * - Left side: hamburger (mobile), sidebar toggle (desktop), breadcrumb
 * - Right side: theme toggle, notification bell, user dropdown
 * - Responsive: adapts layout for mobile/desktop
 *
 * @returns {JSX.Element} Top navigation bar
 */
const Navbar = memo(function Navbar() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const setSidebar = useUIStore((state) => state.setSidebar);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const breadcrumbs = useBreadcrumb();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  /**
   * Handle mobile menu toggle
   */
  const handleMobileMenu = () => {
    setSidebar(true); // Opens mobile drawer via ui store
  };

  /**
   * Handle logout confirmation
   */
  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  /**
   * User dropdown items configuration
   */
  const userDropdownItems = [
    {
      label: "Settings",
      icon: faUserCog,
      onClick: () => navigate("/settings"),
    },
    {
      label: "Logout",
      icon: faSignOutAlt,
      onClick: () => setShowLogoutConfirm(true),
      danger: true,
    },
  ];

  return (
    <>
      <header
        className="sticky top-0 z-40 h-16 shrink-0 bg-card-light/80 dark:bg-card-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark"
        role="banner"
      >
        <div className="h-full flex items-center justify-between px-4 lg:px-6">
          {/* LEFT SIDE */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Mobile Hamburger - visible below lg */}
            <button
              onClick={handleMobileMenu}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Open navigation menu"
            >
              <FontAwesomeIcon
                icon={faBars}
                className="w-5 h-5 text-text-heading-light dark:text-text-heading-dark"
              />
            </button>

            {/* Desktop Sidebar Toggle - visible lg and above */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <FontAwesomeIcon
                icon={sidebarOpen ? faChevronLeft : faChevronRight}
                className="w-4 h-4 text-text-heading-light dark:text-text-heading-dark"
              />
            </button>

            {/* Breadcrumb */}
            <nav
              className="hidden sm:flex items-center gap-1.5 min-w-0"
              aria-label="Breadcrumb"
            >
              {breadcrumbs.map((crumb, index) => (
                <div
                  key={crumb.path}
                  className="flex items-center gap-1.5 min-w-0"
                >
                  {/* Separator */}
                  {index > 0 && (
                    <span className="text-text-para-light dark:text-text-para-dark mx-0.5 shrink-0">
                      /
                    </span>
                  )}

                  {/* Breadcrumb Item */}
                  {crumb.active ? (
                    <span className="text-sm font-semibold text-text-heading-light dark:text-text-heading-dark truncate">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="text-sm text-text-para-light dark:text-text-para-dark hover:text-brand-primary transition-colors truncate"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </div>
              ))}

              {/* Empty state */}
              {breadcrumbs.length === 0 && (
                <span className="text-sm font-semibold text-text-heading-light dark:text-text-heading-dark">
                  Dashboard
                </span>
              )}
            </nav>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Theme Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === "light" ? (
                  <motion.span
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="block"
                  >
                    <FontAwesomeIcon
                      icon={faSun}
                      className="w-5 h-5 text-yellow-500"
                    />
                  </motion.span>
                ) : (
                  <motion.span
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="block"
                  >
                    <FontAwesomeIcon
                      icon={faMoon}
                      className="w-5 h-5 text-blue-400"
                    />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Notification Bell */}
            <button
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Notifications (coming soon)"
            >
              <FontAwesomeIcon
                icon={faBell}
                className="w-5 h-5 text-text-para-light dark:text-text-para-dark"
              />
              {/* Notification badge - hidden for now */}
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full hidden" />
            </button>

            {/* User Dropdown */}
            <Dropdown
              trigger={
                <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <Avatar name={user?.name} size="sm" color="primary" />
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="w-3 h-3 text-text-para-light dark:text-text-para-dark hidden sm:block"
                  />
                </div>
              }
              items={userDropdownItems}
              align="right"
            />
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out? You will be redirected to the login page."
        confirmText="Logout"
        variant="warning"
      />
    </>
  );
});

export default Navbar;
