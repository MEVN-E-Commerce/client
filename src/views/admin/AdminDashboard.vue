<script setup>
import { onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { Users, Package2, ShoppingBag, Tags, TrendingUp, DollarSign, XCircle, Clock } from 'lucide-vue-next';
import StatCard from '../../components/admin/StatCard.vue';
import StatusBadge from '../../components/admin/StatusBadge.vue';
import LoadingSpinner from '../../components/admin/LoadingSpinner.vue';

const store = useStore();
const router = useRouter();

const loading = computed(() => store.getters['admin/dashboardLoading']);
const stats = computed(() => store.getters['admin/dashboardStats']);

onMounted(() => store.dispatch('admin/fetchDashboard'));

const fmt = (n) => typeof n === 'number' ? n.toLocaleString() : '—';
const fmtCurrency = (n) => typeof n === 'number' ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—';

const recentOrders = computed(() => stats.value?.recentOrders || []);
const recentUsers = computed(() => stats.value?.recentUsers || []);
const topProducts = computed(() => stats.value?.topProducts || []);
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-100">Dashboard</h1>
      <p class="text-sm text-slate-500 mt-0.5">Welcome back — here's what's happening in your store.</p>
    </div>

    <LoadingSpinner v-if="loading" />

    <template v-else-if="stats">
      <!-- Stats grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users" :value="fmt(stats.users?.total)" :icon="Users" color="violet" />
        <StatCard label="Sellers" :value="fmt(stats.users?.sellers)" :icon="Users" color="fuchsia" />
        <StatCard label="Products" :value="fmt(stats.products?.total)" :icon="Package2" color="sky" />
        <StatCard label="Categories" :value="fmt(stats.categories?.total)" :icon="Tags" color="emerald" />
      </div>

      <!-- Revenue + Order stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Revenue" :value="fmtCurrency(stats.revenue)" :icon="DollarSign" color="emerald" />
        <StatCard label="Total Orders" :value="fmt(stats.orders?.total)" :icon="ShoppingBag" color="amber" />
        <StatCard label="Pending Orders" :value="fmt(stats.orders?.pending)" :icon="Clock" color="amber" />
        <StatCard label="Cancelled Orders" :value="fmt(stats.orders?.cancelled)" :icon="XCircle" color="rose" />
      </div>

      <!-- Order status breakdown -->
      <div class="bg-slate-900 rounded-2xl border border-slate-800/60 p-5 mb-6">
        <h2 class="text-sm font-semibold text-slate-300 mb-4">Order Status Breakdown</h2>
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <div
            v-for="(count, key) in { paid: stats.orders?.paid, processing: stats.orders?.processing, shipped: stats.orders?.shipped, delivered: stats.orders?.delivered }"
            :key="key"
            class="text-center p-3 bg-slate-800/50 rounded-xl"
          >
            <StatusBadge :status="key" class="mb-1" />
            <p class="text-lg font-bold text-slate-100 mt-1.5">{{ fmt(count) }}</p>
          </div>
        </div>
      </div>

      <!-- Two column: recent orders + recent users -->
      <div class="grid lg:grid-cols-2 gap-6 mb-6">
        <!-- Recent Orders -->
        <div class="bg-slate-900 rounded-2xl border border-slate-800/60 overflow-hidden">
          <div class="flex items-center justify-between p-4 border-b border-slate-800/60">
            <h2 class="text-sm font-semibold text-slate-300">Recent Orders</h2>
            <button @click="router.push('/admin/orders')" class="text-xs text-violet-400 hover:text-violet-300 transition">View all →</button>
          </div>
          <div v-if="!recentOrders.length" class="py-10 text-center text-slate-600 text-sm">No orders yet</div>
          <div v-else class="divide-y divide-slate-800/40">
            <div
              v-for="order in recentOrders"
              :key="order._id"
              @click="router.push(`/admin/orders/${order._id}`)"
              class="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 cursor-pointer transition"
            >
              <div>
                <p class="text-xs font-mono text-slate-400">#{{ order._id?.slice(-8) }}</p>
                <p class="text-xs text-slate-500 mt-0.5">{{ order.contactEmail }}</p>
              </div>
              <div class="text-right">
                <StatusBadge :status="order.status" />
                <p class="text-xs text-slate-400 mt-1">${{ order.total?.toFixed(2) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Users -->
        <div class="bg-slate-900 rounded-2xl border border-slate-800/60 overflow-hidden">
          <div class="flex items-center justify-between p-4 border-b border-slate-800/60">
            <h2 class="text-sm font-semibold text-slate-300">Recent Users</h2>
            <button @click="router.push('/admin/users')" class="text-xs text-violet-400 hover:text-violet-300 transition">View all →</button>
          </div>
          <div v-if="!recentUsers.length" class="py-10 text-center text-slate-600 text-sm">No users yet</div>
          <div v-else class="divide-y divide-slate-800/40">
            <div
              v-for="user in recentUsers"
              :key="user._id"
              @click="router.push(`/admin/users/${user._id}`)"
              class="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/30 cursor-pointer transition"
            >
              <div class="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                <span class="text-xs font-bold text-violet-300">{{ user.name?.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-slate-300 font-medium truncate">{{ user.name }}</p>
                <p class="text-xs text-slate-500 truncate">{{ user.email }}</p>
              </div>
              <StatusBadge :status="user.role" />
            </div>
          </div>
        </div>
      </div>

      <!-- Top Products -->
      <div class="bg-slate-900 rounded-2xl border border-slate-800/60 overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b border-slate-800/60">
          <h2 class="text-sm font-semibold text-slate-300">Top Products by Units Sold</h2>
          <TrendingUp class="w-4 h-4 text-emerald-400" />
        </div>
        <div v-if="!topProducts.length" class="py-10 text-center text-slate-600 text-sm">No sales data yet</div>
        <div v-else class="divide-y divide-slate-800/40">
          <div
            v-for="(prod, idx) in topProducts"
            :key="prod._id"
            class="flex items-center gap-4 px-4 py-3"
          >
            <span class="text-sm font-bold text-slate-600 w-5 shrink-0 tabular-nums">#{{ idx + 1 }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-slate-300 font-medium truncate">{{ prod.name }}</p>
              <p class="text-xs text-slate-500">{{ fmt(prod.totalSold) }} units sold</p>
            </div>
            <p class="text-sm font-bold text-emerald-400">${{ prod.revenue?.toFixed(2) }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
