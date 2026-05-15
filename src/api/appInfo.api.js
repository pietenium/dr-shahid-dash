import api from "./axios";

/**
 * App Info API service
 * Provides read and update operations for application settings
 * Only ADMIN and MODERATOR roles can update (enforced by backend)
 */

/**
 * Fetch current app information
 * @returns {Promise<Object>} App info data response
 */
export async function getAppInfo() {
  const response = await api.get("/app-info");
  return response.data;
}

/**
 * Update app information (supports multipart form data for images)
 * Only sends changed fields to the backend
 * @param {FormData} formData - FormData with changed fields and optional images
 * @returns {Promise<Object>} Updated app info response
 */
export async function updateAppInfo(formData) {
  const response = await api.patch("/app-info", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}
