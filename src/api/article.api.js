import api from "./axios";

/**
 * Article API service - Extended with dashboard-specific endpoints
 */

export async function getFeaturedArticles(params = { limit: 5 }) {
  const response = await api.get("/articles/featured", { params });
  return response.data;
}

export async function getTopArticlesByCategory(params = { limit: 5 }) {
  const response = await api.get("/articles/top-by-category", { params });
  return response.data;
}

/**
 * Article API service
 * Provides complete CRUD operations for articles and categories
 * Handles multipart form data for image uploads
 */

/**
 * Fetch paginated articles with filters (admin endpoint)
 * @param {Object} [params] - Query parameters
 * @param {string} [params.status] - DRAFT or PUBLISHED
 * @param {string} [params.articleType] - MEDICAL or POLITICAL
 * @param {string} [params.category] - Category ID
 * @param {string} [params.search] - Search title/content
 * @param {string} [params.sort] - newest or oldest
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @returns {Promise<Object>} Paginated articles response
 */
export async function getArticles(params = {}) {
  const response = await api.get("/articles/admin", { params });
  return response.data;
}

/**
 * Fetch single article by slug
 * @param {string} slug - Article slug
 * @returns {Promise<Object>} Article detail response
 */
export async function getArticleBySlug(slug) {
  const response = await api.get(`/articles/slug/${slug}`);
  return response.data;
}

/**
 * Create new article (multipart form data)
 * @param {FormData} formData - Article data with optional images
 * @returns {Promise<Object>} Created article response
 */
export async function createArticle(formData) {
  const response = await api.post("/articles", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

/**
 * Update existing article (multipart form data)
 * @param {string} id - Article ID
 * @param {FormData} formData - Updated article data
 * @returns {Promise<Object>} Updated article response
 */
export async function updateArticle(id, formData) {
  const response = await api.patch(`/articles/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

/**
 * Delete article by ID
 * @param {string} id - Article ID
 * @returns {Promise<Object>} Deletion response
 */
export async function deleteArticle(id) {
  const response = await api.delete(`/articles/${id}`);
  return response.data;
}

/**
 * Fetch all article categories
 * @returns {Promise<Object>} Categories response
 */
export async function getCategories() {
  const response = await api.get("/articles/categories");
  return response.data;
}

/**
 * Create new category
 * @param {Object} data - { name, description? }
 * @returns {Promise<Object>} Created category response
 */
export async function createCategory(data) {
  const response = await api.post("/articles/categories", data);
  return response.data;
}

/**
 * Update category
 * @param {string} id - Category ID
 * @param {Object} data - { name?, description? }
 * @returns {Promise<Object>} Updated category response
 */
export async function updateCategory(id, data) {
  const response = await api.patch(`/articles/categories/${id}`, data);
  return response.data;
}

/**
 * Delete category
 * @param {string} id - Category ID
 * @returns {Promise<Object>} Deletion response
 */
export async function deleteCategory(id) {
  const response = await api.delete(`/articles/categories/${id}`);
  return response.data;
}

/**
 * Upload image file to server
 * @param {File} file - Image file to upload
 * @returns {Promise<Object>} Upload response with url and fileId
 */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}
