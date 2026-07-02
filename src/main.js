import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { injectStore } from './api/axios';
import './style.css';

// Inject store to Axios client to avoid circular imports during init
injectStore(store);

const app = createApp(App);

app.use(store);

// Initialize auth session from refresh cookie before mounting the app
(async () => {
  console.log('[main.js] IIFE started, dispatching initAuth');
  try {
    await store.dispatch('auth/initAuth');
    console.log('[main.js] initAuth finished resolving');
  } catch (err) {
    console.error('[main.js] Failed to initialize authentication session:', err);
  } finally {
    console.log('[main.js] Installing router and mounting app');
    app.use(router);
    app.mount('#app');
    console.log('[main.js] App mounted');
  }
})();

