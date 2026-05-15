import api from "./axios";

/**
 * Research Papers API service
 * Provides complete CRUD operations for research papers
 * Handles multipart form data for PDF and thumbnail uploads
 */

/**
 * Fetch paginated research papers with filters (admin endpoint)
 * @param {Object} [params] - Query parameters
 * @param {string} [params.status] - DRAFT or PUBLISHED
 * @param {string} [params.uploadType] - PDF or DOI
 * @param {string} [params.search] - Search by title/description
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @returns {Promise<Object>} Paginated research papers response
 */
export async function getResearchList(params = {}) {
  const response = await api.get("/research/admin", { params });
  return response.data;
}

/**
 * Fetch single research paper by slug
 * @param {string} slug - Research paper slug
 * @returns {Promise<Object>} Research paper detail response
 */
export async function getResearchBySlug(slug) {
  const response = await api.get(`/research/slug/${slug}`);
  return response.data;
}

/**
 * Fetch research paper by ID (for getting slug before update/delete)
 * @param {string} id - Research paper MongoDB ID
 * @returns {Promise<Object>} Research paper data
 */
export async function getResearchById(id) {
  // Fetch from admin list and find by ID
  const listRes = await api.get("/research/admin", { params: { limit: 100 } });
  const paper = listRes.data?.data?.find((p) => p._id === id);
  if (!paper) throw new Error("Research paper not found");
  return { data: paper };
}

/**
 * Create new research paper (multipart form data)
 * @param {FormData} formData - Research paper data with optional files
 * @returns {Promise<Object>} Created research paper response
 */
export async function createResearch(formData) {
  const response = await api.post("/research", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

/**
 * Update existing research paper (multipart form data)
 * @param {string} id - Research paper ID
 * @param {FormData} formData - Updated research paper data
 * @returns {Promise<Object>} Updated research paper response
 */
export async function updateResearch(id, formData) {
  const response = await api.patch(`/research/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

/**
 * Delete research paper by ID
 * @param {string} id - Research paper ID
 * @returns {Promise<Object>} Deletion response
 */
export async function deleteResearch(id) {
  const response = await api.delete(`/research/${id}`);
  return response.data;
}
