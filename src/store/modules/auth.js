import * as authApi from '../../api/auth';

const state = () => ({
  user: null,
  accessToken: null,
  authLoading: false,
  authError: null,
  authInitialized: false,
});

const getters = {
  currentUser: (state) => state.user,
  isAuthenticated: (state) => !!state.accessToken,
  isAdmin: (state) => state.user?.role === 'admin',
  isSeller: (state) => state.user?.role === 'seller',
  authLoading: (state) => state.authLoading,
  authError: (state) => state.authError,
};

const mutations = {
  SET_USER(state, user) {
    state.user = user;
  },
  SET_ACCESS_TOKEN(state, token) {
    state.accessToken = token;
  },
  CLEAR_AUTH(state) {
    state.user = null;
    state.accessToken = null;
  },
  SET_AUTH_LOADING(state, isLoading) {
    state.authLoading = isLoading;
  },
  SET_AUTH_ERROR(state, error) {
    state.authError = error;
  },
  SET_AUTH_INITIALIZED(state, value) {
    state.authInitialized = value;
  },
};

const actions = {
  async register({ commit }, { name, email, password }) {
    commit('SET_AUTH_LOADING', true);
    commit('SET_AUTH_ERROR', null);
    try {
      const data = await authApi.register({ name, email, password });
      commit('SET_AUTH_LOADING', false);
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed';
      commit('SET_AUTH_ERROR', errorMsg);
      commit('SET_AUTH_LOADING', false);
      throw error;
    }
  },

  async login({ commit }, { email, password }) {
    commit('SET_AUTH_LOADING', true);
    commit('SET_AUTH_ERROR', null);
    try {
      const data = await authApi.login({ email, password });
      commit('SET_ACCESS_TOKEN', data.accessToken);
      commit('SET_USER', data.user);
      commit('SET_AUTH_LOADING', false);
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      commit('SET_AUTH_ERROR', errorMsg);
      commit('SET_AUTH_LOADING', false);
      throw error;
    }
  },

  async logout({ commit }) {
    commit('SET_AUTH_LOADING', true);
    try {
      await authApi.logout();
    } catch (error) {
      console.error('API logout failed, clearing session locally anyway:', error);
    } finally {
      commit('CLEAR_AUTH');
      commit('SET_AUTH_LOADING', false);
    }
  },

  async fetchProfile({ commit }) {
    commit('SET_AUTH_LOADING', true);
    try {
      const data = await authApi.getProfile();
      commit('SET_USER', data.user);
      commit('SET_AUTH_LOADING', false);
      return data;
    } catch (error) {
      commit('SET_AUTH_LOADING', false);
      throw error;
    }
  },

  async refreshAccessToken({ commit }) {
    try {
      const data = await authApi.refreshToken();
      commit('SET_ACCESS_TOKEN', data.accessToken);
      if (data.user) {
        commit('SET_USER', data.user);
      }
      return data.accessToken;
    } catch (error) {
      commit('CLEAR_AUTH');
      throw error;
    }
  },

  async initAuth({ dispatch, commit }) {
    console.log('[Store Auth] initAuth started');
    try {
      await dispatch('refreshAccessToken');
      console.log('[Store Auth] refreshAccessToken succeeded, fetching profile');
      await dispatch('fetchProfile');
      console.log('[Store Auth] fetchProfile succeeded');
    } catch (error) {
      console.log('[Store Auth] initAuth caught error (expected if logged out):', error.message || error);
      // Quietly resolve for expected unauthenticated state
      commit('CLEAR_AUTH');
    } finally {
      console.log('[Store Auth] setting authInitialized to true');
      commit('SET_AUTH_INITIALIZED', true);
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
