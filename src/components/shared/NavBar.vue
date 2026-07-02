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
          
          <!-- Placeholders for future Auth Phase -->
          <span 
            class="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-655 text-slate-500 cursor-not-allowed select-none hover:text-slate-400/80 transition duration-200"
            title="Authentication implementation coming soon"
          >
            Login
          </span>
          
          <span 
            class="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed select-none hover:text-slate-400/80 transition duration-200"
            title="Authentication implementation coming soon"
          >
            Register
          </span>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
// Main navigation component logic
</script>
