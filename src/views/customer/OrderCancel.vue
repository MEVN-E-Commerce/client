<template>
  <div class="max-w-2xl mx-auto px-4 py-16 text-center">
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 space-y-8 shadow-xl">
      <!-- Cancel/Alert Icon -->
      <div class="w-20 h-20 bg-rose-500/10 border border-rose-500/25 rounded-full flex items-center justify-center mx-auto text-rose-400">
        <XCircle class="h-10 w-10" />
      </div>

      <!-- Title & Message -->
      <div class="space-y-3">
        <h1 class="text-3xl font-extrabold text-white">Payment Cancelled</h1>
        <p class="text-slate-400 text-base max-w-md mx-auto">
          Your payment session was cancelled. No charges were made, and your items are still waiting in your cart.
        </p>
      </div>

      <!-- Action buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <router-link
          to="/checkout"
          class="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-bold rounded-xl shadow-lg transition duration-200 inline-flex items-center justify-center"
        >
          <span>Retry Checkout</span>
        </router-link>

        <router-link
          to="/cart"
          class="w-full sm:w-auto px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition duration-200 inline-flex items-center justify-center"
        >
          <span>Return to Cart</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { XCircle } from 'lucide-vue-next';
</script>
