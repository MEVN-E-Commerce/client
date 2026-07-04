import api from './axios';

/**
 * Fetch the current user or guest cart.
 * @returns {Promise<Object>}
 */
export async function getCart() {
  const response = await api.get('/cart');
  return response.data;
}

/**
 * Add a product to the cart.
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Object>}
 */
export async function addItem(productId, quantity) {
  const response = await api.post('/cart/items', { productId, quantity });
  return response.data;
}

/**
 * Update the quantity of a cart item.
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Object>}
 */
export async function updateQuantity(productId, quantity) {
  const response = await api.patch(`/cart/items/${productId}`, { quantity });
  return response.data;
}

/**
 * Remove an item from the cart.
 * @param {string} productId
 * @returns {Promise<Object>}
 */
export async function removeItem(productId) {
  const response = await api.delete(`/cart/items/${productId}`);
  return response.data;
}

/**
 * Clear all items from the cart.
 * @returns {Promise<Object>}
 */
export async function clearCart() {
  const response = await api.delete('/cart');
  return response.data;
}

/**
 * Merge guest cart items into user cart on login.
 * @returns {Promise<Object>}
 */
export async function mergeCart() {
  const guestSessionId = localStorage.getItem('guestSessionId') || undefined;
  const response = await api.post('/cart/merge', { guestSessionId });
  return response.data;
}
