<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { Eye } from 'lucide-vue-next';
import PageHeader from '../../components/admin/PageHeader.vue';
import SearchBar from '../../components/admin/SearchBar.vue';
import AdminTable from '../../components/admin/AdminTable.vue';
import StatusBadge from '../../components/admin/StatusBadge.vue';
import Pagination from '../../components/admin/Pagination.vue';
import EmptyState from '../../components/admin/EmptyState.vue';

const store = useStore();
const router = useRouter();

const orders = computed(() => store.getters['admin/adminOrders']);
const pagination = computed(() => store.getters['admin/ordersPagination']);
const loading = computed(() => store.getters['admin/ordersLoading']);

const search = ref('');
const statusFilter = ref('');
const paymentFilter = ref('');
const dateFrom = ref('');
const dateTo = ref('');

const columns = [
  { key: 'id', label: 'Order ID' },
  { key: 'customer', label: 'Customer' },
  { key: 'total', label: 'Total' },
  { key: 'status', label: 'Status' },
  { key: 'payment', label: 'Payment' },
  { key: 'date', label: 'Date' },
  { key: 'actions', label: '', class: 'text-right' }
];

const load = (page = 1) => {
  store.dispatch('admin/fetchAdminOrders', {
    search: search.value,
    status: statusFilter.value,
    paymentStatus: paymentFilter.value,
    dateFrom: dateFrom.value,
    dateTo: dateTo.value,
    page
  });
};

onMounted(() => load());

const onSearch = (q) => { search.value = q; load(1); };
watch([statusFilter, paymentFilter, dateFrom, dateTo], () => load(1));

const fmt = (d) => d ? new Date(d).toLocaleDateString() : '—';
</script>

<template>
  <div>
    <PageHeader title="Order Management" :breadcrumb="[{ label: 'Admin', to: '/admin' }, { label: 'Orders' }]" />

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-5">
      <div class="flex-1 min-w-[200px] max-w-sm">
        <SearchBar v-model="search" placeholder="Search by email or name…" @search="onSearch" />
      </div>
      <select v-model="statusFilter" class="px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-violet-500/60 transition">
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="processing">Processing</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <select v-model="paymentFilter" class="px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-violet-500/60 transition">
        <option value="">All Payments</option>
        <option value="unpaid">Unpaid</option>
        <option value="paid">Paid</option>
        <option value="refunded">Refunded</option>
      </select>
      <input type="date" v-model="dateFrom" class="px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-violet-500/60 transition" />
      <input type="date" v-model="dateTo" class="px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-violet-500/60 transition" />
    </div>

    <AdminTable :columns="columns" :rows="orders" :loading="loading">
      <template #default="{ row }">
        <td class="px-4 py-3.5">
          <p class="text-xs font-mono text-slate-400">#{{ row._id?.slice(-10) }}</p>
        </td>
        <td class="px-4 py-3.5">
          <p class="text-sm text-slate-300">{{ row.userId?.name || 'Guest' }}</p>
          <p class="text-xs text-slate-500">{{ row.contactEmail }}</p>
        </td>
        <td class="px-4 py-3.5 text-sm font-semibold text-slate-200">${{ row.total?.toFixed(2) }}</td>
        <td class="px-4 py-3.5"><StatusBadge :status="row.status" /></td>
        <td class="px-4 py-3.5"><StatusBadge :status="row.paymentStatus" /></td>
        <td class="px-4 py-3.5 text-xs text-slate-500">{{ fmt(row.createdAt) }}</td>
        <td class="px-4 py-3.5 text-right">
          <button @click="router.push(`/admin/orders/${row._id}`)" class="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition" title="View order">
            <Eye class="w-4 h-4" />
          </button>
        </td>
      </template>

      <template #empty>
        <EmptyState title="No orders found" subtitle="Try adjusting your filters." />
      </template>
    </AdminTable>

    <Pagination v-bind="pagination" @page-change="load" />
  </div>
</template>
