import api from './axios';

/**
 * Fetch health status of the backend API
 * @returns {Promise<Object>} The API response data
 */
export async function getHealth() {
  const response = await api.get('/health');
  return response.data;
}
