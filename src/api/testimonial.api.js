import api from "./axios";

/**
 * Testimonial API service
 * Provides complete CRUD operations for patient testimonials
 * Handles multipart form data for image and video uploads
 */

/**
 * Fetch all testimonials (admin view - includes hidden)
 * @returns {Promise<Object>} Testimonials list response
 */
export async function getTestimonials() {
  const response = await api.get("/testimonials/admin");
  console.log(response.sata);
  return response.data;
}

/**
 * Fetch single testimonial by ID
 * @param {string} id - Testimonial MongoDB ID
 * @returns {Promise<Object>} Testimonial detail response
 */
export async function getTestimonialById(id) {
  const response = await api.get(`/testimonials/${id}`);
  return response.data;
}

/**
 * Create new testimonial (multipart form data)
 * @param {FormData} formData - Testimonial data with optional image/video
 * @returns {Promise<Object>} Created testimonial response
 */
export async function createTestimonial(formData) {
  const response = await api.post("/testimonials", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

/**
 * Update existing testimonial (multipart form data)
 * @param {string} id - Testimonial ID
 * @param {FormData} formData - Updated testimonial data
 * @returns {Promise<Object>} Updated testimonial response
 */
export async function updateTestimonial(id, formData) {
  const response = await api.patch(`/testimonials/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

/**
 * Delete testimonial by ID
 * @param {string} id - Testimonial ID
 * @returns {Promise<Object>} Deletion response
 */
export async function deleteTestimonial(id) {
  const response = await api.delete(`/testimonials/${id}`);
  return response.data;
}
