<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Order Tracking
        </h1>
        <p class="text-slate-400 text-sm mt-1">Check the progress and delivery details of your order.</p>
      </div>
      
      <!-- Back Links -->
      <router-link
        v-if="isAuthenticated"
        to="/orders"
        class="text-sm font-semibold text-slate-400 hover:text-emerald-450 flex items-center space-x-1.5 transition duration-150"
      >
        <span>← Back to History</span>
      </router-link>
      <router-link
        v-else
        to="/products"
        class="text-sm font-semibold text-slate-400 hover:text-emerald-450 flex items-center space-x-1.5 transition duration-150"
      >
        <span>← Continue Shopping</span>
      </router-link>
    </div>

    <!-- Error Banner -->
    <div v-if="error" class="mb-6 p-4 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-2xl text-sm flex items-center space-x-2">
      <AlertTriangle class="h-5 w-5 shrink-0" />
      <span>{{ error }}</span>
    </div>

    <!-- Guest Email Verification Form (if not loaded yet on a guest route) -->
    <div
      v-if="isGuestRoute && !order && !loading"
      class="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 text-center"
    >
      <div class="w-16 h-16 bg-slate-950 border border-slate-850 rounded-full flex items-center justify-center mx-auto text-slate-500">
        <ShieldCheck class="h-8 w-8 text-emerald-400" />
      </div>
      <div class="space-y-2">
        <h3 class="text-xl font-bold text-white">Guest Verification</h3>
        <p class="text-slate-400 text-sm">
          Please enter the email address used when placing order #{{ orderIdShort }} to view details.
        </p>
      </div>
      
      <form @submit.prevent="handleGuestVerify" class="space-y-4 text-left">
        <div>
          <label for="verifyEmail" class="block text-sm font-medium text-slate-300 mb-2">Contact Email</label>
          <input
            id="verifyEmail"
            v-model="guestEmail"
            type="email"
            required
            placeholder="guest@example.com"
            class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition duration-200"
          />
        </div>
        
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-bold rounded-xl shadow-lg transition duration-200 flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span v-if="loading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-950"></span>
          <span>View Tracking</span>
        </button>
      </form>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="space-y-6">
      <div class="animate-pulse bg-slate-900 border border-slate-800 rounded-3xl p-6 h-28"></div>
      <div class="animate-pulse bg-slate-900 border border-slate-800 rounded-3xl p-6 h-64"></div>
    </div>

    <!-- Full Tracking Details -->
    <div v-else-if="order" class="space-y-8">
      <!-- Order Quick Stats & Stepper -->
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-850 pb-6 gap-4">
          <div>
            <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Order Reference</span>
            <h2 class="text-lg font-mono font-bold text-white select-all">#{{ order._id }}</h2>
            <span class="text-xs text-slate-400 mt-1 block">Placed on {{ formatDate(order.createdAt) }}</span>
          </div>
          <div class="flex flex-col items-start sm:items-end gap-1.5">
            <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Payment Status</span>
            <div class="flex items-center space-x-2">
              <OrderStatusBadge :status="order.status" />
              <span
                class="px-2 py-0.5 text-[11px] font-bold rounded border uppercase"
                :class="order.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20' : 'bg-slate-850 text-slate-400 border-slate-800'"
              >
                {{ order.paymentStatus }}
              </span>
            </div>
          </div>
        </div>

        <!-- Progress Stepper -->
        <OrderStatusStepper :status="order.status" />
      </div>

      <!-- Items & Shipping Info -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <!-- Order Items -->
        <div class="md:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <h3 class="text-lg font-bold text-white">Order Items</h3>
          
          <div class="divide-y divide-slate-850">
            <div
              v-for="item in order.items"
              :key="item._id"
              class="flex items-center justify-between py-4 first:pt-0 last:pb-0"
            >
              <div class="flex items-center space-x-3 min-w-0">
                <div class="h-12 w-12 bg-slate-950 border border-slate-850 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                  <img v-if="getItemImage(item)" :src="getItemImage(item)" :alt="item.productId?.name" class="h-full w-full object-cover" />
                  <ShoppingBag v-else class="h-5 w-5 text-slate-650" />
                </div>
                <div class="min-w-0">
                  <h4 class="text-sm font-semibold text-white truncate">{{ item.productId?.name || 'Deleted Product' }}</h4>
                  <p class="text-xs text-slate-400 mt-0.5">
                    Qty: {{ item.quantity }} × ${{ formatPrice(item.priceAtAdd) }}
                  </p>
                </div>
              </div>
              <span class="text-sm font-bold text-white shrink-0">
                ${{ formatPrice(item.priceAtAdd * item.quantity) }}
              </span>
            </div>
          </div>

          <div class="border-t border-slate-850 pt-4 space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">Subtotal</span>
              <span class="text-white">${{ formatPrice(order.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">Shipping</span>
              <span class="text-white">{{ order.shippingFee === 0 ? 'FREE' : `$${formatPrice(order.shippingFee)}` }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">Tax</span>
              <span class="text-white">${{ formatPrice(order.tax) }}</span>
            </div>
            <div class="flex justify-between text-base font-bold border-t border-slate-850 pt-3">
              <span class="text-white">Total</span>
              <span class="text-emerald-400">${{ formatPrice(order.total) }}</span>
            </div>
          </div>
        </div>

        <!-- Shipping Address Details -->
        <div class="md:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <h3 class="text-lg font-bold text-white">Shipping Address</h3>
          
          <div v-if="order.shippingAddress" class="space-y-4 text-sm leading-relaxed text-slate-300">
            <div>
              <p class="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Recipient</p>
              <p class="font-semibold text-white text-base">{{ order.shippingAddress.fullName }}</p>
            </div>
            
            <div>
              <p class="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Address</p>
              <p>{{ order.shippingAddress.line1 }}</p>
              <p v-if="order.shippingAddress.line2">{{ order.shippingAddress.line2 }}</p>
              <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.country }}</p>
              <p class="text-slate-400 text-xs mt-1">Zip Code: {{ order.shippingAddress.postalCode }}</p>
            </div>

            <div>
              <p class="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Contact Phone</p>
              <p class="font-mono">{{ order.shippingAddress.phone }}</p>
            </div>

            <div v-if="order.contactEmail">
              <p class="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Guest Email</p>
              <p>{{ order.contactEmail }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { AlertTriangle, ShoppingBag, ShieldCheck } from 'lucide-vue-next';
import { getOrder, trackOrder } from '../../api/orders';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge.vue';
import OrderStatusStepper from '../../components/orders/OrderStatusStepper.vue';

const route = useRoute();
const store = useStore();

const order = ref(null);
const loading = ref(false);
const error = ref('');
const guestEmail = ref('');

const orderId = computed(() => route.params.id);
const orderIdShort = computed(() => orderId.value ? orderId.value.substring(0, 8) : '');
const isGuestRoute = computed(() => route.name === 'GuestOrderTracking');
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatPrice = (val) => {
  return Number(val).toFixed(2);
};

const getItemImage = (item) => {
  const images = item.productId?.images || [];
  return images.length > 0 ? images[0] : null;
};

const fetchOrderDetails = async () => {
  loading.value = true;
  error.value = '';
  try {
    if (isGuestRoute.value) {
      // Determine guest email from query parameters or localStorage fallback
      const email = route.query.email || localStorage.getItem('guestContactEmail') || guestEmail.value;
      if (!email) {
        // If email is not available, do not call API yet, let the verification form display
        loading.value = false;
        return;
      }
      guestEmail.value = email;
      const data = await trackOrder(orderId.value, email);
      order.value = data.order;
    } else {
      const data = await getOrder(orderId.value);
      order.value = data.order;
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to retrieve order tracking details.';
  } finally {
    loading.value = false;
  }
};

const handleGuestVerify = () => {
  if (guestEmail.value) {
    fetchOrderDetails();
  }
};

onMounted(() => {
  fetchOrderDetails();
});
</script>
