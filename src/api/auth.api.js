import api from './axios';

/**
 * Authentication API service
 * All functions return the validated API response from the backend
 * Backend handles httpOnly refreshToken cookie automatically
 * 
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Operation success status
 * @property {number} statusCode - HTTP status code
 * @property {string} message - Response message
 * @property {Object} data - Response data payload
 */

/**
 * Authenticate user with email and password
 * Sets httpOnly refreshToken cookie automatically on success
 * @param {string} email - User email address
 * @param {string} password - User password
 * @returns {Promise<ApiResponse>} Response with user object and accessToken
 * @throws {Error} 401 - Invalid credentials
 * @throws {Error} 403 - Account inactive or blocked
 * @throws {Error} 429 - Rate limit exceeded
 */
export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
}

/**
 * Send OTP to user's email for password reset
 * Always returns success to prevent user enumeration
 * @param {string} email - User email address
 * @returns {Promise<ApiResponse>} Always returns success response
 */
export async function forgotPassword(email) {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
}

/**
 * Verify OTP sent to email
 * Returns magicToken for password reset or magic login
 * @param {string} email - User email address
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<ApiResponse>} Response with magicToken
 * @throws {Error} 400 - Invalid or expired OTP
 */
export async function verifyOtp(email, otp) {
  const response = await api.post('/auth/verify-otp', { email, otp });
  return response.data;
}

/**
 * Perform magic login after OTP verification
 * Automatically receives httpOnly refreshToken cookie
 * @param {string} email - User email address
 * @param {string} magicToken - Token from OTP verification
 * @returns {Promise<ApiResponse>} Response with user object and accessToken
 * @throws {Error} 401 - Invalid or expired magic token
 */
export async function magicLogin(email, magicToken) {
  const response = await api.post('/auth/magic-login', { email, magicToken });
  return response.data;
}

/**
 * Reset password using magic token from OTP verification
 * @param {string} email - User email address
 * @param {string} magicToken - Token from OTP verification
 * @param {string} newPassword - New password meeting complexity requirements
 * @returns {Promise<ApiResponse>} Success confirmation
 * @throws {Error} 400 - Password doesn't meet requirements
 * @throws {Error} 401 - Invalid or expired magic token
 */
export async function resetPassword(email, magicToken, newPassword) {
  const response = await api.post('/auth/reset-password', {
    email,
    magicToken,
    newPassword,
  });
  return response.data;
}

/**
 * Refresh expired access token using httpOnly refreshToken cookie
 * Called automatically by axios interceptor on 401 responses
 * @returns {Promise<ApiResponse>} Response with new accessToken and user
 * @throws {Error} 401 - Refresh token expired or invalid
 */
export async function refreshToken() {
  const response = await api.post('/auth/refresh-token');
  return response.data;
}

/**
 * Logout current user
 * Invalidates refreshToken cookie on server
 * @returns {Promise<ApiResponse>} Success confirmation
 */
export async function logout() {
  const response = await api.post('/auth/logout');
  return response.data;
}