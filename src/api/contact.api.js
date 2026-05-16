import api from "./axios";

/**
 * Contact Messages API service
 * Provides retrieval, status updates, and deletion of contact messages
 */

/**
 * Fetch paginated contact messages with filters
 * @param {Object} [params] - Query parameters
 * @param {string} [params.status] - UNREAD, READ, REPLIED, or ARCHIVED
 * @param {string} [params.search] - Search by name, email, or subject
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @returns {Promise<Object>} Paginated contact messages response
 */
export async function getContactMessages(params = {}) {
  const response = await api.get("/contact", { params });
  return response.data;
}

/**
 * Fetch single contact message by ID
 * @param {string} id - Message ID
 * @returns {Promise<Object>} Contact message detail response
 */
export async function getContactMessageById(id) {
  const response = await api.get(`/contact/${id}`);
  return response.data;
}

/**
 * Update contact message status
 * @param {string} id - Message ID
 * @param {'READ'|'REPLIED'|'ARCHIVED'} status - New status
 * @returns {Promise<Object>} Updated message response
 */
export async function updateContactStatus(id) {
  const response = await api.patch(`/contact/${id}/read`);
  return response.data;
}

/**
 * Delete a contact message
 * @param {string} id - Message ID
 * @returns {Promise<Object>} Deletion response
 */
export async function deleteContactMessage(id) {
  const response = await api.delete(`/contact/${id}`);
  return response.data;
}
