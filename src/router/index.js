import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/customer/Home.vue';

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

// TODO: Add Navigation Guards for Role-based Access Control (RBAC) later
// router.beforeEach((to, from, next) => {
//   // Check auth requirements
//   next();
// });

export default router;
