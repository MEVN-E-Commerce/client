import api from './axios';

export async function createPromoCode(data) {
  const response = await api.post('/bonus/promo-codes', data);
  return response.data;
}

export async function getPromoCodes() {
  const response = await api.get('/bonus/promo-codes');
  return response.data;
}

export async function validatePromoCode(code, subtotal) {
  const response = await api.get(`/bonus/promo-codes/${code}/validate`, {
    params: { subtotal }
  });
  return response.data;
}

export async function updatePromoCode(id, data) {
  const response = await api.put(`/bonus/promo-codes/${id}`, data);
  return response.data;
}

export async function deletePromoCode(id) {
  const response = await api.delete(`/bonus/promo-codes/${id}`);
  return response.data;
}

export async function createReview(data) {
  const response = await api.post('/bonus/reviews', data);
  return response.data;
}

export async function getProductReviews(productId) {
  const response = await api.get(`/bonus/reviews/product/${productId}`);
  return response.data;
}

export async function getLoyaltyPoints() {
  const response = await api.get('/bonus/loyalty');
  return response.data;
}
