import api from './axios';

/**
 * Get all products (with optional search, categoryId, minPrice, maxPrice, sellerId, and isActive)
 * @param {Object} params - Query filters
 * @returns {Promise<Object>} - { success: true, count: number, products: Array }
 */
export async function getProducts(params = {}) {
  const response = await api.get('/products', { params });
  return response.data;
}

/**
 * Get a single product by ID
 * @param {string} id
 * @returns {Promise<Object>} - { success: true, product: Object }
 */
export async function getProductById(id) {
  const response = await api.get(`/products/${id}`);
  return response.data;
}

/**
 * Create a new product (Seller or Admin)
 * @param {Object} productData
 * @returns {Promise<Object>} - { success: true, product: Object }
 */
export async function createProduct(productData) {
  const response = await api.post('/products', productData);
  return response.data;
}

/**
 * Update active product (Seller owner or Admin)
 * @param {string} id
 * @param {Object} productData
 * @returns {Promise<Object>} - { success: true, product: Object }
 */
export async function updateProduct(id, productData) {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
}

/**
 * Delete a product (Seller owner or Admin)
 * @param {string} id
 * @returns {Promise<Object>} - { success: true, message: string }
 */
export async function deleteProduct(id) {
  const response = await api.delete(`/products/${id}`);
  return response.data;
}

/**
 * Upload one or multiple product images
 * @param {FormData} formData
 * @returns {Promise<Object>} - { success: true, imageUrl: string, imageUrls: Array }
 */
export async function uploadProductImages(formData) {
  const response = await api.post('/products/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * Get all categories (Public)
 * @returns {Promise<Object>} - { success: true, count: number, categories: Array }
 */
export async function getCategories() {
  const response = await api.get('/categories');
  return response.data;
}

/**
 * Get a single category by ID
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function getCategoryById(id) {
  const response = await api.get(`/categories/${id}`);
  return response.data;
}

/**
 * Create a category (Admin only)
 * @param {Object} categoryData
 * @returns {Promise<Object>}
 */
export async function createCategory(categoryData) {
  const response = await api.post('/categories', categoryData);
  return response.data;
}

/**
 * Update a category (Admin only)
 * @param {string} id
 * @param {Object} categoryData
 * @returns {Promise<Object>}
 */
export async function updateCategory(id, categoryData) {
  const response = await api.put(`/categories/${id}`, categoryData);
  return response.data;
}

/**
 * Delete a category (Admin only)
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function deleteCategory(id) {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
}
