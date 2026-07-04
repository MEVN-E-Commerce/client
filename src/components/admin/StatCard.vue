<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: Object, required: true },
  trend: { type: String, default: null }, // 'up' | 'down' | null
  trendValue: { type: String, default: null },
  color: { type: String, default: 'violet' } // 'violet' | 'emerald' | 'amber' | 'rose' | 'sky' | 'fuchsia'
});

const colorMap = {
  violet: { bg: 'bg-violet-500/10', icon: 'text-violet-400', border: 'border-violet-500/20' },
  emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
  amber: { bg: 'bg-amber-500/10', icon: 'text-amber-400', border: 'border-amber-500/20' },
  rose: { bg: 'bg-rose-500/10', icon: 'text-rose-400', border: 'border-rose-500/20' },
  sky: { bg: 'bg-sky-500/10', icon: 'text-sky-400', border: 'border-sky-500/20' },
  fuchsia: { bg: 'bg-fuchsia-500/10', icon: 'text-fuchsia-400', border: 'border-fuchsia-500/20' }
};
</script>

<template>
  <div class="bg-slate-900 rounded-2xl p-5 border border-slate-800/60 hover:border-slate-700/80 transition-all duration-200 group">
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1 min-w-0">
        <p class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{{ label }}</p>
        <p class="text-2xl font-bold text-slate-100 tabular-nums">{{ value }}</p>
        <div v-if="trend && trendValue" class="mt-1.5 flex items-center gap-1">
          <span :class="trend === 'up' ? 'text-emerald-400' : 'text-rose-400'" class="text-xs font-medium">
            {{ trend === 'up' ? '↑' : '↓' }} {{ trendValue }}
          </span>
          <span class="text-xs text-slate-600">vs last period</span>
        </div>
      </div>
      <div :class="[colorMap[color]?.bg, colorMap[color]?.border, 'p-3 rounded-xl border transition-all duration-200 group-hover:scale-110']">
        <component :is="icon" :class="['w-5 h-5', colorMap[color]?.icon]" />
      </div>
    </div>
  </div>
</template>
