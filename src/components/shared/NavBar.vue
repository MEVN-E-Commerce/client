<template>
  <nav class="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo Section -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center space-x-2 text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent transition duration-200 hover:opacity-90">
            <span>MEVN Market</span>
          </router-link>
        </div>
        
        <!-- Navigation Links -->
        <div class="flex items-center space-x-2 sm:space-x-4">
          <router-link 
            to="/" 
            class="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition duration-200"
            active-class="bg-slate-850 text-emerald-400 font-semibold"
          >
            Home
          </router-link>
          
          <!-- Conditional Authentication Links -->
          <template v-if="!isAuthenticated">
            <router-link 
              to="/login" 
              class="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition duration-200"
              active-class="bg-slate-850 text-emerald-400 font-semibold"
            >
              Login
            </router-link>
            
            <router-link 
              to="/register" 
              class="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition duration-200"
              active-class="bg-slate-850 text-emerald-400 font-semibold"
            >
              Register
            </router-link>
          </template>

          <template v-else>
            <router-link 
              to="/profile" 
              class="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition duration-200 flex items-center space-x-1"
              active-class="bg-slate-850 text-emerald-400 font-semibold"
            >
              <span>Profile</span>
              <span v-if="currentUser" class="text-xs text-slate-400 font-normal">({{ currentUser.name }})</span>
            </router-link>

            <button 
              @click="handleLogout" 
              class="px-3.5 py-2 rounded-xl text-sm font-medium text-rose-450 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition duration-200"
            >
              Logout
            </button>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
const currentUser = computed(() => store.getters['auth/currentUser']);

const handleLogout = async () => {
  try {
    await store.dispatch('auth/logout');
    router.push('/');
  } catch (err) {
    console.error('Logout failed:', err);
  }
};
</script>
