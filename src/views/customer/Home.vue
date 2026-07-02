<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getHealth } from '../../api/health';

const router = useRouter();

// Health check state (preserved minimal)
const apiStatus = ref(null);
const apiTimestamp = ref(null);
const apiLoading = ref(true);
const apiError = ref(null);

const checkHealth = async () => {
  apiLoading.value = true;
  apiError.value = null;
  try {
    const data = await getHealth();
    apiStatus.value = data.status || 'OK';
    apiTimestamp.value = data.timestamp || new Date().toISOString();
  } catch (err) {
    apiError.value = err.message || 'Server down.';
  } finally {
    apiLoading.value = false;
  }
};

const goToCatalog = () => {
  router.push('/products');
};

onMounted(() => {
  checkHealth();
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
    
    <!-- Hero Block -->
    <div class="relative bg-slate-900 border border-slate-800 rounded-[35px] p-8 md:p-16 overflow-hidden shadow-2xl">
      <!-- Glow elements -->
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]"></div>

      <div class="relative z-10 max-w-3xl space-y-6">
        <span class="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-xs font-bold rounded-full uppercase tracking-widest inline-block">
          Welcome to the Future of Commerce
        </span>
        
        <h1 class="text-4xl md:text-6xl font-black tracking-tight leading-none text-white">
          The ultimate marketplace for <br/>
          <span class="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Developer Setup Gear
          </span>
        </h1>
        
        <p class="text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl">
          Upgrade your workspace. Fetch premium mechanical keyboards, ergonomic accessories, wireless audio, and desk decors created and audited by active builders.
        </p>

        <div class="pt-4 flex flex-wrap gap-4">
          <button 
            @click="goToCatalog"
            class="px-8 py-4 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:opacity-90 active:scale-95 text-slate-950 font-black rounded-2xl text-sm transition duration-200 cursor-pointer shadow-lg shadow-cyan-500/10 flex items-center space-x-2"
          >
            <span>Browse Products Catalog</span>
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Feature Grid Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      <!-- Feature 1 -->
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:border-slate-700 transition">
        <div class="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/20">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-white mb-2">Verified Sellers Only</h3>
        <p class="text-slate-450 text-sm leading-relaxed">
          Every seller account passes auth reviews to ensure item quality, shipping time guarantees, and customer satisfaction metrics.
        </p>
      </div>

      <!-- Feature 2 -->
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:border-slate-700 transition">
        <div class="h-12 w-12 bg-cyan-700/10 rounded-2xl flex items-center justify-center text-cyan-400 mb-6 border border-cyan-500/20">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-white mb-2">Debounced Responsive UI</h3>
        <p class="text-slate-450 text-sm leading-relaxed">
          Type and filter products instantly without clicks. Experience smooth navigation layouts designed with Tailwind and Vue 3.
        </p>
      </div>

      <!-- Feature 3 -->
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:border-slate-700 transition">
        <div class="h-12 w-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mb-6 border border-purple-500/20">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-white mb-2">Stable Shopping Models</h3>
        <p class="text-slate-450 text-sm leading-relaxed">
          Model integrations are prepared with stable references. Cart, Checkout, and order generation APIs are ready for rapid scaling.
        </p>
      </div>

    </div>

    <!-- Health Check Status Footer panel -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center space-x-3">
        <div class="p-2 bg-slate-950 rounded-xl border border-slate-850">
          <svg class="h-5 w-5 text-emerald-400 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1H4v8h12V6z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div>
          <h4 class="text-xs font-bold text-slate-350 uppercase tracking-widest">Platform Core Node</h4>
          <div class="flex items-center space-x-2 text-[11px] text-slate-550 mt-0.5">
            <span>Status:</span>
            <span :class="apiLoading ? 'text-cyan-400' : (apiError ? 'text-red-400 font-semibold' : 'text-emerald-400 font-semibold')">
              {{ apiLoading ? 'Checking...' : (apiError ? 'Disconnected' : 'Online / Connected') }}
            </span>
          </div>
        </div>
      </div>

      <button 
        @click="checkHealth"
        :disabled="apiLoading"
        class="px-3.5 py-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 active:scale-95 text-[10px] text-slate-400 font-bold rounded-lg transition"
      >
        Ping API
      </button>
    </div>

  </div>
</template>
