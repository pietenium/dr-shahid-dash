import api from "./axios";

/**
 * Chambers API service
 * Provides CRUD operations for consultation chambers
 * GET is public, CUD requires ADMIN/MODERATOR auth
 */

/**
 * Fetch all chambers (public endpoint)
 * @returns {Promise<Object>} Chambers list response
 */
export async function getChambers() {
  const response = await api.get("/chambers");
  return response.data;
}

/**
 * Fetch single chamber by ID
 * @param {string} id - Chamber MongoDB ID
 * @returns {Promise<Object>} Chamber detail response
 */
export async function getChamberById(id) {
  const response = await api.get(`/chambers/${id}`);
  return response.data;
}

/**
 * Create a new chamber
 * @param {Object} data - Chamber data
 * @param {string} data.chemberName - Chamber name
 * @param {string} data.map - Google Maps embed URL
 * @param {Array} data.activeDates - Array of { activeDay, startTime, endTime }
 * @returns {Promise<Object>} Created chamber response
 */
export async function createChamber(data) {
  const response = await api.post("/chambers", data);
  return response.data;
}

/**
 * Update an existing chamber
 * @param {string} id - Chamber ID
 * @param {Object} data - Updated chamber data
 * @returns {Promise<Object>} Updated chamber response
 */
export async function updateChamber(id, data) {
  const response = await api.patch(`/chambers/${id}`, data);
  return response.data;
}

/**
 * Delete a chamber
 * @param {string} id - Chamber ID
 * @returns {Promise<Object>} Deletion response
 */
export async function deleteChamber(id) {
  const response = await api.delete(`/chambers/${id}`);
  return response.data;
}
