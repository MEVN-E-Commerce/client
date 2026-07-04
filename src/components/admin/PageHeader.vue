<script setup>
defineProps({
  title: { type: String, required: true },
  breadcrumb: { type: Array, default: () => [] }, // [{ label, to? }]
  actionLabel: { type: String, default: null },
  actionIcon: { type: Object, default: null }
});

const emit = defineEmits(['action']);
</script>

<template>
  <div class="flex items-start justify-between gap-4 mb-6 flex-wrap">
    <div>
      <!-- Breadcrumb -->
      <nav v-if="breadcrumb.length" class="flex items-center gap-1.5 mb-1.5">
        <template v-for="(crumb, idx) in breadcrumb" :key="idx">
          <router-link
            v-if="crumb.to"
            :to="crumb.to"
            class="text-xs text-slate-500 hover:text-slate-300 transition"
          >
            {{ crumb.label }}
          </router-link>
          <span v-else class="text-xs text-slate-400">{{ crumb.label }}</span>
          <span v-if="idx < breadcrumb.length - 1" class="text-slate-700 text-xs">/</span>
        </template>
      </nav>

      <h1 class="text-xl font-bold text-slate-100">{{ title }}</h1>
    </div>

    <slot name="actions">
      <button
        v-if="actionLabel"
        @click="emit('action')"
        class="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-violet-500/20"
      >
        <component v-if="actionIcon" :is="actionIcon" class="w-4 h-4" />
        {{ actionLabel }}
      </button>
    </slot>
  </div>
</template>
