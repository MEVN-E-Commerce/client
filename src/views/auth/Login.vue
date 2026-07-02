<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

const email = ref('');
const password = ref('');

const authLoading = computed(() => store.getters['auth/authLoading']);
const authError = computed(() => store.getters['auth/authError']);

const handleLogin = async () => {
  if (!email.value || !password.value) return;
  try {
    await store.dispatch('auth/login', {
      email: email.value,
      password: password.value,
    });
    router.push('/profile');
  } catch (err) {
    console.error('Login failed:', err);
  }
};
</script>

<template>
  <div class="flex items-center justify-center min-h-[80vh] px-4">
    <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-8">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white mb-2">Welcome Back</h2>
        <p class="text-slate-400">Sign in to your account</p>
      </div>

      <!-- Error Message -->
      <div v-if="authError" class="mb-6 p-4 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-xl text-sm">
        {{ authError }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
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
            autocomplete="current-password"
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
          <span>{{ authLoading ? 'Signing In...' : 'Sign In' }}</span>
        </button>
      </form>

      <div class="mt-8 text-center text-sm text-slate-400">
        Don't have an account?
        <router-link to="/register" class="text-emerald-400 hover:text-emerald-300 font-semibold transition duration-200 ml-1">
          Register here
        </router-link>
      </div>
    </div>
  </div>
</template>
