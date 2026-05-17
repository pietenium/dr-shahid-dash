/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useAuthStore } from "@store/auth.store";
import { getSocket, disconnectSocket } from "@lib/socket";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Maximum number of notifications to store
 * @constant {number}
 */
const MAX_NOTIFICATIONS = 50;

/**
 * Notification Context
 * Provides real-time notification state to the entire app
 */
const NotificationContext = createContext(null);

/**
 * NotificationProvider - Wraps the app with notification state
 * Connects to Socket.IO, listens for events, manages notification state
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [appointmentUnread, setAppointmentUnread] = useState(0);
  const [contactUnread, setContactUnread] = useState(0);
  const queryClient = useQueryClient();
  const socketRef = useRef(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addNotification = useCallback((notification) => {
    setNotifications((prev) => {
      const newNotification = {
        ...notification,
        id: `${notification.type}-${notification.data?.id || Date.now()}`,
        read: false,
        receivedAt: new Date().toISOString(),
      };
      const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
      return updated;
    });
    setUnreadCount((prev) => prev + 1);
  }, []);
  const showToast = useCallback((notification) => {
    const { type, message } = notification;

    if (type === "NEW_APPOINTMENT") {
      toast.info(message, {
        description: `Patient: ${notification.data?.patientName}`,
        action: {
          label: "View",
          onClick: () => (window.location.href = "/appointments"),
        },
        duration: 6000,
      });
    } else if (type === "NEW_CONTACT_MESSAGE") {
      toast.info(message, {
        description: `From: ${notification.data?.senderName}`,
        action: {
          label: "View",
          onClick: () => (window.location.href = "/contact"),
        },
        duration: 6000,
      });
    }
  }, []);
  /**
   * Initialize socket connection when authenticated
   */
  useEffect(() => {
    if (isAuthenticated) {
      const socket = getSocket();
      socketRef.current = socket;

      if (socket) {
        /**
         * Handle general notifications
         */
        socket.on("notification", (notification) => {
          addNotification(notification);
          showToast(notification);
        });

        /**
         * Handle new appointment notifications
         */
        socket.on("new:appointment", (notification) => {
          addNotification(notification);
          setAppointmentUnread((prev) => prev + 1);
          showToast(notification);
          // Auto-refresh appointment list if data exists in cache
          queryClient.invalidateQueries({ queryKey: ["appointments"] });
          queryClient.invalidateQueries({
            queryKey: ["appointments", "charts"],
          });
        });

        /**
         * Handle new contact message notifications
         */
        socket.on("new:contact", (notification) => {
          addNotification(notification);
          setContactUnread((prev) => prev + 1);
          showToast(notification);
          // Auto-refresh contact list if data exists in cache
          queryClient.invalidateQueries({ queryKey: ["contact"] });
        });
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("notification");
        socketRef.current.off("new:appointment");
        socketRef.current.off("new:contact");
      }
    };
  }, [isAuthenticated, queryClient, addNotification, showToast]);

  /**
   * Disconnect socket on logout
   */
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      setNotifications([]);
      setUnreadCount(0);
      setAppointmentUnread(0);
      setContactUnread(0);
    }
  }, [isAuthenticated]);

  /**
   * Add a notification to the store
   * @param {Object} notification - Notification object from socket
   */

  /**
   * Show toast for notification
   * @param {Object} notification - Notification object
   */

  /**
   * Mark a single notification as read
   * @param {string} id - Notification ID
   */
  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    setAppointmentUnread(0);
    setContactUnread(0);
  }, []);

  /**
   * Clear all notifications
   */
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    setAppointmentUnread(0);
    setContactUnread(0);
  }, []);

  /**
   * Reset appointment unread count (when user visits appointments page)
   */
  const resetAppointmentUnread = useCallback(() => {
    setAppointmentUnread(0);
  }, []);

  /**
   * Reset contact unread count (when user visits contact page)
   */
  const resetContactUnread = useCallback(() => {
    setContactUnread(0);
  }, []);

  const value = {
    notifications,
    unreadCount,
    appointmentUnread,
    contactUnread,
    markAsRead,
    markAllAsRead,
    clearAll,
    resetAppointmentUnread,
    resetContactUnread,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Custom hook to access notification context
 * @returns {Object} Notification state and methods
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  }
  return context;
}
