import { createStore } from 'vuex';
import auth from './modules/auth';
import cart from './modules/cart';

export default createStore({
  state() {
    return {};
  },
  mutations: {},
  actions: {},
  modules: {
    auth,
    cart,
    // TODO: Add store modules in subsequent phases:
    // products,
    // orders
  }
});
