import { useMemo } from "react";
import { useLocation } from "react-router";

/**
 * Route segment to human-readable label mapping
 * Handles dynamic segments and special cases
 * @constant {Object.<string, string>}
 */
const ROUTE_LABELS = {
  // Overview
  dashboard: "Dashboard",

  // Content
  articles: "Articles",
  categories: "Categories",
  create: "Create",
  edit: "Edit",

  // Research
  research: "Research",

  // Testimonials
  testimonials: "Testimonials",

  // Management
  appointments: "Appointments",
  charts: "Charts",
  contact: "Contact Messages",
  users: "Users",

  // System
  "activity-logs": "Activity Logs",
  "app-info": "App Info",
  settings: "Settings",
};

/**
 * Segments that represent dynamic IDs and should be labeled generically
 * @constant {Array.<string>}
 */
const DYNAMIC_SEGMENTS = ["id"];

/**
 * Custom hook that generates breadcrumb data from current URL path
 * Parses pathname into clickable breadcrumb segments with labels
 *
 * @returns {Array.<{label: string, path: string, active: boolean}>}
 *   Array of breadcrumb items with label, accumulated path, and active state
 *
 * @example
 * // URL: /articles/create
 * // Returns: [
 * //   { label: 'Articles', path: '/articles', active: false },
 * //   { label: 'Create', path: '/articles/create', active: true }
 * // ]
 */
export function useBreadcrumb() {
  const { pathname } = useLocation();

  const breadcrumbs = useMemo(() => {
    // Remove trailing slash and split into segments
    const cleanPath = pathname.replace(/\/$/, "");
    const segments = cleanPath.split("/").filter(Boolean);

    // Build breadcrumb items with accumulated paths
    return segments.map((segment, index) => {
      const accumulatedPath = "/" + segments.slice(0, index + 1).join("/");
      const isLast = index === segments.length - 1;

      // Check if segment is a dynamic ID (MongoDB ObjectId format or numeric)
      const isDynamicId =
        DYNAMIC_SEGMENTS.includes(segment) ||
        /^[a-f\d]{24}$/i.test(segment) ||
        /^\d+$/.test(segment);

      // Determine label: use mapping, or capitalize dynamic IDs as 'Detail'
      let label;
      if (isDynamicId) {
        // Check if next segment determines the context
        if (segments[index + 1] === "edit") {
          label = "Edit";
        } else {
          label = "Detail";
        }
      } else {
        label =
          ROUTE_LABELS[segment] ||
          segment.charAt(0).toUpperCase() + segment.slice(1);
      }

      return {
        label,
        path: accumulatedPath,
        active: isLast,
      };
    });
  }, [pathname]);

  return breadcrumbs;
}
