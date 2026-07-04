<script setup>
import { computed, ref } from 'vue';
import { TrendingUp, ShoppingBag, PieChart } from 'lucide-vue-next';

const props = defineProps({
  stats: { type: Object, required: true }
});

const activeTooltip = ref(null); // { x, y, label, value }

// ─── 1. SALES TREND CHART (Using Recent Orders) ─────────────────────────────
const trendPoints = computed(() => {
  const orders = [...(props.stats?.recentOrders || [])].reverse();
  if (!orders.length) return [];
  
  // Group orders by date (or just take sequential order points for trend)
  let cumulative = 0;
  return orders.map((order, idx) => {
    cumulative += order.total || 0;
    const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : `Order ${idx+1}`;
    return {
      label: dateStr,
      value: order.total || 0,
      cumulative: cumulative
    };
  });
});

const chartWidth = 500;
const chartHeight = 180;
const padding = { top: 20, right: 20, bottom: 30, left: 50 };

const maxVal = computed(() => {
  const vals = trendPoints.value.map(p => p.cumulative);
  return Math.max(...vals, 100) * 1.15; // 15% head room
});

const coordinates = computed(() => {
  const points = trendPoints.value;
  if (points.length < 2) return [];

  const xRange = chartWidth - padding.left - padding.right;
  const yRange = chartHeight - padding.top - padding.bottom;

  return points.map((p, idx) => {
    const x = padding.left + (idx / (points.length - 1)) * xRange;
    const y = chartHeight - padding.bottom - (p.cumulative / maxVal.value) * yRange;
    return { x, y, label: p.label, value: p.value, cumulative: p.cumulative };
  });
});

const linePath = computed(() => {
  const coords = coordinates.value;
  if (coords.length < 2) return '';
  return coords.reduce((path, p, idx) => {
    return path + `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
  }, '');
});

const areaPath = computed(() => {
  const coords = coordinates.value;
  if (coords.length < 2) return '';
  const closedCoords = [
    ...coords,
    { x: coords[coords.length - 1].x, y: chartHeight - padding.bottom },
    { x: coords[0].x, y: chartHeight - padding.bottom }
  ];
  return closedCoords.reduce((path, p, idx) => {
    return path + `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
  }, '') + 'Z';
});

// ─── 2. ORDER DISTRIBUTION DONUT CHART ──────────────────────────────────────
const orderBreakdown = computed(() => {
  const o = props.stats?.orders || {};
  return [
    { label: 'Delivered', count: o.delivered || 0, color: 'text-emerald-400', stroke: '#34d399' },
    { label: 'Shipped', count: o.shipped || 0, color: 'text-cyan-400', stroke: '#22d3ee' },
    { label: 'Processing', count: o.processing || 0, color: 'text-violet-400', stroke: '#a78bfa' },
    { label: 'Pending', count: o.pending || 0, color: 'text-amber-400', stroke: '#fbbf24' }
  ];
});

const totalDonutCount = computed(() => {
  return orderBreakdown.value.reduce((acc, curr) => acc + curr.count, 0);
});

// Donut calculation helper
const donutSegments = computed(() => {
  let accumulatedPercent = 0;
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // 314.16

  return orderBreakdown.value.map(item => {
    const percent = totalDonutCount.value ? (item.count / totalDonutCount.value) : 0;
    const strokeDasharray = `${(percent * circumference).toFixed(1)} ${circumference.toFixed(1)}`;
    const strokeDashoffset = (-accumulatedPercent * circumference).toFixed(1);
    accumulatedPercent += percent;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset
    };
  });
});
</script>

<template>
  <div class="grid lg:grid-cols-3 gap-6 mb-6">
    <!-- Sales Area Spline Chart -->
    <div class="lg:col-span-2 bg-slate-900 border border-slate-800/60 rounded-2xl p-5 relative">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-sm font-semibold text-slate-350">Cumulative Revenue Trend</h2>
          <p class="text-xs text-slate-500 mt-0.5">Based on timeline of recent storefront checkouts</p>
        </div>
        <TrendingUp class="w-4 h-4 text-violet-400" />
      </div>

      <div v-if="trendPoints.length < 2" class="h-[180px] flex items-center justify-center text-slate-600 text-sm">
        Insufficient order data to render trend chart.
      </div>

      <div v-else class="relative w-full overflow-hidden select-none">
        <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" class="w-full h-auto overflow-visible">
          <!-- Gradients -->
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.25" />
              <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#a78bfa" />
              <stop offset="100%" stop-color="#c084fc" />
            </linearGradient>
          </defs>

          <!-- Horizontal Grid Lines -->
          <line
            v-for="i in 4"
            :key="i"
            :x1="padding.left"
            :y1="padding.top + ((i-1)/3) * (chartHeight - padding.top - padding.bottom)"
            :x2="chartWidth - padding.right"
            :y2="padding.top + ((i-1)/3) * (chartHeight - padding.top - padding.bottom)"
            stroke="#1e293b"
            stroke-width="1"
            stroke-dasharray="4 4"
          />

          <!-- Area -->
          <path :d="areaPath" fill="url(#areaGradient)" />

          <!-- Line -->
          <path :d="linePath" fill="none" stroke="url(#lineGradient)" stroke-width="2.5" stroke-linecap="round" />

          <!-- Interactive Highlight Nodes -->
          <circle
            v-for="(coord, idx) in coordinates"
            :key="idx"
            :cx="coord.x"
            :cy="coord.y"
            r="4"
            fill="#0f172a"
            stroke="#a78bfa"
            stroke-width="2"
            class="cursor-pointer hover:r-6 transition-all duration-150"
            @mouseenter="activeTooltip = { x: coord.x, y: coord.y, label: coord.label, value: coord.value, cumulative: coord.cumulative }"
            @mouseleave="activeTooltip = null"
          />

          <!-- Y-Axis Labels -->
          <text
            v-for="i in 3"
            :key="i"
            :x="padding.left - 10"
            :y="padding.top + 4 + ((i-1)/2) * (chartHeight - padding.top - padding.bottom)"
            fill="#475569"
            font-size="9"
            font-family="sans-serif"
            text-anchor="end"
            class="tabular-nums"
          >
            ${{ Math.round(maxVal - ((i-1)/2) * maxVal).toLocaleString() }}
          </text>

          <!-- X-Axis Labels -->
          <text
            v-for="(coord, idx) in coordinates"
            :key="idx"
            :x="coord.x"
            :y="chartHeight - 10"
            fill="#475569"
            font-size="9"
            font-family="sans-serif"
            text-anchor="middle"
          >
            {{ coord.label }}
          </text>
        </svg>

        <!-- Tooltip Overlay -->
        <div
          v-if="activeTooltip"
          class="absolute bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 shadow-2xl z-30 pointer-events-none text-xs flex flex-col space-y-0.5"
          :style="{
            left: `${(activeTooltip.x / chartWidth) * 100}%`,
            top: `${(activeTooltip.y / chartHeight) * 100 - 32}%`,
            transform: 'translate(-50%, -100%)'
          }"
        >
          <span class="text-[10px] text-slate-550 font-bold uppercase tracking-wider">{{ activeTooltip.label }}</span>
          <span class="text-slate-350 font-semibold">Volume: ${{ activeTooltip.value?.toFixed(2) }}</span>
          <span class="text-violet-300 font-bold">Total: ${{ activeTooltip.cumulative?.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <!-- Donut Order Distribution Chart -->
    <div class="bg-slate-900 border border-slate-800/60 rounded-2xl p-5 flex flex-col justify-between">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-semibold text-slate-350">Order Distribution</h2>
        <PieChart class="w-4 h-4 text-emerald-400" />
      </div>

      <div class="flex items-center justify-center gap-6 py-2 flex-1">
        <!-- SVG Donut -->
        <div class="relative w-28 h-28 shrink-0">
          <svg viewBox="0 0 120 120" class="w-full h-full transform -rotate-90">
            <!-- Background base circle -->
            <circle cx="60" cy="60" r="50" fill="none" stroke="#1e293b" stroke-width="12" />

            <!-- Donut segments -->
            <circle
              v-for="(seg, idx) in donutSegments"
              :key="idx"
              cx="60"
              cy="60"
              r="50"
              fill="none"
              :stroke="seg.stroke"
              stroke-width="12"
              :stroke-dasharray="seg.strokeDasharray"
              :stroke-dashoffset="seg.strokeDashoffset"
              stroke-linecap="round"
              class="transition-all duration-500 ease-out"
            />
          </svg>
          <!-- Center Text -->
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-lg font-black text-slate-100">{{ totalDonutCount }}</span>
            <span class="text-[9px] text-slate-550 font-bold uppercase tracking-widest mt-0.5">Orders</span>
          </div>
        </div>

        <!-- Legend -->
        <div class="space-y-1.5 flex-1">
          <div v-for="item in orderBreakdown" :key="item.label" class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: item.stroke }" />
              <span class="text-slate-400 font-medium">{{ item.label }}</span>
            </div>
            <span class="font-bold text-slate-200 tabular-nums">{{ item.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
