import { createStore } from 'vuex';
import auth from './modules/auth';
import cart from './modules/cart';
import admin from './modules/admin';

export default createStore({
  state() {
    return {};
  },
  mutations: {},
  actions: {},
  modules: {
    auth,
    cart,
    admin
  }
});

