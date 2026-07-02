import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { injectStore } from './api/axios';
import './style.css';

// Inject store to Axios client to avoid circular imports during init
injectStore(store);

const app = createApp(App);

app.use(router);
app.use(store);

app.mount('#app');

