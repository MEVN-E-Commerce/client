import api from './axios';

/**
 * Register a new user.
 * @param {Object} data - { name, email, password }
 * @returns {Promise<Object>}
 */
export async function register(data) {
  const response = await api.post('/auth/register', data);
  return response.data;
}

/**
 * Log in a user.
 * @param {Object} data - { email, password }
 * @returns {Promise<Object>}
 */
export async function login(data) {
  const response = await api.post('/auth/login', data);
  return response.data;
}

/**
 * Log out the current user.
 * @returns {Promise<Object>}
 */
export async function logout() {
  const response = await api.post('/auth/logout');
  return response.data;
}

/**
 * Refresh current session access token using httpOnly cookie.
 * @returns {Promise<Object>}
 */
export async function refreshToken() {
  const response = await api.post('/auth/refresh');
  return response.data;
}

/**
 * Verify user email using token.
 * @param {string} token
 * @returns {Promise<Object>}
 */
export async function verifyEmail(token) {
  const response = await api.get(`/auth/verify-email/${token}`);
  return response.data;
}

/**
 * Resend email verification code/link.
 * @param {string} email
 * @returns {Promise<Object>}
 */
export async function resendVerification(email) {
  const response = await api.post('/auth/resend-verification', { email });
  return response.data;
}

/**
 * Get current user's profile.
 * @returns {Promise<Object>}
 */
export async function getProfile() {
  const response = await api.get('/auth/profile');
  return response.data;
}

/**
 * Update current user's profile name and/or addresses.
 * @param {Object} data - Profile updates (e.g. name, addresses array)
 * @returns {Promise<Object>}
 */
export async function updateProfile(data) {
  const response = await api.patch('/auth/profile', data);
  return response.data;
}

/**
 * Add a new address to user profile.
 * @param {Object} data - Address data
 * @returns {Promise<Object>}
 */
export async function addAddress(data) {
  const response = await api.post('/auth/profile/addresses', data);
  return response.data;
}

/**
 * Remove an address from user profile by ID.
 * @param {string} addressId
 * @returns {Promise<Object>}
 */
export async function removeAddress(addressId) {
  const response = await api.delete(`/auth/profile/addresses/${addressId}`);
  return response.data;
}

/**
 * Add a product to the user's wishlist.
 * @param {string} productId
 * @returns {Promise<Object>}
 */
export async function addToWishlist(productId) {
  const response = await api.post('/auth/wishlist', { productId });
  return response.data;
}

/**
 * Remove a product from the user's wishlist by ID.
 * @param {string} productId
 * @returns {Promise<Object>}
 */
export async function removeFromWishlist(productId) {
  const response = await api.delete(`/auth/wishlist/${productId}`);
  return response.data;
}
