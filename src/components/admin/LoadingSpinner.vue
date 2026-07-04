<script setup>
defineProps({
  fullscreen: { type: Boolean, default: false },
  size: { type: String, default: 'md' } // 'sm' | 'md' | 'lg'
});

const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
</script>

<template>
  <div
    :class="[
      'flex items-center justify-center',
      fullscreen ? 'fixed inset-0 bg-slate-950/80 z-50' : 'w-full py-16'
    ]"
  >
    <svg
      :class="['animate-spin text-violet-500', sizes[size]]"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
      <path class="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  </div>
</template>
