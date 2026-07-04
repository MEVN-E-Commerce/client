import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let store;

export const injectStore = (s) => {
  store = s;
};

// REQUEST Interceptor: Attach access token from Vuex store if it exists
api.interceptors.request.use(
  (config) => {
    const token = store?.state.auth?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Attach guestSessionId on cart/orders calls if not authenticated
      const guestSessionId = localStorage.getItem('guestSessionId');
      if (guestSessionId && (config.url.includes('/cart') || config.url.includes('/orders'))) {
        config.headers['X-Guest-Session-Id'] = guestSessionId;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE Interceptor: Handle token expiration (401) and run rotation
api.interceptors.response.use(
  (response) => {
    // Store X-Guest-Session-Id if returned by backend
    const guestSessionHeader = response.headers['x-guest-session-id'] || response.headers['X-Guest-Session-Id'];
    if (guestSessionHeader) {
      localStorage.setItem('guestSessionId', guestSessionHeader);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Check if unauthorized, request not retried yet, and isn't login/refresh/logout to prevent loop
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url &&
      !originalRequest.url.includes('/auth/refresh') &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/logout')
    ) {
      originalRequest._retry = true;
      
      try {
        if (!store) {
          throw new Error('Store reference not injected in axios client');
        }
        
        // Dispatch store action to refresh access token
        const newAccessToken = await store.dispatch('auth/refreshAccessToken');
        
        // Update header and retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh itself fails, log the user out (clears state)
        if (store) {
          await store.dispatch('auth/logout');
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
