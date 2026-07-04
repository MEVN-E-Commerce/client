import api from './axios';

export async function registerSeller(data) {
  const response = await api.post('/sellers/register', data);
  return response.data;
}

export async function getSellerProfile() {
  const response = await api.get('/sellers/profile');
  return response.data;
}

export async function updateSellerProfile(data) {
  const response = await api.put('/sellers/profile', data);
  return response.data;
}

export async function getDashboardStats() {
  const response = await api.get('/sellers/dashboard/stats');
  return response.data;
}

export async function getSellerProducts() {
  const response = await api.get('/sellers/products');
  return response.data;
}

export async function updateProductStock(id, stock) {
  const response = await api.patch(`/sellers/products/${id}/stock`, { stock });
  return response.data;
}

export async function getSellerOrders() {
  const response = await api.get('/sellers/orders');
  return response.data;
}

export async function updateSellerOrderStatus(id, status) {
  const response = await api.patch(`/sellers/orders/${id}/status`, { status });
  return response.data;
}
