import * as adminApi from '../../api/admin';

const defaultPagination = () => ({ total: 0, page: 1, limit: 15, pages: 0 });

const state = () => ({
  dashboard: { stats: null, loading: false, error: null },
  users: {
    list: [], pagination: defaultPagination(),
    filters: { search: '', role: '', isActive: '', isVerified: '' },
    loading: false, error: null
  },
  products: {
    list: [], pagination: defaultPagination(),
    filters: { search: '', categoryId: '', isActive: 'all' },
    loading: false, error: null
  },
  orders: {
    list: [], pagination: defaultPagination(),
    filters: { search: '', status: '', paymentStatus: '', dateFrom: '', dateTo: '' },
    loading: false, error: null
  },
  banners: { list: [], loading: false, error: null }
});

const mutations = {
  // Dashboard
  SET_DASHBOARD_LOADING(state, v) { state.dashboard.loading = v; },
  SET_DASHBOARD_ERROR(state, e) { state.dashboard.error = e; },
  SET_DASHBOARD_STATS(state, stats) { state.dashboard.stats = stats; },

  // Users
  SET_USERS_LOADING(state, v) { state.users.loading = v; },
  SET_USERS_ERROR(state, e) { state.users.error = e; },
  SET_USERS(state, { users, total, page, limit, pages }) {
    state.users.list = users;
    state.users.pagination = { total, page, limit, pages };
  },
  SET_USERS_FILTERS(state, filters) { Object.assign(state.users.filters, filters); },
  PATCH_USER(state, updatedUser) {
    const idx = state.users.list.findIndex(u => u._id === updatedUser._id);
    if (idx !== -1) state.users.list.splice(idx, 1, updatedUser);
  },

  // Products
  SET_PRODUCTS_LOADING(state, v) { state.products.loading = v; },
  SET_PRODUCTS_ERROR(state, e) { state.products.error = e; },
  SET_ADMIN_PRODUCTS(state, { products, total, page, limit, pages }) {
    state.products.list = products;
    state.products.pagination = { total, page, limit, pages };
  },
  SET_PRODUCTS_FILTERS(state, filters) { Object.assign(state.products.filters, filters); },
  PATCH_PRODUCT(state, updated) {
    const idx = state.products.list.findIndex(p => p._id === updated._id);
    if (idx !== -1) state.products.list.splice(idx, 1, updated);
  },

  // Orders
  SET_ORDERS_LOADING(state, v) { state.orders.loading = v; },
  SET_ORDERS_ERROR(state, e) { state.orders.error = e; },
  SET_ADMIN_ORDERS(state, { orders, total, page, limit, pages }) {
    state.orders.list = orders;
    state.orders.pagination = { total, page, limit, pages };
  },
  SET_ORDERS_FILTERS(state, filters) { Object.assign(state.orders.filters, filters); },
  PATCH_ORDER(state, updated) {
    const idx = state.orders.list.findIndex(o => o._id === updated._id);
    if (idx !== -1) state.orders.list.splice(idx, 1, updated);
  },

  // Banners
  SET_BANNERS_LOADING(state, v) { state.banners.loading = v; },
  SET_BANNERS_ERROR(state, e) { state.banners.error = e; },
  SET_BANNERS(state, banners) { state.banners.list = banners; },
  ADD_BANNER(state, banner) { state.banners.list.push(banner); },
  PATCH_BANNER(state, updated) {
    const idx = state.banners.list.findIndex(b => b._id === updated._id);
    if (idx !== -1) state.banners.list.splice(idx, 1, updated);
  },
  REMOVE_BANNER(state, id) {
    state.banners.list = state.banners.list.filter(b => b._id !== id);
  }
};

const actions = {
  // Dashboard
  async fetchDashboard({ commit }) {
    commit('SET_DASHBOARD_LOADING', true);
    commit('SET_DASHBOARD_ERROR', null);
    try {
      const data = await adminApi.fetchDashboardStats();
      commit('SET_DASHBOARD_STATS', data);
    } catch (err) {
      commit('SET_DASHBOARD_ERROR', err.response?.data?.message || 'Failed to load dashboard');
      throw err;
    } finally {
      commit('SET_DASHBOARD_LOADING', false);
    }
  },

  // Users
  async fetchUsers({ commit, state }, overrides = {}) {
    commit('SET_USERS_LOADING', true);
    commit('SET_USERS_ERROR', null);
    try {
      const params = { ...state.users.filters, page: state.users.pagination.page, limit: state.users.pagination.limit, ...overrides };
      const data = await adminApi.fetchUsers(params);
      commit('SET_USERS', data);
    } catch (err) {
      commit('SET_USERS_ERROR', err.response?.data?.message || 'Failed to load users');
      throw err;
    } finally {
      commit('SET_USERS_LOADING', false);
    }
  },
  async updateUserStatus({ commit }, { id, body }) {
    const data = await adminApi.updateUserStatus(id, body);
    commit('PATCH_USER', data.user);
    return data;
  },

  // Products
  async fetchAdminProducts({ commit, state }, overrides = {}) {
    commit('SET_PRODUCTS_LOADING', true);
    commit('SET_PRODUCTS_ERROR', null);
    try {
      const params = { ...state.products.filters, page: state.products.pagination.page, limit: state.products.pagination.limit, ...overrides };
      const data = await adminApi.fetchAdminProducts(params);
      commit('SET_ADMIN_PRODUCTS', data);
    } catch (err) {
      commit('SET_PRODUCTS_ERROR', err.response?.data?.message || 'Failed to load products');
      throw err;
    } finally {
      commit('SET_PRODUCTS_LOADING', false);
    }
  },
  async updateProductStatus({ commit }, { id, isActive }) {
    const data = await adminApi.updateProductStatus(id, { isActive });
    commit('PATCH_PRODUCT', data.product);
    return data;
  },

  // Orders
  async fetchAdminOrders({ commit, state }, overrides = {}) {
    commit('SET_ORDERS_LOADING', true);
    commit('SET_ORDERS_ERROR', null);
    try {
      const params = { ...state.orders.filters, page: state.orders.pagination.page, limit: state.orders.pagination.limit, ...overrides };
      const data = await adminApi.fetchAdminOrders(params);
      commit('SET_ADMIN_ORDERS', data);
    } catch (err) {
      commit('SET_ORDERS_ERROR', err.response?.data?.message || 'Failed to load orders');
      throw err;
    } finally {
      commit('SET_ORDERS_LOADING', false);
    }
  },
  async updateAdminOrderStatus({ commit }, { id, status, note }) {
    const data = await adminApi.updateAdminOrderStatus(id, { status, note });
    commit('PATCH_ORDER', data.order);
    return data;
  },
  async updateOrderShipping({ commit }, { id, shippingData }) {
    const data = await adminApi.updateOrderShipping(id, shippingData);
    commit('PATCH_ORDER', data.order);
    return data;
  },

  // Banners
  async fetchBanners({ commit }) {
    commit('SET_BANNERS_LOADING', true);
    commit('SET_BANNERS_ERROR', null);
    try {
      const data = await adminApi.fetchBanners();
      commit('SET_BANNERS', data.banners || []);
    } catch (err) {
      commit('SET_BANNERS_ERROR', err.response?.data?.message || 'Failed to load banners');
      throw err;
    } finally {
      commit('SET_BANNERS_LOADING', false);
    }
  },
  async createBanner({ commit }, bannerData) {
    const data = await adminApi.createBanner(bannerData);
    commit('ADD_BANNER', data.banner);
    return data;
  },
  async updateBanner({ commit }, { id, bannerData }) {
    const data = await adminApi.updateBanner(id, bannerData);
    commit('PATCH_BANNER', data.banner);
    return data;
  },
  async updateBannerStatus({ commit }, { id, isActive }) {
    const data = await adminApi.updateBannerStatus(id, { isActive });
    commit('PATCH_BANNER', data.banner);
    return data;
  },
  async deleteBanner({ commit }, id) {
    await adminApi.deleteBanner(id);
    commit('REMOVE_BANNER', id);
  }
};

const getters = {
  dashboardStats: s => s.dashboard.stats,
  dashboardLoading: s => s.dashboard.loading,
  users: s => s.users.list,
  usersPagination: s => s.users.pagination,
  usersLoading: s => s.users.loading,
  adminProducts: s => s.products.list,
  productsPagination: s => s.products.pagination,
  productsLoading: s => s.products.loading,
  adminOrders: s => s.orders.list,
  ordersPagination: s => s.orders.pagination,
  ordersLoading: s => s.orders.loading,
  banners: s => s.banners.list,
  bannersLoading: s => s.banners.loading
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
