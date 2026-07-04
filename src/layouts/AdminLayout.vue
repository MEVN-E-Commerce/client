<script setup>
import { ref } from 'vue';
import AdminSidebar from '../components/admin/AdminSidebar.vue';
import ToastContainer from '../components/admin/ToastContainer.vue';

const sidebarCollapsed = ref(false);
const mobileSidebarOpen = ref(false);
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex">
    <!-- Sidebar -->
    <AdminSidebar
      :collapsed="sidebarCollapsed"
      :mobile-open="mobileSidebarOpen"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
      @close-mobile="mobileSidebarOpen = false"
    />

    <!-- Main content area -->
    <div
      class="flex-1 flex flex-col min-h-screen transition-all duration-300"
    >
      <!-- Top bar (mobile) -->
      <header class="lg:hidden sticky top-0 z-30 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-3">
        <button
          @click="mobileSidebarOpen = true"
          class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Open sidebar"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span class="font-bold text-sm bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          Admin Panel
        </span>
      </header>

      <!-- Page content -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <router-view />
      </main>
    </div>

    <!-- Toast notifications (renders on top of everything) -->
    <ToastContainer />
  </div>
</template>
