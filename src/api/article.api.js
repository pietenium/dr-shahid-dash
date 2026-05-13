import api from "./axios";

/**
 * Article API service - Extended with dashboard-specific endpoints
 */

/**
 * Fetch featured articles sorted by impressions
 * @param {Object} [params] - Query parameters
 * @param {number} [params.limit=5] - Number of articles to return
 * @param {number} [params.minImpressions=1000] - Minimum impressions threshold
 * @returns {Promise<Object>} Featured articles response
 */
export async function getFeaturedArticles(params = { limit: 5 }) {
  const response = await api.get("/articles/featured", { params });
  return response.data;
}

/**
 * Fetch top articles grouped by category
 * @param {Object} [params] - Query parameters
 * @param {string} [params.categoryId] - Specific category ID (optional, returns all if omitted)
 * @param {number} [params.limit=5] - Articles per category
 * @param {string} [params.articleType] - Filter by article type (medical/political)
 * @returns {Promise<Object>} Categories with their top articles
 */
export async function getTopArticlesByCategory(params = { limit: 5 }) {
  const response = await api.get("/articles/top-by-category", { params });
  return response.data;
}
