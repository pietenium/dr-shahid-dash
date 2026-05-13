import api from "./axios";

/**
 * Analytics API service
 * Provides geo statistics and page view analytics
 * All endpoints require authentication (handled by axios interceptor)
 */

/**
 * Fetch geographic distribution of visitors
 * Returns array of countries with visit counts
 * @returns {Promise<Object>} API response with geo stats array
 * @returns {Promise<Array<{_id: string, count: number, country: string}>>} returns.data - Geo aggregation results
 */
export async function getGeoStats() {
  const response = await api.get("/analytics/geo");
  return response.data;
}

/**
 * Fetch page view statistics
 * Returns array of pages with visit counts
 * @returns {Promise<Object>} API response with page stats array
 * @returns {Promise<Array<{_id: string, count: number, page: string}>>} returns.data - Page view aggregation results
 */
export async function getPageStats() {
  const response = await api.get("/analytics/pages");
  return response.data;
}
