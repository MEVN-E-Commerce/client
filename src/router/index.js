import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/customer/Home.vue';
import Login from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';
import VerifyEmail from '../views/auth/VerifyEmail.vue';
import Profile from '../views/customer/Profile.vue';
import store from '../store';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
  },
  {
    path: '/verify-email/:token',
    name: 'VerifyEmail',
    component: VerifyEmail,
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true },
  },
  // TODO: Add route groups later:
  // - Customer Routes (e.g. Products, Cart, Checkout, Orders)
  // - Seller Routes (e.g. Seller Dashboard, Manage Products, Orders)
  // - Admin Routes (e.g. Admin Dashboard, User Management, Site Settings)
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation Guard for Role-based Access Control (RBAC) and Authentication
router.beforeEach((to, from, next) => {
  const authInitialized = store.state.auth.authInitialized;
  const isAuthenticated = store.getters['auth/isAuthenticated'];
  console.log('[Router Guard]', { path: to.path, authInitialized, isAuthenticated });
  
  // Safety guard: if auth hasn't initialized yet, allow navigation
  if (!authInitialized) {
    console.log('[Router Guard] Auth not initialized, passing through');
    return next();
  }
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      console.log('[Router Guard] Protected route and not authenticated, redirecting to Login');
      return next({ name: 'Login' });
    }
  }
  
  console.log('[Router Guard] Proceeding to route');
  next();
});

export default router;
