<template>
  <span
    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border"
    :class="statusStyles"
  >
    <span class="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse" :class="dotStyles"></span>
    {{ formattedStatus }}
  </span>
</template>

<script setup>
import { computed } from 'vue';
import { ORDER_STATUS } from '../../constants/order';

const props = defineProps({
  status: {
    type: String,
    required: true
  }
});

const formattedStatus = computed(() => {
  if (!props.status) return '';
  return props.status.charAt(0).toUpperCase() + props.status.slice(1);
});

const statusStyles = computed(() => {
  switch (props.status?.toLowerCase()) {
    case ORDER_STATUS.PENDING:
      return 'bg-slate-800/80 text-slate-300 border-slate-700';
    case ORDER_STATUS.PAID:
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    case ORDER_STATUS.PROCESSING:
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case ORDER_STATUS.SHIPPED:
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    case ORDER_STATUS.DELIVERED:
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case ORDER_STATUS.CANCELLED:
      return 'bg-rose-500/10 text-rose-450 border-rose-500/20';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
});

const dotStyles = computed(() => {
  switch (props.status?.toLowerCase()) {
    case ORDER_STATUS.PENDING:
      return 'bg-slate-400';
    case ORDER_STATUS.PAID:
      return 'bg-cyan-400';
    case ORDER_STATUS.PROCESSING:
      return 'bg-amber-400';
    case ORDER_STATUS.SHIPPED:
      return 'bg-indigo-400';
    case ORDER_STATUS.DELIVERED:
      return 'bg-emerald-400';
    case ORDER_STATUS.CANCELLED:
      return 'bg-rose-450';
    default:
      return 'bg-slate-450';
  }
});
</script>
