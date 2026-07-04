import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/customer/Home.vue';
import Login from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';
import VerifyEmail from '../views/auth/VerifyEmail.vue';
import Profile from '../views/customer/Profile.vue';
import ProductList from '../views/customer/ProductList.vue';
import ProductDetail from '../views/customer/ProductDetail.vue';
import ProductManager from '../views/seller/ProductManager.vue';
import Cart from '../views/customer/Cart.vue';
import Checkout from '../views/customer/Checkout.vue';
import OrderConfirmation from '../views/customer/OrderConfirmation.vue';
import OrderCancel from '../views/customer/OrderCancel.vue';
import OrderHistory from '../views/customer/OrderHistory.vue';
import OrderTracking from '../views/customer/OrderTracking.vue';

// ─── Admin views ───────────────────────────────────────────────────────────
import AdminDashboard from '../views/admin/AdminDashboard.vue';
import AdminUsers from '../views/admin/AdminUsers.vue';
import AdminSellers from '../views/admin/AdminSellers.vue';
import AdminUserDetail from '../views/admin/AdminUserDetail.vue';
import AdminProducts from '../views/admin/AdminProducts.vue';
import AdminOrders from '../views/admin/AdminOrders.vue';
import AdminOrderDetail from '../views/admin/AdminOrderDetail.vue';
import AdminCategories from '../views/admin/AdminCategories.vue';
import AdminBanners from '../views/admin/AdminBanners.vue';

import store from '../store';

// ─── Admin meta helper ─────────────────────────────────────────────────────
const adminMeta = { layout: 'admin', requiresAuth: true, roles: ['admin'] };

const routes = [
  // ── Customer routes ─────────────────────────────────────────────────────
  { path: '/', name: 'Home', component: Home },
  { path: '/products', name: 'ProductList', component: ProductList },
  { path: '/products/:id', name: 'ProductDetail', component: ProductDetail },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/verify-email/:token', name: 'VerifyEmail', component: VerifyEmail },
  { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/seller/products', name: 'ProductManager', component: ProductManager, meta: { requiresAuth: true, roles: ['seller', 'admin'] } },
  { path: '/cart', name: 'Cart', component: Cart },
  { path: '/checkout', name: 'Checkout', component: Checkout },
  { path: '/checkout/success', name: 'CheckoutSuccess', component: OrderConfirmation },
  { path: '/checkout/cancel', name: 'CheckoutCancel', component: OrderCancel },
  { path: '/order-confirmation', name: 'OrderConfirmation', component: OrderConfirmation },
  { path: '/orders', name: 'OrderHistory', component: OrderHistory, meta: { requiresAuth: true } },
  { path: '/orders/:id', name: 'OrderTracking', component: OrderTracking, meta: { requiresAuth: true } },
  { path: '/track/:id', name: 'GuestOrderTracking', component: OrderTracking },

  // ── Admin routes ─────────────────────────────────────────────────────────
  { path: '/admin', name: 'AdminDashboard', component: AdminDashboard, meta: adminMeta },
  { path: '/admin/users', name: 'AdminUsers', component: AdminUsers, meta: adminMeta },
  { path: '/admin/sellers', name: 'AdminSellers', component: AdminSellers, meta: adminMeta },
  { path: '/admin/users/:id', name: 'AdminUserDetail', component: AdminUserDetail, meta: adminMeta },
  { path: '/admin/products', name: 'AdminProducts', component: AdminProducts, meta: adminMeta },
  { path: '/admin/orders', name: 'AdminOrders', component: AdminOrders, meta: adminMeta },
  { path: '/admin/orders/:id', name: 'AdminOrderDetail', component: AdminOrderDetail, meta: adminMeta },
  { path: '/admin/categories', name: 'AdminCategories', component: AdminCategories, meta: adminMeta },
  { path: '/admin/banners', name: 'AdminBanners', component: AdminBanners, meta: adminMeta },

  // ── Catch-all 404 ────────────────────────────────────────────────────────
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// ─── Navigation guard ──────────────────────────────────────────────────────
router.beforeEach((to, from, next) => {
  const authInitialized = store.state.auth.authInitialized;
  const isAuthenticated = store.getters['auth/isAuthenticated'];
  const user = store.getters['auth/currentUser'];

  console.log('[Router Guard]', { path: to.path, authInitialized, isAuthenticated, role: user?.role });

  // Wait for auth initialization (avoids false redirects on page refresh)
  if (!authInitialized) {
    console.log('[Router Guard] Auth not initialized, passing through');
    return next();
  }

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      console.log('[Router Guard] Not authenticated → Login');
      return next({ name: 'Login', query: { redirect: to.fullPath } });
    }

    // Role-based access control
    const requiredRoles = to.matched.find(record => record.meta.roles)?.meta.roles;
    if (requiredRoles && (!user || !requiredRoles.includes(user.role))) {
      console.log('[Router Guard] Forbidden — insufficient role, redirecting Home');
      return next({ name: 'Home' });
    }
  }

  // Prevent admins from accessing customer/seller portals or storefront pages (including Home/Products)
  if (isAuthenticated && user?.role === 'admin') {
    if (!to.path.startsWith('/admin')) {
      console.log('[Router Guard] Admins restricted to admin panel only → AdminDashboard');
      return next({ name: 'AdminDashboard' });
    }
  }

  next();
});

export default router;
