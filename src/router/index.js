import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/customer/Home.vue';
import store from '../store';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  // TODO: Add route groups later:
  // - Customer Routes (e.g. Products, Cart, Checkout, Orders, Profile)
  // - Seller Routes (e.g. Seller Dashboard, Manage Products, Orders)
  // - Admin Routes (e.g. Admin Dashboard, User Management, Site Settings)
  // - Auth Routes (e.g. Login, Register, Forgot Password)
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation Guard for Role-based Access Control (RBAC) and Authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters['auth/isAuthenticated'];
  
  // TODO: Example meta and role checks for protected routes:
  // if (to.meta.requiresAuth && !isAuthenticated) {
  //   return next({ name: 'Login' });
  // }
  // if (to.meta.role && store.getters['auth/currentUser']?.role !== to.meta.role) {
  //   return next({ name: 'Home' }); // or access-denied view
  //   // For example, role checks like store.getters['auth/isAdmin'] or store.getters['auth/isSeller']
  // }
  
  next();
});

export default router;
