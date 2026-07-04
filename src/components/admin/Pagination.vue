<script setup>
import { computed } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps({
  page: { type: Number, required: true },
  pages: { type: Number, required: true },
  total: { type: Number, required: true },
  limit: { type: Number, required: true }
});

const emit = defineEmits(['page-change']);

const visiblePages = computed(() => {
  const { page, pages } = props;
  const delta = 2;
  const range = [];
  const rangeWithDots = [];

  for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) {
    range.push(i);
  }

  if (range[0] > 1) {
    rangeWithDots.push(1);
    if (range[0] > 2) rangeWithDots.push('...');
  }
  rangeWithDots.push(...range);
  if (range[range.length - 1] < pages) {
    if (range[range.length - 1] < pages - 1) rangeWithDots.push('...');
    rangeWithDots.push(pages);
  }

  return rangeWithDots;
});

const from = computed(() => (props.page - 1) * props.limit + 1);
const to = computed(() => Math.min(props.page * props.limit, props.total));
</script>

<template>
  <div v-if="pages > 0" class="flex items-center justify-between gap-4 mt-4 flex-wrap">
    <p class="text-xs text-slate-500">
      Showing <span class="text-slate-300 font-medium">{{ from }}–{{ to }}</span> of
      <span class="text-slate-300 font-medium">{{ total }}</span> results
    </p>

    <div class="flex items-center gap-1">
      <button
        @click="emit('page-change', page - 1)"
        :disabled="page === 1"
        class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
        aria-label="Previous page"
      >
        <ChevronLeft class="w-4 h-4" />
      </button>

      <template v-for="p in visiblePages" :key="p">
        <span v-if="p === '...'" class="px-1 text-slate-600 text-sm">…</span>
        <button
          v-else
          @click="emit('page-change', p)"
          :class="[
            'min-w-[32px] h-8 rounded-lg text-sm font-medium transition',
            p === page
              ? 'bg-violet-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          ]"
        >
          {{ p }}
        </button>
      </template>

      <button
        @click="emit('page-change', page + 1)"
        :disabled="page === pages"
        class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
        aria-label="Next page"
      >
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
