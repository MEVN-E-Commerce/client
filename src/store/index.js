import { createStore } from 'vuex';
import auth from './modules/auth';

export default createStore({
  state() {
    return {};
  },
  mutations: {},
  actions: {},
  modules: {
    auth,
    // TODO: Add store modules in subsequent phases:
    // cart,
    // products,
    // orders
  }
});
