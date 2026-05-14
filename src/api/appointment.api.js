import api from "./axios";

/**
 * Appointment API service
 * Provides complete CRUD operations and chart data for appointments
 * All endpoints require authentication (handled by axios interceptor)
 */

/**
 * Fetch paginated appointments with optional filters
 * @param {Object} [params] - Query parameters
 * @param {'PENDING'|'CONFIRMED'|'CANCELLED'} [params.status] - Filter by status
 * @param {string} [params.startDate] - Filter by start date (ISO string)
 * @param {string} [params.endDate] - Filter by end date (ISO string)
 * @param {string} [params.search] - Search by name or phone
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @returns {Promise<Object>} Paginated appointments response
 * @returns {Array} returns.data.results - Array of appointment objects
 * @returns {Object} returns.data.pagination - Pagination metadata
 */
export async function getAppointments(params = {}) {
  const response = await api.get("/appointments", { params });
  return response.data;
}

/**
 * Fetch a single appointment by ID
 * @param {string} id - Appointment MongoDB ID
 * @returns {Promise<Object>} Appointment detail response
 */
export async function getAppointmentById(id) {
  const response = await api.get(`/appointments/${id}`);
  return response.data;
}

/**
 * Update appointment status
 * @param {string} id - Appointment MongoDB ID
 * @param {'CONFIRMED'|'CANCELLED'} status - New status
 * @returns {Promise<Object>} Updated appointment response
 */
export async function updateAppointmentStatus(id, status) {
  const response = await api.patch(`/appointments/${id}/status`, { status });
  return response.data;
}

/**
 * Fetch appointment chart data for analytics
 * @returns {Promise<Object>} Chart data response
 * @returns {Array} returns.data.dailyCounts - Daily counts (last 30 days)
 * @returns {Array} returns.data.monthlyCounts - Monthly counts (last 12 months)
 * @returns {number} returns.data.totalCount - Total appointment count
 * @returns {Array} returns.data.statusDistribution - Counts by status
 */
export async function getAppointmentCharts() {
  const response = await api.get("/appointments/charts");
  return response.data;
}
