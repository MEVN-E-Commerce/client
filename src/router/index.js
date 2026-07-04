import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/customer/Home.vue';
import Login from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';
import VerifyEmail from '../views/auth/VerifyEmail.vue';
import Profile from '../views/customer/Profile.vue';
import ProductList from '../views/customer/ProductList.vue';
import ProductDetail from '../views/customer/ProductDetail.vue';
import ProductManager from '../views/seller/ProductManager.vue';
import CategoryManager from '../views/admin/CategoryManager.vue';
import Cart from '../views/customer/Cart.vue';
import Checkout from '../views/customer/Checkout.vue';
import OrderConfirmation from '../views/customer/OrderConfirmation.vue';
import OrderCancel from '../views/customer/OrderCancel.vue';
import OrderHistory from '../views/customer/OrderHistory.vue';
import OrderTracking from '../views/customer/OrderTracking.vue';
import store from '../store';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/products',
    name: 'ProductList',
    component: ProductList,
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
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: ProductDetail,
  },
  {
    path: '/seller/products',
    name: 'ProductManager',
    component: ProductManager,
    meta: { requiresAuth: true, roles: ['seller', 'admin'] },
  },
  {
    path: '/admin/categories',
    name: 'CategoryManager',
    component: CategoryManager,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart,
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: Checkout,
  },
  {
    path: '/checkout/success',
    name: 'CheckoutSuccess',
    component: OrderConfirmation,
  },
  {
    path: '/checkout/cancel',
    name: 'CheckoutCancel',
    component: OrderCancel,
  },
  {
    path: '/order-confirmation',
    name: 'OrderConfirmation',
    component: OrderConfirmation,
  },
  {
    path: '/orders',
    name: 'OrderHistory',
    component: OrderHistory,
    meta: { requiresAuth: true },
  },
  {
    path: '/orders/:id',
    name: 'OrderTracking',
    component: OrderTracking,
    meta: { requiresAuth: true },
  },
  {
    path: '/track/:id',
    name: 'GuestOrderTracking',
    component: OrderTracking,
  },
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
    
    // Role validation check
    const requiredRoles = to.matched.find(record => record.meta.roles)?.meta.roles;
    if (requiredRoles) {
      const user = store.getters['auth/currentUser'];
      if (!user || !requiredRoles.includes(user.role)) {
        console.log('[Router Guard] Forbidden role check. Redirecting to Home.');
        return next({ name: 'Home' });
      }
    }
  }
  
  console.log('[Router Guard] Proceeding to route');
  next();
});

export default router;
