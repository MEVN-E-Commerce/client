<script setup>
import NavBar from './components/shared/NavBar.vue';
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
    <NavBar />
    <main class="py-6">
      <router-view />
    </main>
  </div>
</template>
