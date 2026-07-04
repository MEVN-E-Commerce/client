import * as cartApi from '../../api/cart';

const state = () => ({
  items: [],
  loading: false,
  error: null,
});

const getters = {
  cartCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
  cartSubtotal: (state) => state.items.reduce((sum, item) => sum + ((item.priceAtAdd || item.productId?.price || 0) * item.quantity), 0),
  isEmpty: (state) => state.items.length === 0,
  loading: (state) => state.loading,
  error: (state) => state.error,
};

const mutations = {
  SET_ITEMS(state, items) {
    state.items = items || [];
  },
  SET_LOADING(state, isLoading) {
    state.loading = isLoading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
};

const actions = {
  async fetchCart({ commit }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const data = await cartApi.getCart();
      commit('SET_ITEMS', data.cart?.items);
      commit('SET_LOADING', false);
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch cart';
      commit('SET_ERROR', errorMsg);
      commit('SET_LOADING', false);
      throw error;
    }
  },

  async addItem({ commit }, { productId, quantity }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const data = await cartApi.addItem(productId, quantity);
      commit('SET_ITEMS', data.cart?.items);
      commit('SET_LOADING', false);
      return data;
    } catch (error) {
      commit('SET_LOADING', false);
      const errorMsg = error.response?.data?.message || 'Failed to add item to cart';
      commit('SET_ERROR', errorMsg);
      throw error;
    }
  },

  async updateQuantity({ commit }, { productId, quantity }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const data = await cartApi.updateQuantity(productId, quantity);
      commit('SET_ITEMS', data.cart?.items);
      commit('SET_LOADING', false);
      return data;
    } catch (error) {
      commit('SET_LOADING', false);
      const errorMsg = error.response?.data?.message || 'Failed to update quantity';
      commit('SET_ERROR', errorMsg);
      throw error;
    }
  },

  async removeItem({ commit }, productId) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const data = await cartApi.removeItem(productId);
      commit('SET_ITEMS', data.cart?.items);
      commit('SET_LOADING', false);
      return data;
    } catch (error) {
      commit('SET_LOADING', false);
      const errorMsg = error.response?.data?.message || 'Failed to remove item';
      commit('SET_ERROR', errorMsg);
      throw error;
    }
  },

  async clearCart({ commit }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const data = await cartApi.clearCart();
      commit('SET_ITEMS', []);
      commit('SET_LOADING', false);
      return data;
    } catch (error) {
      commit('SET_LOADING', false);
      const errorMsg = error.response?.data?.message || 'Failed to clear cart';
      commit('SET_ERROR', errorMsg);
      throw error;
    }
  },

  async mergeCart({ commit }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const data = await cartApi.mergeCart();
      commit('SET_ITEMS', data.cart?.items);
      localStorage.removeItem('guestSessionId');
      commit('SET_LOADING', false);
      return data;
    } catch (error) {
      commit('SET_LOADING', false);
      const errorMsg = error.response?.data?.message || 'Failed to merge cart';
      commit('SET_ERROR', errorMsg);
      throw error;
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
