import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

/**
 * Format an ISO date string to a readable format
 * @param {string} dateString - ISO date string
 * @param {string} [formatStr='MMM dd, yyyy'] - date-fns format string
 * @returns {string} Formatted date string or 'N/A'
 */
export function formatDate(dateString, formatStr = "MMM dd, yyyy") {
  if (!dateString) return "N/A";
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return "N/A";
    return format(date, formatStr);
  } catch {
    return "N/A";
  }
}

/**
 * Format an ISO date string to a relative time string
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return "N/A";
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return "N/A";
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "N/A";
  }
}

/**
 * Format date with time
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date and time
 */
export function formatDateTime(dateString) {
  return formatDate(dateString, "MMM dd, yyyy hh:mm a");
}
