/* eslint-disable no-unused-vars */
import { memo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCalendar,
  faEnvelope,
  faCheck,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useNotifications } from "@context/NotificationContext";
import { formatRelativeTime } from "@utils/formatDate";

/**
 * Notification type icon mapping
 */
const TYPE_ICONS = {
  NEW_APPOINTMENT: faCalendar,
  NEW_CONTACT_MESSAGE: faEnvelope,
};

/**
 * Notification type colors
 */
const TYPE_COLORS = {
  NEW_APPOINTMENT: "bg-blue-500",
  NEW_CONTACT_MESSAGE: "bg-green-500",
};

/**
 * NotificationBell - Header notification dropdown component
 * Shows unread badge, dropdown list, and navigation on click
 */
const NotificationBell = memo(function NotificationBell() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
    useNotifications();

  /**
   * Close dropdown on outside click
   */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /**
   * Handle notification click - navigate to relevant page
   * @param {Object} notification - Notification object
   */
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setIsOpen(false);

    if (notification.type === "NEW_APPOINTMENT") {
      navigate("/appointments");
    } else if (notification.type === "NEW_CONTACT_MESSAGE") {
      navigate("/contact");
    }
  };

  /**
   * Recent notifications to display (last 10)
   */
  const recentNotifications = notifications.slice(0, 10);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <FontAwesomeIcon
          icon={faBell}
          className="w-5 h-5 text-text-para-light dark:text-text-para-dark"
        />
        {/* Unread Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 shadow-md"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-light dark:border-border-dark">
              <h3 className="text-sm font-semibold text-text-heading-light dark:text-text-heading-dark">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-xs text-brand-primary font-medium">
                    ({unreadCount} new)
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-text-para-light hover:text-brand-primary transition-colors"
                    title="Mark all as read"
                  >
                    <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-text-para-light hover:text-red-500 transition-colors"
                    title="Clear all"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[400px] overflow-y-auto">
              {recentNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <FontAwesomeIcon
                    icon={faBell}
                    className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-3"
                  />
                  <p className="text-sm text-text-para-light dark:text-text-para-dark">
                    No notifications yet
                  </p>
                </div>
              ) : (
                recentNotifications.map((notification) => (
                  <motion.button
                    key={notification.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`
                      w-full flex items-start gap-3 px-4 py-3 text-left
                      hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
                      border-b border-border-light dark:border-border-dark last:border-0
                      ${!notification.read ? "bg-blue-50/30 dark:bg-blue-900/5" : ""}
                    `}
                  >
                    {/* Icon */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        notification.type === "NEW_APPOINTMENT"
                          ? "bg-blue-100 dark:bg-blue-900/20"
                          : "bg-green-100 dark:bg-green-900/20"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={TYPE_ICONS[notification.type] || faBell}
                        className={`w-3.5 h-3.5 ${
                          notification.type === "NEW_APPOINTMENT"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {!notification.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                        <p className="text-sm font-medium text-text-heading-light dark:text-text-heading-dark truncate">
                          {notification.type === "NEW_APPOINTMENT"
                            ? "New Appointment"
                            : "New Message"}
                        </p>
                      </div>
                      <p className="text-xs text-text-para-light dark:text-text-para-dark line-clamp-2 mb-1">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-text-para-light dark:text-text-para-dark">
                        {formatRelativeTime(
                          notification.timestamp || notification.receivedAt,
                        )}
                      </p>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default NotificationBell;
