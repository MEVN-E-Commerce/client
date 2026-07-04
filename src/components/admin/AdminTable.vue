<script setup>
defineProps({
  columns: { type: Array, required: true }, // [{ key, label, class? }]
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  rowKey: { type: String, default: '_id' }
});
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-800/80">
            <th
              v-for="col in columns"
              :key="col.key"
              :class="['px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap', col.class]"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>

        <!-- Loading skeleton -->
        <tbody v-if="loading">
          <tr v-for="n in 6" :key="n" class="border-b border-slate-800/40 last:border-0">
            <td v-for="col in columns" :key="col.key" class="px-4 py-3.5">
              <div class="h-3.5 rounded-full bg-slate-800 animate-pulse" :style="`width: ${55 + Math.random() * 35}%`" />
            </td>
          </tr>
        </tbody>

        <!-- Actual rows -->
        <tbody v-else>
          <tr
            v-for="row in rows"
            :key="row[rowKey]"
            class="border-b border-slate-800/40 last:border-0 hover:bg-slate-800/30 transition-colors duration-150"
          >
            <slot :row="row" />
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state slot -->
    <slot v-if="!loading && rows.length === 0" name="empty">
      <div class="py-16 text-center">
        <p class="text-slate-500 text-sm">No records found</p>
      </div>
    </slot>
  </div>
</template>
