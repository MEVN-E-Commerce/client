import api from './axios';

// ─── Dashboard ─────────────────────────────────────────────────────────────
export const fetchDashboardStats = () =>
  api.get('/admin/dashboard').then(r => r.data);

// ─── Users ─────────────────────────────────────────────────────────────────
export const fetchUsers = (params = {}) =>
  api.get('/admin/users', { params }).then(r => r.data);

export const fetchUserById = (id) =>
  api.get(`/admin/users/${id}`).then(r => r.data);

export const updateUserStatus = (id, body) =>
  api.patch(`/admin/users/${id}/status`, body).then(r => r.data);

// ─── Products ──────────────────────────────────────────────────────────────
export const fetchAdminProducts = (params = {}) =>
  api.get('/admin/products', { params }).then(r => r.data);

export const updateProductStatus = (id, body) =>
  api.patch(`/admin/products/${id}/status`, body).then(r => r.data);

// ─── Orders ────────────────────────────────────────────────────────────────
export const fetchAdminOrders = (params = {}) =>
  api.get('/admin/orders', { params }).then(r => r.data);

export const fetchAdminOrderById = (id) =>
  api.get(`/admin/orders/${id}`).then(r => r.data);

export const updateAdminOrderStatus = (id, body) =>
  api.patch(`/admin/orders/${id}/status`, body).then(r => r.data);

export const updateOrderShipping = (id, body) =>
  api.patch(`/admin/orders/${id}/shipping`, body).then(r => r.data);

// ─── Banners ───────────────────────────────────────────────────────────────
export const fetchBanners = () =>
  api.get('/admin/banners').then(r => r.data);

export const createBanner = (data) =>
  api.post('/admin/banners', data).then(r => r.data);

export const updateBanner = (id, data) =>
  api.put(`/admin/banners/${id}`, data).then(r => r.data);

export const updateBannerStatus = (id, body) =>
  api.patch(`/admin/banners/${id}/status`, body).then(r => r.data);

export const deleteBanner = (id) =>
  api.delete(`/admin/banners/${id}`).then(r => r.data);

export const uploadBannerImage = (formData) =>
  api.post('/admin/banners/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);
