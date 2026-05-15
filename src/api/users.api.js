import api from "./axios";

/**
 * Users API service
 * Provides user management operations (ADMIN only)
 * All endpoints require ADMIN role (enforced by backend)
 */

/**
 * Fetch paginated users list with filters
 * @param {Object} [params] - Query parameters
 * @param {'ADMIN'|'MODERATOR'} [params.role] - Filter by role
 * @param {boolean} [params.isActive] - Filter by active status
 * @param {string} [params.search] - Search by name or email
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @returns {Promise<Object>} Paginated users response
 */
export async function getUsers(params = {}) {
  const response = await api.get("/users", { params });
  return response.data;
}

/**
 * Invite a new moderator
 * Sends email with temporary password
 * @param {Object} data - { name: string, email: string }
 * @returns {Promise<Object>} Created moderator response
 */
export async function inviteModerator(data) {
  const response = await api.post("/users/invite", data);
  return response.data;
}

/**
 * Toggle user active/inactive status
 * @param {string} id - User ID to toggle
 * @returns {Promise<Object>} Updated user response
 */
export async function toggleUserActive(id) {
  const response = await api.patch(`/users/${id}/toggle-active`);
  return response.data;
}

/**
 * Delete a user permanently
 * @param {string} id - User ID to delete
 * @returns {Promise<Object>} Deletion response
 */
export async function deleteUser(id) {
  const response = await api.delete(`/users/${id}`);
  return response.data;
}
