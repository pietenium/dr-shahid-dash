/* eslint-disable no-unused-vars */
import { memo, useEffect, useCallback, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTableColumns,
  faFileText,
  faBookOpen,
  faStar,
  faCalendar,
  faMessage,
  faUsers,
  faHeartbeat,
  faCog,
  faUserCog,
  faXmark,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useUIStore } from "@store/ui.store";
import { useAuth } from "@hooks/useAuth";
import Avatar from "@components/ui/Avatar";
import ConfirmDialog from "@components/ui/ConfirmDialog";
import { useState } from "react";
import { useNotifications } from "@context/NotificationContext";
import { useQuery } from "@tanstack/react-query";
import { getAppointments } from "@api/appointment.api";
import { getContactMessages } from "@api/contact.api";
/**
 * Navigation group configuration for mobile drawer
 * Same structure as Sidebar but always fully expanded
 * @constant {Array.<{label: string, items: Array}>}
 */

/**
 * MobileDrawer - Full-height sliding drawer for mobile navigation (<1024px)
 *
 * Features:
 * - Slides in from left with spring animation
 * - Semi-transparent backdrop overlay
 * - Closes on backdrop click
 * - Swipe-left to close (touch gesture)
 * - Auto-closes after navigation
 * - Same navigation items as Sidebar (always expanded)
 * - User profile section at bottom
 *
 * @returns {JSX.Element} Mobile navigation drawer with overlay
 */
const MobileDrawer = memo(function MobileDrawer() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const setSidebar = useUIStore((state) => state.setSidebar);
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const drawerRef = useRef(null);
  const touchStartX = useRef(0);

  const { appointmentUnread, contactUnread } = useNotifications();

  // Fetch counts for sidebar badges
  const { data: appointmentsCount } = useQuery({
    queryKey: ["appointments", "pending-count"],
    queryFn: () => getAppointments({ status: "PENDING", limit: 1 }),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });

  const pendingCount = appointmentsCount?.data?.totalDocs || 0;

  const { data: contactsCount } = useQuery({
    queryKey: ["contact", "unread-count"],
    queryFn: () => getContactMessages({ isRead: false, limit: 1 }),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });

  const unreadContactCount = contactsCount?.data?.totalDocs || 0;

  const MOBILE_NAV_GROUPS = [
    {
      label: "OVERVIEW",
      items: [{ label: "Dashboard", path: "/dashboard", icon: faTableColumns }],
    },
    {
      label: "CONTENT",
      items: [
        {
          label: "All Articles",
          path: "/articles",
          icon: faFileText,
          indent: true,
        },
        {
          label: "Categories",
          path: "/articles/categories",
          icon: faFileText,
          indent: true,
        },
        {
          label: "Create Article",
          path: "/articles/create",
          icon: faFileText,
          indent: true,
        },
        { label: "Research", path: "/research", icon: faBookOpen },
        { label: "Testimonials", path: "/testimonials", icon: faStar },
      ],
    },
    {
      label: "MANAGEMENT",
      items: [
        {
          label: `Appointments${pendingCount > 0 ? ` (${pendingCount})` : ""}`,
          path: "/appointments",
          icon: faCalendar,
          badge: pendingCount > 0,
          badgeColor: "bg-yellow-500",
        },
        {
          label: `Contact Messages${unreadContactCount > 0 ? ` (${unreadContactCount})` : ""}`,
          path: "/contact",
          icon: faMessage,
          badge: unreadContactCount > 0,
          badgeColor: "bg-blue-500",
        },
        { label: "Users", path: "/users", icon: faUsers, adminOnly: true },
      ],
    },
    {
      label: "SYSTEM",
      items: [
        { label: "Activity Logs", path: "/activity-logs", icon: faHeartbeat },
        { label: "App Info", path: "/app-info", icon: faCog, adminOnly: true },
        { label: "Settings", path: "/settings", icon: faUserCog },
      ],
    },
  ];

  // Close drawer on route change
  useEffect(() => {
    setSidebar(false);
  }, [location.pathname, setSidebar]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  /**
   * Touch gesture handler - swipe left to close
   */
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const swipeDistance = touchStartX.current - touchEndX;

      // Close if swiped left more than 80px
      if (swipeDistance > 80) {
        setSidebar(false);
      }
    },
    [setSidebar],
  );

  /**
   * Close drawer on Escape key
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && sidebarOpen) {
        setSidebar(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen, setSidebar]);

  /**
   * Filter items by role
   */
  const filterByRole = (items) =>
    items.filter((item) => !item.adminOnly || isAdmin);

  /**
   * Handle logout confirmation
   */
  const handleLogout = useCallback(() => {
    setShowLogoutConfirm(false);
    setSidebar(false);
    logout();
  }, [logout, setSidebar]);
  /**
   * Handle nav item click - close drawer on mobile
   */
  const handleNavClick = (path) => {
    setSidebar(false);
    navigate(path);
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebar(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.aside
            ref={drawerRef}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.3,
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="absolute left-0 top-0 h-full w-[280px] max-w-[85vw] bg-card-light dark:bg-card-dark shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-border-light dark:border-border-dark shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center">
                  <span className="text-white font-bold text-sm">KS</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-heading-light dark:text-text-heading-dark">
                    Dr. Sahidur
                  </p>
                  <p className="text-[10px] text-text-para-light dark:text-text-para-dark">
                    Admin Dashboard
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSidebar(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close menu"
              >
                <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
              {MOBILE_NAV_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="px-2 mb-1.5 text-[10px] font-semibold text-text-para-light dark:text-text-para-dark uppercase tracking-wider">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {filterByRole(group.items).map((item) => (
                      <button
                        key={item.path}
                        onClick={() => handleNavClick(item.path)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                          transition-all duration-200
                          ${
                            location.pathname === item.path ||
                            (item.path !== "/dashboard" &&
                              location.pathname.startsWith(item.path + "/"))
                              ? "bg-brand-softbg dark:bg-brand-primary/10 text-brand-primary border-l-[3px] border-brand-primary"
                              : "text-text-para-light dark:text-text-para-dark hover:bg-brand-softbg/50 dark:hover:bg-brand-primary/5 border-l-[3px] border-transparent"
                          }
                          ${item.indent && !item.path.includes("categories") && !item.path.includes("create") ? "pl-8" : ""}
                        `.trim()}
                      >
                        <FontAwesomeIcon
                          icon={item.icon}
                          className="w-4 h-4 shrink-0"
                          fixedWidth
                        />
                        <span className="text-sm font-medium">
                          {item.indent && item.label === "All Articles"
                            ? "All Articles"
                            : item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            {/* User Section */}
            <div className="shrink-0 border-t border-border-light dark:border-border-dark p-3">
              <div className="flex items-center gap-3 p-2 rounded-lg">
                <Avatar name={user?.name} size="md" color="primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-heading-light dark:text-text-heading-dark truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-text-para-light dark:text-text-para-dark">
                    {user?.email || ""}
                  </p>
                </div>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-text-para-light dark:text-text-para-dark hover:text-red-500 transition-colors"
                  aria-label="Logout"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
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
    </AnimatePresence>
  );
});

export default MobileDrawer;
