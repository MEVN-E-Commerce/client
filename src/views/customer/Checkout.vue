<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
        Checkout
      </h1>
      <p class="text-slate-400 text-sm">Please review your items and complete your shipping address details.</p>
    </div>

    <!-- Error state -->
    <div v-if="orderError || validationError" class="mb-8 p-4 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-2xl text-sm space-y-2">
      <div class="flex items-start space-x-2.5">
        <AlertTriangle class="h-5 w-5 shrink-0 mt-0.5" />
        <div class="flex-1">
          <p class="font-semibold">Checkout Failed</p>
          <p class="mt-0.5 text-rose-300/90">{{ validationError || orderError }}</p>
        </div>
      </div>
      
      <!-- Out of Stock specific products -->
      <div v-if="failedItems.length > 0" class="mt-3 pl-7 space-y-2 border-t border-rose-500/10 pt-3">
        <p class="font-medium text-rose-300">The following items could not be reserved:</p>
        <ul class="list-disc pl-5 space-y-1 text-rose-300/80">
          <li v-for="item in failedItems" :key="item.productId">
            <span class="font-semibold">{{ item.name }}</span> - {{ item.reason }} (Requested: {{ item.requested }}, Available: {{ item.available }})
          </li>
        </ul>
        <div class="pt-2">
          <router-link to="/cart" class="inline-flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-semibold transition duration-150">
            <span>← Review Cart & Adjust Quantities</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Empty Cart state -->
    <div v-if="cartItems.length === 0" class="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
      <div class="w-20 h-20 bg-slate-950 border border-slate-850 rounded-full flex items-center justify-center mx-auto text-slate-500">
        <ShoppingCart class="h-10 w-10 text-slate-600" />
      </div>
      <div class="space-y-2">
        <h3 class="text-xl font-bold text-white">Your cart is empty</h3>
        <p class="text-slate-400 text-sm max-w-sm mx-auto">
          You must have at least one product in your cart to proceed with checkout.
        </p>
      </div>
      <div class="pt-4">
        <router-link to="/products" class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-bold rounded-xl shadow-lg transition duration-200 inline-block">
          Browse Products
        </router-link>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Checkout Form -->
      <form @submit.prevent="handleSubmit" class="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
        <h2 class="text-xl font-bold text-white mb-2">Shipping Information</h2>

        <!-- Guest Contact Email -->
        <div v-if="!isAuthenticated" class="space-y-2">
          <div class="flex items-center justify-between">
            <label for="contactEmail" class="block text-sm font-medium text-slate-300">Contact Email</label>
            <router-link to="/login" class="text-xs text-emerald-400 hover:underline">
              or sign in to your account
            </router-link>
          </div>
          <input
            id="contactEmail"
            v-model="contactEmail"
            type="email"
            required
            placeholder="guest@example.com"
            class="w-full px-4 py-3 bg-slate-950 border border-slate-855 rounded-xl text-white placeholder-slate-550 focus:outline-none focus:border-emerald-500 transition duration-200"
          />
        </div>

        <!-- Address fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2 space-y-2">
            <label for="fullName" class="block text-sm font-medium text-slate-300">Full Name</label>
            <input
              id="fullName"
              v-model="shippingAddress.fullName"
              type="text"
              required
              placeholder="John Doe"
              class="w-full px-4 py-3 bg-slate-950 border border-slate-855 rounded-xl text-white placeholder-slate-550 focus:outline-none focus:border-emerald-500 transition duration-200"
            />
          </div>

          <div class="md:col-span-2 space-y-2">
            <label for="line1" class="block text-sm font-medium text-slate-300">Address Line 1</label>
            <input
              id="line1"
              v-model="shippingAddress.line1"
              type="text"
              required
              placeholder="123 Street Name"
              class="w-full px-4 py-3 bg-slate-950 border border-slate-855 rounded-xl text-white placeholder-slate-550 focus:outline-none focus:border-emerald-500 transition duration-200"
            />
          </div>

          <div class="md:col-span-2 space-y-2">
            <label for="line2" class="block text-sm font-medium text-slate-300">Address Line 2 (Optional)</label>
            <input
              id="line2"
              v-model="shippingAddress.line2"
              type="text"
              placeholder="Apartment, suite, unit, etc."
              class="w-full px-4 py-3 bg-slate-950 border border-slate-855 rounded-xl text-white placeholder-slate-550 focus:outline-none focus:border-emerald-500 transition duration-200"
            />
          </div>

          <div class="space-y-2">
            <label for="city" class="block text-sm font-medium text-slate-300">City</label>
            <input
              id="city"
              v-model="shippingAddress.city"
              type="text"
              required
              placeholder="Cairo"
              class="w-full px-4 py-3 bg-slate-950 border border-slate-855 rounded-xl text-white placeholder-slate-550 focus:outline-none focus:border-emerald-500 transition duration-200"
            />
          </div>

          <div class="space-y-2">
            <label for="country" class="block text-sm font-medium text-slate-300">Country</label>
            <input
              id="country"
              v-model="shippingAddress.country"
              type="text"
              required
              placeholder="Egypt"
              class="w-full px-4 py-3 bg-slate-950 border border-slate-855 rounded-xl text-white placeholder-slate-550 focus:outline-none focus:border-emerald-500 transition duration-200"
            />
          </div>

          <div class="space-y-2">
            <label for="postalCode" class="block text-sm font-medium text-slate-300">Postal / Zip Code</label>
            <input
              id="postalCode"
              v-model="shippingAddress.postalCode"
              type="text"
              required
              placeholder="11511"
              class="w-full px-4 py-3 bg-slate-950 border border-slate-855 rounded-xl text-white placeholder-slate-550 focus:outline-none focus:border-emerald-500 transition duration-200"
            />
          </div>

          <div class="space-y-2">
            <label for="phone" class="block text-sm font-medium text-slate-300">Phone Number</label>
            <input
              id="phone"
              v-model="shippingAddress.phone"
              type="tel"
              required
              placeholder="e.g. +20 100 000 0000"
              class="w-full px-4 py-3 bg-slate-950 border border-slate-855 rounded-xl text-white placeholder-slate-550 focus:outline-none focus:border-emerald-500 transition duration-200"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="submitLoading"
          class="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-bold rounded-2xl shadow-lg transition duration-200 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span v-if="submitLoading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-950"></span>
          <span>{{ submitLoading ? 'Processing Checkout...' : 'Proceed to Payment' }}</span>
        </button>
      </form>

      <!-- Order Summary Sidebar -->
      <div class="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
        <h2 class="text-xl font-bold text-white mb-2">Order Summary</h2>

        <!-- Items list -->
        <div class="divide-y divide-slate-850 max-h-80 overflow-y-auto pr-1">
          <div v-for="(item, index) in cartItems" :key="item.productId && item.productId._id || index" class="flex items-center justify-between py-3">
            <div class="min-w-0 pr-3">
              <p class="text-sm font-semibold text-white truncate">{{ item.productId && item.productId.name }}</p>
              <p class="text-xs text-slate-400 mt-0.5">Qty: {{ item.quantity }} × ${{ formatPrice(item.priceAtAdd || (item.productId && item.productId.price)) }}</p>
            </div>
            <span class="text-sm font-bold text-white shrink-0">${{ formatPrice((item.priceAtAdd || (item.productId && item.productId.price) || 0) * item.quantity) }}</span>
          </div>
        </div>

        <!-- Totals calculation -->
        <div class="border-t border-slate-850 pt-4 space-y-3">
          <div class="flex justify-between text-sm">
            <span class="text-slate-400">Subtotal</span>
            <span class="text-slate-200 font-medium">${{ formatPrice(subtotal) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-400">Shipping</span>
            <span class="text-slate-200 font-medium">
              {{ shipping === 0 ? 'FREE' : `$${formatPrice(shipping)}` }}
            </span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-400">Estimated Tax (8%)</span>
            <span class="text-slate-200 font-medium">${{ formatPrice(tax) }}</span>
          </div>
          <div class="flex justify-between text-base font-bold border-t border-slate-850 pt-3">
            <span class="text-white">Estimated Total</span>
            <span class="text-emerald-400">${{ formatPrice(total) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ShoppingCart, AlertTriangle } from 'lucide-vue-next';
import { createOrder } from '../../api/orders';
import { createCheckoutSession } from '../../api/payments';

const store = useStore();
const router = useRouter();

const cartItems = computed(() => store.state.cart.items);
const subtotal = computed(() => store.getters['cart/cartSubtotal']);
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);

// Estimated totals (mirrors backend calc: Shipping is flat $10, free above $100; Tax is 8%)
const shipping = computed(() => (subtotal.value >= 100 || subtotal.value === 0 ? 0 : 10));
const tax = computed(() => subtotal.value * 0.08);
const total = computed(() => subtotal.value + shipping.value + tax.value);

const contactEmail = ref('');
const shippingAddress = reactive({
  fullName: '',
  line1: '',
  line2: '',
  city: '',
  country: '',
  postalCode: '',
  phone: ''
});

const submitLoading = ref(false);
const validationError = ref('');
const orderError = ref('');
const failedItems = ref([]);

const formatPrice = (val) => {
  return Number(val).toFixed(2);
};

const validateForm = () => {
  validationError.value = '';
  if (!isAuthenticated.value && !contactEmail.value) {
    validationError.value = 'Contact email is required for guest checkout.';
    return false;
  }
  if (!shippingAddress.fullName || !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.country || !shippingAddress.postalCode || !shippingAddress.phone) {
    validationError.value = 'Please fill in all required shipping address fields.';
    return false;
  }
  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  
  submitLoading.value = true;
  orderError.value = '';
  failedItems.value = [];
  
  try {
    // 1. Submit Order
    const orderPayload = {
      shippingAddress: { ...shippingAddress }
    };
    if (!isAuthenticated.value) {
      orderPayload.contactEmail = contactEmail.value;
      localStorage.setItem('guestContactEmail', contactEmail.value);
    }
    
    const orderData = await createOrder(orderPayload);
    const orderId = orderData.order?._id;
    
    if (!orderId) {
      throw new Error('Order was placed but no order ID was returned from server.');
    }
    
    // Store lastOrderId in localStorage to allow confirmation screen to retrieve it easily
    localStorage.setItem('lastOrderId', orderId);
    
    // 2. Clear local cart items (backend cleared it, but synchronizing local state)
    store.commit('cart/SET_ITEMS', []);
    
    // 3. Create Checkout Session
    const sessionData = await createCheckoutSession(orderId);
    
    if (!sessionData.url) {
      throw new Error('Could not initiate payment session. Please try again.');
    }
    
    // 4. Redirect browser to Stripe checkout url
    window.location.href = sessionData.url;
  } catch (err) {
    submitLoading.value = false;
    
    // Handle 409 stock conflicts
    if (err.response?.status === 409 && err.response?.data?.errors) {
      orderError.value = 'Checkout failed because some items are no longer available in the requested quantities.';
      failedItems.value = err.response.data.errors;
    } else {
      orderError.value = err.response?.data?.message || err.message || 'An unexpected error occurred during checkout.';
    }
  }
};
</script>
