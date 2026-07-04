<template>
  <div class="max-w-2xl mx-auto px-4 py-16 text-center">
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 space-y-8 shadow-xl">
      <!-- Success Icon -->
      <div class="w-20 h-20 bg-emerald-500/10 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto text-emerald-400">
        <CheckCircle class="h-10 w-10" />
      </div>

      <!-- Title & Message -->
      <div class="space-y-3">
        <h1 class="text-3xl font-extrabold text-white">Payment Successful!</h1>
        <p class="text-slate-400 text-base max-w-md mx-auto">
          Thank you for your purchase! Your order has been placed and is currently being processed.
        </p>
      </div>

      <!-- Order details box -->
      <div v-if="orderId" class="bg-slate-950 border border-slate-850 rounded-2xl p-5 max-w-md mx-auto space-y-2">
        <span class="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Order Reference</span>
        <span class="text-white font-mono font-bold text-lg select-all block">{{ orderId }}</span>
      </div>

      <p class="text-xs text-slate-500 max-w-sm mx-auto">
        A confirmation email containing your full order details and receipt has been queued for your inbox.
      </p>

      <!-- Action buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <router-link
          v-if="orderId"
          :to="trackingLink"
          class="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-bold rounded-xl shadow-lg transition duration-200 inline-flex items-center justify-center space-x-2"
        >
          <span>Track Order</span>
        </router-link>

        <router-link
          to="/products"
          class="w-full sm:w-auto px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition duration-200 inline-flex items-center justify-center"
        >
          <span>Continue Shopping</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { CheckCircle } from 'lucide-vue-next';

const route = useRoute();
const store = useStore();

const orderId = ref('');
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);

const trackingLink = computed(() => {
  if (isAuthenticated.value) {
    return `/orders/${orderId.value}`;
  } else {
    // For guest users, append the saved contact email so tracking loads instantly
    const email = localStorage.getItem('guestContactEmail') || '';
    return `/track/${orderId.value}?email=${encodeURIComponent(email)}`;
  }
});

onMounted(() => {
  // Read orderId from URL query or fallback to localStorage
  orderId.value = route.query.orderId || localStorage.getItem('lastOrderId') || '';
  
  // Clean up cart state and storage helpers just in case
  store.commit('cart/SET_ITEMS', []);
});
</script>
