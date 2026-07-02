<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { verifyEmail, resendVerification } from '../../api/auth';

const route = useRoute();

const token = route.params.token;
const loading = ref(true);
const success = ref(false);
const errorMsg = ref('');

// State for resend logic
const email = ref('');
const resendLoading = ref(false);
const resendSuccess = ref(false);
const resendError = ref('');

onMounted(async () => {
  if (!token) {
    loading.value = false;
    errorMsg.value = 'Verification token is missing.';
    return;
  }
  
  try {
    await verifyEmail(token);
    success.value = true;
    loading.value = false;
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Verification failed. The token may be invalid or expired.';
    loading.value = false;
  }
});

const handleResend = async () => {
  if (!email.value) return;
  resendLoading.value = true;
  resendSuccess.value = false;
  resendError.value = '';
  
  try {
    await resendVerification(email.value);
    resendSuccess.value = true;
    resendLoading.value = false;
  } catch (err) {
    resendError.value = err.response?.data?.message || 'Failed to resend verification email.';
    resendLoading.value = false;
  }
};
</script>

<template>
  <div class="flex items-center justify-center min-h-[80vh] px-4">
    <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-8">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white mb-2">Email Verification</h2>
        <p class="text-slate-400">Verifying your account details</p>
      </div>

      <!-- 1. Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-8 space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        <p class="text-slate-450 text-slate-400">Activating your account, please wait...</p>
      </div>

      <!-- 2. Success State -->
      <div v-else-if="success" class="text-center space-y-6 py-4">
        <div class="w-16 h-16 bg-emerald-500/10 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto text-emerald-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div class="space-y-2">
          <h3 class="text-xl font-bold text-white">Verification Complete!</h3>
          <p class="text-slate-400 text-sm">
            Your email has been verified successfully. You can now access all marketplace features.
          </p>
        </div>
        <div class="pt-4">
          <router-link to="/login" class="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-bold rounded-xl shadow-lg inline-block transition duration-200">
            Proceed to Login
          </router-link>
        </div>
      </div>

      <!-- 3. Error/Failure State & Resend Form -->
      <div v-else class="space-y-6">
        <div class="p-4 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-xl text-sm text-center">
          {{ errorMsg }}
        </div>

        <div class="border-t border-slate-800 pt-6">
          <h4 class="text-sm font-semibold text-white mb-2">Need a new verification link?</h4>
          <p class="text-slate-400 text-xs mb-4">
            Enter your email address below, and we will send you a new activation email.
          </p>

          <!-- Resend Alerts -->
          <div v-if="resendSuccess" class="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl text-xs">
            If an account exists, a new verification email has been sent.
          </div>
          <div v-if="resendError" class="mb-4 p-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-xl text-xs">
            {{ resendError }}
          </div>

          <form @submit.prevent="handleResend" class="space-y-4">
            <div>
              <label for="resend-email" class="sr-only">Email Address</label>
              <input
                id="resend-email"
                v-model="email"
                type="email"
                required
                placeholder="email@example.com"
                class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition duration-200 text-sm"
              />
            </div>
            
            <button
              type="submit"
              :disabled="resendLoading"
              class="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <span v-if="resendLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              <span>{{ resendLoading ? 'Sending...' : 'Resend Verification Email' }}</span>
            </button>
          </form>
        </div>

        <div class="text-center text-sm pt-4 border-t border-slate-800/50">
          <router-link to="/login" class="text-emerald-400 hover:text-emerald-300 transition duration-200">
            Back to Login
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
