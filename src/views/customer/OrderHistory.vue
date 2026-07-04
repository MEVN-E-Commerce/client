<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
        Order History
      </h1>
      <p class="text-slate-400 text-sm mt-1">View and track all your previous purchases.</p>
    </div>

    <!-- Error Banner -->
    <div v-if="error" class="mb-6 p-4 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-2xl text-sm flex items-center space-x-2">
      <AlertCircle class="h-5 w-5 shrink-0" />
      <span>{{ error }}</span>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="animate-pulse bg-slate-900 border border-slate-800 rounded-2xl p-6 h-20"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="orders.length === 0" class="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
      <div class="w-20 h-20 bg-slate-950 border border-slate-850 rounded-full flex items-center justify-center mx-auto text-slate-500">
        <PackageCheck class="h-10 w-10 text-slate-650" />
      </div>
      <div class="space-y-2">
        <h3 class="text-xl font-bold text-white">No orders found</h3>
        <p class="text-slate-400 text-sm max-w-sm mx-auto">
          It looks like you haven't placed any orders yet. Let's start shopping!
        </p>
      </div>
      <div class="pt-4">
        <router-link
          to="/products"
          class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-bold rounded-xl shadow-lg transition duration-200 inline-block"
        >
          Explore Products
        </router-link>
      </div>
    </div>

    <!-- Orders List -->
    <div v-else class="space-y-6">
      <div class="overflow-hidden border border-slate-800 bg-slate-900 rounded-3xl">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th class="p-5">Order ID</th>
              <th class="p-5">Date</th>
              <th class="p-5">Items</th>
              <th class="p-5">Total</th>
              <th class="p-5 text-center">Status</th>
              <th class="p-5"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-850 text-sm">
            <tr
              v-for="order in orders"
              :key="order._id"
              @click="goToTracking(order._id)"
              class="hover:bg-slate-850/40 cursor-pointer transition duration-150 group"
            >
              <td class="p-5 font-mono text-slate-300 font-bold group-hover:text-emerald-450">
                #{{ order._id.substring(0, 8) }}
              </td>
              <td class="p-5 text-slate-300">
                {{ formatDate(order.createdAt) }}
              </td>
              <td class="p-5 text-slate-400">
                {{ getItemsCount(order) }} items
              </td>
              <td class="p-5 font-bold text-white">
                ${{ formatPrice(order.total) }}
              </td>
              <td class="p-5 text-center">
                <OrderStatusBadge :status="order.status" />
              </td>
              <td class="p-5 text-slate-500 text-right group-hover:text-emerald-400">
                <ChevronRight class="h-5 w-5 ml-auto transform group-hover:translate-x-1 transition duration-150" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-slate-850 pt-4 px-2">
        <button
          @click="changePage(page - 1)"
          :disabled="page <= 1 || loading"
          class="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition duration-150 cursor-pointer text-xs font-semibold"
        >
          Previous
        </button>
        <span class="text-xs font-semibold text-slate-400">
          Page {{ page }} of {{ totalPages }}
        </span>
        <button
          @click="changePage(page + 1)"
          :disabled="page >= totalPages || loading"
          class="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition duration-150 cursor-pointer text-xs font-semibold"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { AlertCircle, ChevronRight, PackageCheck } from 'lucide-vue-next';
import { getOrders } from '../../api/orders';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge.vue';

const router = useRouter();

const orders = ref([]);
const loading = ref(false);
const error = ref('');
const page = ref(1);
const totalPages = ref(1);

const fetchUserOrders = async (targetPage = 1) => {
  loading.value = true;
  error.value = '';
  try {
    const data = await getOrders(targetPage);
    orders.value = data.orders || [];
    page.value = data.pagination?.page || 1;
    totalPages.value = data.pagination?.totalPages || 1;
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to fetch order history.';
  } finally {
    loading.value = false;
  }
};

const getItemsCount = (order) => {
  return order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatPrice = (val) => {
  return Number(val).toFixed(2);
};

const changePage = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    fetchUserOrders(newPage);
  }
};

const goToTracking = (id) => {
  router.push(`/orders/${id}`);
};

onMounted(() => {
  fetchUserOrders();
});
</script>
