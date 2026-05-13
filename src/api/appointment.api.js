import api from "./axios";

/**
 * Appointment API service
 * Provides appointment CRUD operations and chart data
 */

/**
 * Fetch paginated appointments with optional filters
 * @param {Object} params - Query parameters
 * @param {string} [params.status] - Filter by status (PENDING/CONFIRMED/CANCELLED)
 * @param {string} [params.startDate] - Filter by start date (ISO string)
 * @param {string} [params.endDate] - Filter by end date (ISO string)
 * @param {string} [params.search] - Search by name or phone
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @returns {Promise<Object>} Paginated appointments response
 */
export async function getAppointments(params = {}) {
  const response = await api.get("/appointments", { params });
  return response.data;
}

/**
 * Fetch appointment chart data for analytics
 * Returns daily counts, monthly counts, total, and status distribution
 * @returns {Promise<Object>} Chart data response
 * @returns {Promise<Array>} returns.data.dailyCounts - Last 30 days daily counts
 * @returns {Promise<Array>} returns.data.monthlyCounts - Last 12 months monthly counts
 * @returns {Promise<number>} returns.data.totalCount - Total appointment count
 * @returns {Promise<Object>} returns.data.statusDistribution - Counts by status
 */
export async function getAppointmentCharts() {
  const response = await api.get("/appointments/charts");
  return response.data;
}
