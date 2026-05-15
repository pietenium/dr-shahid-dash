import api from "./axios";

/**
 * Activity Log API service
 * Provides activity log retrieval, deletion, and bulk operations
 * Role-based scoping enforced by backend (MODERATOR sees own logs only)
 */

/**
 * Fetch paginated activity logs with filters
 * @param {Object} [params] - Query parameters
 * @param {string} [params.user] - Filter by user ID (ADMIN only)
 * @param {string} [params.module] - Filter by module name
 * @param {string} [params.startDate] - Filter by start date (ISO string)
 * @param {string} [params.endDate] - Filter by end date (ISO string)
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=20] - Items per page
 * @returns {Promise<Object>} Paginated activity logs response
 */
export async function getActivityLogs(params = {}) {
  const response = await api.get("/activity-logs", { params });
  return response.data;
}

/**
 * Delete a single activity log entry
 * @param {string} id - Log entry ID
 * @returns {Promise<Object>} Deletion response
 */
export async function deleteLog(id) {
  const response = await api.delete(`/activity-logs/${id}`);
  return response.data;
}

/**
 * Bulk delete multiple activity log entries
 * @param {string[]} ids - Array of log entry IDs
 * @returns {Promise<Object>} Bulk deletion response with deletedCount
 */
export async function bulkDeleteLogs(ids) {
  const response = await api.delete("/activity-logs/bulk", { data: { ids } });
  return response.data;
}

/**
 * Clear all activity logs (scoped by role)
 * ADMIN: clears all logs
 * MODERATOR: clears own logs only
 * @returns {Promise<Object>} Clear response with deletedCount
 */
export async function clearAllLogs() {
  const response = await api.delete("/activity-logs/clear");
  return response.data;
}
