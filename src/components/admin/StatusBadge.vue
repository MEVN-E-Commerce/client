<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: { type: String, required: true },
  type: { type: String, default: 'order' } // 'order' | 'user' | 'product' | 'seller' | 'payment'
});

const statusConfig = {
  // Order statuses
  pending:    { label: 'Pending',    classes: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  paid:       { label: 'Paid',       classes: 'bg-sky-500/15 text-sky-400 border-sky-500/25' },
  processing: { label: 'Processing', classes: 'bg-violet-500/15 text-violet-400 border-violet-500/25' },
  shipped:    { label: 'Shipped',    classes: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  delivered:  { label: 'Delivered',  classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  cancelled:  { label: 'Cancelled',  classes: 'bg-rose-500/15 text-rose-400 border-rose-500/25' },
  // Payment
  unpaid:     { label: 'Unpaid',     classes: 'bg-slate-500/15 text-slate-400 border-slate-500/25' },
  refunded:   { label: 'Refunded',   classes: 'bg-orange-500/15 text-orange-400 border-orange-500/25' },
  failed:     { label: 'Failed',     classes: 'bg-red-500/15 text-red-400 border-red-500/25' },
  // User / general
  active:     { label: 'Active',     classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  inactive:   { label: 'Inactive',   classes: 'bg-slate-500/15 text-slate-400 border-slate-500/25' },
  // Seller
  approved:   { label: 'Approved',   classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  restricted: { label: 'Restricted', classes: 'bg-rose-500/15 text-rose-400 border-rose-500/25' },
};

const config = computed(() => {
  const key = props.status?.toLowerCase() || '';
  return statusConfig[key] || { label: props.status, classes: 'bg-slate-500/15 text-slate-400 border-slate-500/25' };
});
</script>

<template>
  <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border', config.classes]">
    {{ config.label }}
  </span>
</template>
