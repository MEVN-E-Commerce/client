<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');

const localError = ref('');
const isRegistered = ref(false);

const authLoading = computed(() => store.getters['auth/authLoading']);
const authError = computed(() => store.getters['auth/authError']);

const handleRegister = async () => {
  localError.value = '';
  
  if (password.value !== confirmPassword.value) {
    localError.value = 'Passwords do not match';
    return;
  }
  
  if (password.value.length < 6) {
    localError.value = 'Password must be at least 6 characters long';
    return;
  }

  try {
    await store.dispatch('auth/register', {
      name: name.value,
      email: email.value,
      password: password.value,
    });
    isRegistered.value = true;
  } catch (err) {
    console.error('Registration failed:', err);
  }
};
</script>

<template>
  <div class="flex items-center justify-center min-h-[80vh] px-4">
    <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-8">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white mb-2">Create Account</h2>
        <p class="text-slate-400">Join the MEVN marketplace today</p>
      </div>

      <!-- Registration Success State -->
      <div v-if="isRegistered" class="text-center space-y-6 py-4">
        <div class="w-16 h-16 bg-emerald-500/10 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto text-emerald-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
          </svg>
        </div>
        <div class="space-y-2">
          <h3 class="text-xl font-bold text-white">Registration Successful!</h3>
          <p class="text-slate-400 text-sm">
            We've sent a verification link to <span class="text-emerald-400 font-semibold">{{ email }}</span>.
            Please check your inbox (and spam folder) and click the link to activate your account.
          </p>
        </div>
        <div class="pt-4">
          <router-link to="/login" class="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-bold rounded-xl shadow-lg inline-block transition duration-200">
            Go to Login
          </router-link>
        </div>
      </div>

      <!-- Form (shown if not registered) -->
      <template v-else>
        <!-- Error Banners -->
        <div v-if="localError || authError" class="mb-6 p-4 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-xl text-sm">
          {{ localError || authError }}
        </div>

        <form @submit.prevent="handleRegister" class="space-y-5">
          <div>
            <label for="name" class="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            <input
              id="name"
              v-model="name"
              type="text"
              required
              autocomplete="name"
              placeholder="John Doe"
              class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition duration-200"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="you@example.com"
              class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition duration-200"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="new-password"
              placeholder="••••••••"
              class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition duration-200"
            />
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              autocomplete="new-password"
              placeholder="••••••••"
              class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition duration-200"
            />
          </div>

          <button
            type="submit"
            :disabled="authLoading"
            class="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-bold rounded-xl shadow-lg transition duration-200 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <span v-if="authLoading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-950"></span>
            <span>{{ authLoading ? 'Creating Account...' : 'Register' }}</span>
          </button>
        </form>

        <div class="mt-8 text-center text-sm text-slate-400">
          Already have an account?
          <router-link to="/login" class="text-emerald-400 hover:text-emerald-300 font-semibold transition duration-200 ml-1">
            Login here
          </router-link>
        </div>
      </template>
    </div>
  </div>
</template>
