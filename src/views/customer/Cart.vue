<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-extrabold bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
        Your Shopping Cart
      </h1>
      <router-link
        to="/products"
        class="flex items-center space-x-1 text-sm text-slate-400 hover:text-emerald-400 transition duration-200"
      >
        <ArrowLeft class="h-4 w-4" />
        <span>Continue Shopping</span>
      </router-link>
    </div>

    <!-- Error Banner -->
    <div
      v-if="localError || storeError"
      class="mb-6 p-4 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-2xl text-sm flex items-start space-x-2.5"
    >
      <AlertTriangle class="h-5 w-5 shrink-0 mt-0.5" />
      <div class="flex-1">
        <p class="font-semibold">Action Failed</p>
        <p class="mt-0.5 text-rose-300/90">{{ localError || storeError }}</p>
      </div>
      <button @click="clearErrors" class="text-rose-400 hover:text-rose-300 font-medium">Dismiss</button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && items.length === 0" class="space-y-4 py-12 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
      <p class="text-slate-400 text-sm">Loading your cart items...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="items.length === 0" class="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
      <div class="w-20 h-20 bg-slate-950 border border-slate-850 rounded-full flex items-center justify-center mx-auto text-slate-500">
        <ShoppingCart class="h-10 w-10 text-slate-600" />
      </div>
      <div class="space-y-2">
        <h3 class="text-xl font-bold text-white">Your cart is empty</h3>
        <p class="text-slate-400 text-sm max-w-sm mx-auto">
          Before you proceed to checkout, you must add some products to your shopping cart.
        </p>
      </div>
      <div class="pt-4">
        <router-link
          to="/products"
          class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-bold rounded-xl shadow-lg transition duration-200 inline-flex items-center space-x-2"
        >
          <span>Browse Products</span>
        </router-link>
      </div>
    </div>

    <!-- Cart items list -->
    <div v-else class="grid grid-cols-1 gap-8">
      <div class="space-y-4">
        <CartItemRow
          v-for="item in items"
          :key="item.productId?._id"
          :item="item"
          :loading="loading"
          @update-quantity="(qty) => handleUpdateQuantity(item.productId?._id, qty)"
          @remove="() => handleRemoveItem(item.productId?._id)"
        />
      </div>

      <!-- Cart summary footer -->
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
        <div class="flex items-center justify-between border-b border-slate-850 pb-4">
          <span class="text-slate-400 font-medium">Estimated Subtotal</span>
          <span class="text-2xl font-bold text-white">${{ formatPrice(subtotal) }}</span>
        </div>
        <p class="text-xs text-slate-400 leading-relaxed">
          * This is a client-side display estimate of your order subtotal. Taxes, shipping fees, and any promotional discounts will be calculated and finalized at checkout.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            @click="handleClearCart"
            :disabled="loading"
            class="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition duration-200 cursor-pointer"
          >
            Clear Cart
          </button>
          
          <router-link
            to="/checkout"
            class="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-bold rounded-xl shadow-lg transition duration-200 inline-flex items-center justify-center space-x-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight class="h-4 w-4" />
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { ShoppingCart, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-vue-next';
import CartItemRow from '../../components/cart/CartItemRow.vue';

const store = useStore();
const localError = ref('');

const items = computed(() => store.state.cart.items);
const loading = computed(() => store.state.cart.loading);
const storeError = computed(() => store.state.cart.error);
const subtotal = computed(() => store.getters['cart/cartSubtotal']);

const clearErrors = () => {
  localError.value = '';
  store.commit('cart/SET_ERROR', null);
};

const formatPrice = (val) => {
  return Number(val).toFixed(2);
};

const handleUpdateQuantity = async (productId, quantity) => {
  clearErrors();
  try {
    await store.dispatch('cart/updateQuantity', { productId, quantity });
  } catch (err) {
    localError.value = err.response?.data?.message || 'Failed to update quantity. Only limited stock may be available.';
  }
};

const handleRemoveItem = async (productId) => {
  clearErrors();
  try {
    await store.dispatch('cart/removeItem', productId);
  } catch (err) {
    localError.value = err.response?.data?.message || 'Failed to remove item.';
  }
};

const handleClearCart = async () => {
  clearErrors();
  if (confirm('Are you sure you want to clear your cart?')) {
    try {
      await store.dispatch('cart/clearCart');
    } catch (err) {
      localError.value = err.response?.data?.message || 'Failed to clear cart.';
    }
  }
};

onMounted(() => {
  store.dispatch('cart/fetchCart').catch((err) => {
    console.error('Failed to load cart on mount:', err);
  });
});
</script>
