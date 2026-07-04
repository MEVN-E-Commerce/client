<script setup>
import { PackageSearch } from 'lucide-vue-next';

defineProps({
  title: { type: String, default: 'No records found' },
  subtitle: { type: String, default: 'Try adjusting your search or filters.' },
  icon: { type: Object, default: () => PackageSearch }
});
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20 px-4 text-center">
    <div class="p-5 bg-slate-800/60 rounded-2xl border border-slate-700/40 mb-4">
      <component :is="icon" class="w-10 h-10 text-slate-600" />
    </div>
    <h3 class="text-base font-semibold text-slate-400 mb-1">{{ title }}</h3>
    <p class="text-sm text-slate-600 max-w-xs">{{ subtitle }}</p>
    <slot />
  </div>
</template>
