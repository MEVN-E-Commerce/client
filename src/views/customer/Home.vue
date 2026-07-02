<script setup>
import { ref, onMounted } from 'vue';
import { getHealth } from '../../api/health';

const status = ref(null);
const timestamp = ref(null);
const loading = ref(true);
const error = ref(null);

const checkHealth = async () => {
  loading.value = true;
  error.value = null;
  try {
    const data = await getHealth();
    status.value = data.status || 'OK';
    timestamp.value = data.timestamp || new Date().toISOString();
  } catch (err) {
    error.value = err.message || 'Failed to connect to the backend server.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  checkHealth();
});
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
      <!-- Glow effect decoration -->
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>

      <div class="relative z-10">
        <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
          MEVN Marketplace
        </h1>
        <p class="text-slate-400 text-lg mb-8 max-w-2xl">
          University Course Project: Vue 3 Client Scaffold. This frontend application communicates with an Express API back-end server running locally.
        </p>

        <div class="border-t border-slate-800/80 pt-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-slate-200">
              API Connection Health
            </h2>
            <button 
              @click="checkHealth" 
              class="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-full border border-slate-700 text-slate-300 transition duration-200 flex items-center gap-1.5 active:scale-95"
              :disabled="loading"
            >
              <svg class="h-3.5 w-3.5" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18" />
              </svg>
              Refresh
            </button>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="flex items-center space-x-3 text-cyan-400 py-6">
            <svg class="animate-spin h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-sm font-medium text-slate-400">Verifying endpoint connection...</span>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="p-5 bg-red-950/30 border border-red-500/20 rounded-2xl text-red-400/90">
            <div class="flex items-start gap-3">
              <svg class="h-6 w-6 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p class="font-bold text-red-200">Could not connect to API</p>
                <p class="text-sm mt-1 text-slate-400 leading-relaxed">{{ error }}</p>
                <p class="text-xs text-slate-500 mt-3">
                  Please verify that your server is running on <code class="text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">http://localhost:5000</code> and CORS headers allow traffic from this origin.
                </p>
              </div>
            </div>
          </div>

          <!-- Success State -->
          <div v-else class="p-5 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl text-emerald-400/90">
            <div class="flex items-start gap-3">
              <svg class="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="flex-1">
                <p class="font-bold text-emerald-200">API Connection Successful</p>
                <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div class="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                    <span class="text-xs text-slate-500 block">Status Code</span>
                    <span class="font-semibold text-emerald-300">{{ status }}</span>
                  </div>
                  <div class="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                    <span class="text-xs text-slate-500 block">Timestamp</span>
                    <span class="font-mono text-xs text-slate-300">{{ new Date(timestamp).toLocaleString() }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
