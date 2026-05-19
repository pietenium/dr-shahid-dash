/* eslint-disable no-unused-vars */
import { memo, useMemo } from "react";
import { NavLink, useLocation } from "react-router";
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
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faSignOutAlt,
  faHospital,
} from "@fortawesome/free-solid-svg-icons";
import { useUIStore } from "@store/ui.store";
import { useAuth } from "@hooks/useAuth";
import Avatar from "@components/ui/Avatar";
import Tooltip from "@components/ui/Tooltip";
import ConfirmDialog from "@components/ui/ConfirmDialog";
import { useState } from "react";

import { useNotifications } from "@context/NotificationContext";
import { useQuery } from "@tanstack/react-query";
import { getAppointments } from "@api/appointment.api";
import { getContactMessages } from "@api/contact.api";
/**
 * Navigation item configuration
 * @typedef {Object} NavItem
 * @property {string} label - Display label
 * @property {string} path - Route path
 * @property {Object} icon - FontAwesome icon
 * @property {boolean} [adminOnly] - Only visible to ADMIN role
 * @property {Array<NavItem>} [children] - Sub-navigation items
 */

/**
 * Sidebar - Desktop navigation sidebar (≥1024px)
 *
 * Features:
 * - Collapsible: 260px expanded → 72px collapsed
 * - Spring animation for width transition (stiffness: 300, damping: 30)
 * - Tooltips on collapsed items showing full labels
 * - Active item with brand.primary background and left border indicator
 * - Articles sub-navigation with expandable chevron
 * - Role-based item visibility (ADMIN-only items)
 * - User profile card with logout at bottom
 *
 * @returns {JSX.Element} Desktop sidebar navigation
 */
const Sidebar = memo(function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Check if any articles sub-nav should be open
  const isArticlesActive = location.pathname.startsWith("/articles");

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
  /**
   * Main navigation items configuration
   * Articles has sub-navigation with collapsible children
   * @constant {Array.<NavItem>}
   */
  const navGroups = useMemo(
    () => [
      {
        label: "OVERVIEW",
        items: [
          {
            label: "Dashboard",
            path: "/dashboard",
            icon: faTableColumns,
          },
        ],
      },
      {
        label: "CONTENT",
        items: [
          {
            label: "Articles",
            path: "/articles",
            icon: faFileText,
            children: [
              { label: "All Articles", path: "/articles" },
              { label: "Categories", path: "/articles/categories" },
              { label: "Create Article", path: "/articles/create" },
            ],
          },
          {
            label: "Research",
            path: "/research",
            icon: faBookOpen,
          },
          {
            label: "Testimonials",
            path: "/testimonials",
            icon: faStar,
          },
        ],
      },
      {
        label: "MANAGEMENT",
        items: [
          {
            label: "Appointments",
            path: "/appointments",
            icon: faCalendar,
            badge: pendingCount > 0 ? pendingCount : null,
            badgeColor: "bg-yellow-500",
          },
          {
            label: "Contact Messages",
            path: "/contact",
            icon: faMessage,
            badge: unreadContactCount > 0 ? unreadContactCount : null,
            badgeColor: "bg-blue-500",
          },
          {
            label: "Users",
            path: "/users",
            icon: faUsers,
            adminOnly: true,
          },
          {
            label: "Chambers",
            path: "/chambers",
            icon: faHospital,
            adminOnly: true,
          },
        ],
      },
      {
        label: "SYSTEM",
        items: [
          {
            label: "Activity Logs",
            path: "/activity-logs",
            icon: faHeartbeat,
          },
          {
            label: "App Info",
            path: "/app-info",
            icon: faCog,
            adminOnly: true,
          },
          {
            label: "Settings",
            path: "/settings",
            icon: faUserCog,
          },
        ],
      },
    ],
    [pendingCount, unreadContactCount],
  );

  /**
   * Filter items by role (remove adminOnly items for MODERATOR)
   * @param {Array.<NavItem>} items - Navigation items
   * @returns {Array.<NavItem>} Filtered items
   */
  const filterByRole = (items) =>
    items.filter((item) => !item.adminOnly || isAdmin);

  /**
   * Handle logout confirmation
   */
  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  return (
    <>
      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 260 : 72,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className={`
          hidden lg:flex flex-col
          h-screen sticky top-0
          bg-card-light dark:bg-card-dark
          border-r border-border-light dark:border-border-dark
          overflow-hidden z-40 shrink-0
        `.trim()}
        role="navigation"
        aria-label="Main sidebar navigation"
        aria-expanded={sidebarOpen}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border-light dark:border-border-dark shrink-0">
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                key="expanded-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 overflow-hidden whitespace-nowrap"
              >
                {/* Brand Icon */}
                <div className="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">KS</span>
                </div>
                {/* Brand Name */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-heading-light dark:text-text-heading-dark leading-tight truncate">
                    Dr. Sahidur
                  </p>
                  <p className="text-[10px] text-text-para-light dark:text-text-para-dark leading-tight">
                    Admin Dashboard
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center w-full"
              >
                <div className="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center">
                  <span className="text-white font-bold text-sm">KS</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapse Toggle - only visible when expanded */}
          {sidebarOpen && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
              aria-label="Collapse sidebar"
            >
              <FontAwesomeIcon
                icon={faChevronLeft}
                className="w-3.5 h-3.5 text-text-para-light dark:text-text-para-dark"
              />
            </motion.button>
          )}
        </div>

        {/* Expand Button when Collapsed */}
        {!sidebarOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={toggleSidebar}
            className="mx-auto mt-3 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Expand sidebar"
          >
            <FontAwesomeIcon
              icon={faChevronRight}
              className="w-3.5 h-3.5 text-text-para-light dark:text-text-para-dark"
            />
          </motion.button>
        )}

        {/* Navigation Items - Scrollable */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4 scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.label}>
              {/* Section Header */}
              {sidebarOpen && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 mb-1.5 text-[10px] font-semibold text-text-para-light dark:text-text-para-dark uppercase tracking-wider"
                >
                  {group.label}
                </motion.p>
              )}

              {/* Section Items */}
              <div className="space-y-0.5">
                {filterByRole(group.items).map((item) => (
                  <NavItemComponent
                    key={item.path}
                    item={item}
                    collapsed={!sidebarOpen}
                    isArticlesActive={isArticlesActive}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom: User Profile + Logout */}
        <div className="shrink-0 border-t border-border-light dark:border-border-dark p-2">
          {sidebarOpen ? (
            /* Expanded User Card */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <Avatar name={user?.name} size="sm" color="primary" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text-heading-light dark:text-text-heading-dark truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-[10px] text-text-para-light dark:text-text-para-dark truncate">
                  {user?.role || "Role"}
                </p>
              </div>
              <Tooltip content="Logout" position="top">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-text-para-light dark:text-text-para-dark hover:text-red-500 transition-colors"
                  aria-label="Logout"
                >
                  <FontAwesomeIcon
                    icon={faSignOutAlt}
                    className="w-3.5 h-3.5"
                  />
                </button>
              </Tooltip>
            </motion.div>
          ) : (
            /* Collapsed User Icon */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <Avatar name={user?.name} size="sm" color="primary" />
              <Tooltip content="Logout" position="right">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-text-para-light dark:text-text-para-dark hover:text-red-500 transition-colors"
                  aria-label="Logout"
                >
                  <FontAwesomeIcon
                    icon={faSignOutAlt}
                    className="w-3.5 h-3.5"
                  />
                </button>
              </Tooltip>
            </motion.div>
          )}
        </div>
      </motion.aside>

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

/**
 * Individual navigation item component
 * Handles active states, sub-navigation expansion, collapsed tooltips
 *
 * @param {Object} props
 * @param {NavItem} props.item - Navigation item configuration
 * @param {boolean} props.collapsed - Whether sidebar is collapsed
 * @param {boolean} props.isArticlesActive - Whether articles section is active
 */
const NavItemComponent = memo(function NavItemComponent({
  item,
  collapsed,
  isArticlesActive,
}) {
  const [subNavOpen, setSubNavOpen] = useState(isArticlesActive);

  // Toggle sub-nav when clicking parent in collapsed mode
  const hasChildren = !!item.children;

  /**
   * Handle click on nav item
   * If collapsed and has children, toggle sub-nav instead of navigating
   */
  const handleItemClick = (e) => {
    if (collapsed && hasChildren) {
      e.preventDefault();
      setSubNavOpen((prev) => !prev);
    }
  };

  return (
    <div>
      {/* Parent Item */}
      <Tooltip content={collapsed ? item.label : null} position="right">
        <NavLink
          to={item.path}
          onClick={handleItemClick}
          end={item.path === "/dashboard" || !hasChildren}
          className={({ isActive }) =>
            `
            flex items-center gap-3 px-3 py-2.5 rounded-lg
            transition-all duration-200 group
            ${
              isActive
                ? "bg-brand-softbg dark:bg-brand-primary/10 text-brand-primary border-l-[3px] border-brand-primary"
                : "text-text-para-light dark:text-text-para-dark hover:bg-brand-softbg/50 dark:hover:bg-brand-primary/5 border-l-[3px] border-transparent"
            }
            ${collapsed ? "justify-center" : ""}
          `.trim()
          }
          aria-label={item.label}
        >
          <FontAwesomeIcon
            icon={item.icon}
            className={`w-4 h-4 shrink-0 ${collapsed ? "w-5 h-5" : ""}`}
            fixedWidth
          />

          {/* Label - hidden when collapsed */}
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm font-medium truncate flex-1"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
          {/* Badge - shown when collapsed or expanded */}
          {item.badge && (
            <span
              className={`
              ${item.badgeColor || "bg-red-500"} 
              text-white text-[10px] font-bold 
              min-w-[18px] h-[18px] flex items-center justify-center 
              rounded-full px-1
              ${collapsed ? "absolute -top-0.5 -right-0.5" : "ml-auto"}
            `}
            >
              {item.badge > 99 ? "99+" : item.badge}
            </span>
          )}
          {/* Sub-nav Chevron */}
          {hasChildren && !collapsed && (
            <motion.button
              animate={{ rotate: subNavOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSubNavOpen(!subNavOpen);
              }}
              className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={
                subNavOpen ? "Collapse articles menu" : "Expand articles menu"
              }
            >
              <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3" />
            </motion.button>
          )}
        </NavLink>
      </Tooltip>

      {/* Sub-navigation for Articles */}
      <AnimatePresence>
        {hasChildren && subNavOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden ml-4 mt-0.5 space-y-0.5"
          >
            {item.children.map((child) => (
              <NavLink
                key={child.path}
                to={child.path}
                end={child.path === "/articles"}
                className={({ isActive }) =>
                  `
                  flex items-center px-3 py-2 rounded-lg text-sm
                  transition-all duration-200
                  ${
                    isActive
                      ? "text-brand-primary bg-brand-softbg/50 dark:bg-brand-primary/5 font-medium"
                      : "text-text-para-light dark:text-text-para-dark hover:text-text-heading-light dark:hover:text-text-heading-dark hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }
                `.trim()
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current mr-2.5 opacity-60 shrink-0" />
                <span className="truncate">{child.label}</span>
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default Sidebar;
