import api from "./axios";

/**
 * Appointment API service
 * Provides complete CRUD operations, bulk delete, and chart data for appointments
 */

/**
 * Fetch paginated appointments with optional filters
 * @param {Object} [params] - Query parameters
 * @param {'PENDING'|'CONFIRMED'|'CANCELLED'} [params.status] - Filter by status
 * @param {string} [params.chemberId] - Filter by chamber ID
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
 * Delete a single appointment
 * @param {string} id - Appointment ID
 * @returns {Promise<Object>} Deletion response
 */
export async function deleteAppointment(id) {
  const response = await api.delete(`/appointments/${id}`);
  return response.data;
}

/**
 * Bulk delete appointments by IDs or by status
 * @param {Object} payload - { ids?: string[], status?: string }
 * @returns {Promise<Object>} Bulk deletion response with deletedCount
 */
export async function bulkDeleteAppointments(payload) {
  const response = await api.delete("/appointments/bulk", { data: payload });
  return response.data;
}

/**
 * Fetch appointment chart data for analytics
 * @returns {Promise<Object>} Chart data response
 */
export async function getAppointmentCharts() {
  const response = await api.get("/appointments/charts");
  return response.data;
}
