import api from "./axios";

/**
 * Activity Log API service
 * Provides activity log retrieval and management
 */

/**
 * Fetch paginated activity logs with filters
 * @param {Object} [params] - Query parameters
 * @param {string} [params.user] - Filter by user ID
 * @param {string} [params.module] - Filter by module name
 * @param {string} [params.startDate] - Filter by start date
 * @param {string} [params.endDate] - Filter by end date
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @returns {Promise<Object>} Paginated activity logs response
 */
export async function getActivityLogs(params = { limit: 10 }) {
  const response = await api.get("/activity-logs", { params });
  return response.data;
}
