import api from './axios';

/**
 * Create a new order.
 * @param {Object} orderData - { shippingAddress: {...}, contactEmail? }
 * @returns {Promise<Object>}
 */
export async function createOrder(orderData) {
  const response = await api.post('/orders', orderData);
  return response.data;
}

/**
 * Get paginated list of logged-in user's orders.
 * @param {number} [page=1]
 * @returns {Promise<Object>}
 */
export async function getOrders(page = 1) {
  const response = await api.get('/orders', { params: { page } });
  return response.data;
}

/**
 * Get detailed view of an order by ID.
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function getOrder(id) {
  const response = await api.get(`/orders/${id}`);
  return response.data;
}

/**
 * Look up an order as a guest.
 * @param {string} id
 * @param {string} email
 * @returns {Promise<Object>}
 */
export async function trackOrder(id, email) {
  const response = await api.get(`/orders/track/${id}`, { params: { email } });
  return response.data;
}
