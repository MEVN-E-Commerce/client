import api from './axios';

/**
 * Generate a Stripe checkout session for a given order.
 * @param {string} orderId
 * @returns {Promise<Object>} - { url }
 */
export async function createCheckoutSession(orderId) {
  const response = await api.post('/payments/checkout-session', { orderId });
  return response.data;
}
