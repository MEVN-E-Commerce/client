<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { ToggleLeft, ToggleRight, Eye } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import PageHeader from '../../components/admin/PageHeader.vue';
import SearchBar from '../../components/admin/SearchBar.vue';
import AdminTable from '../../components/admin/AdminTable.vue';
import StatusBadge from '../../components/admin/StatusBadge.vue';
import Pagination from '../../components/admin/Pagination.vue';
import EmptyState from '../../components/admin/EmptyState.vue';
import ConfirmModal from '../../components/admin/ConfirmModal.vue';
import { useToast } from '../../composables/useToast';
import { getCategories } from '../../api/products';

const store = useStore();
const router = useRouter();
const toast = useToast();

const products = computed(() => store.getters['admin/adminProducts']);
const pagination = computed(() => store.getters['admin/productsPagination']);
const loading = computed(() => store.getters['admin/productsLoading']);

const search = ref('');
const categoryFilter = ref('');
const statusFilter = ref('all');
const categories = ref([]);

const confirmModal = ref({ show: false, productId: null, productName: '', targetActive: null, loading: false });

const columns = [
  { key: 'image', label: '' },
  { key: 'name', label: 'Product' },
  { key: 'category', label: 'Category' },
  { key: 'seller', label: 'Seller' },
  { key: 'price', label: 'Price' },
  { key: 'stock', label: 'Stock' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '', class: 'text-right' }
];

const load = (page = 1) => {
  store.dispatch('admin/fetchAdminProducts', {
    search: search.value,
    categoryId: categoryFilter.value,
    isActive: statusFilter.value,
    page
  });
};

onMounted(async () => {
  load();
  try { const d = await getCategories(); categories.value = d.categories || []; } catch {}
});

const onSearch = (q) => { search.value = q; load(1); };
watch([categoryFilter, statusFilter], () => load(1));

const onPageChange = (p) => load(p);

const openToggle = (product) => {
  confirmModal.value = {
    show: true,
    productId: product._id,
    productName: product.name,
    targetActive: !product.isActive,
    loading: false
  };
};

const confirmToggle = async () => {
  confirmModal.value.loading = true;
  try {
    await store.dispatch('admin/updateProductStatus', { id: confirmModal.value.productId, isActive: confirmModal.value.targetActive });
    toast.success(`Product ${confirmModal.value.targetActive ? 'enabled' : 'disabled'} successfully`);
    confirmModal.value.show = false;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to update product status');
  } finally {
    confirmModal.value.loading = false;
  }
};
</script>

<template>
  <div>
    <PageHeader title="Product Moderation" :breadcrumb="[{ label: 'Admin', to: '/admin' }, { label: 'Products' }]" />

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-5">
      <div class="flex-1 min-w-[200px] max-w-sm">
        <SearchBar v-model="search" placeholder="Search products…" @search="onSearch" />
      </div>
      <select v-model="categoryFilter" class="px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-violet-500/60 transition">
        <option value="">All Categories</option>
        <option v-for="cat in categories" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
      </select>
      <select v-model="statusFilter" class="px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-violet-500/60 transition">
        <option value="all">All Status</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
    </div>

    <AdminTable :columns="columns" :rows="products" :loading="loading">
      <template #default="{ row }">
        <td class="px-4 py-3">
          <img v-if="row.images?.[0]" :src="row.images[0]" class="w-10 h-10 rounded-lg object-cover border border-slate-700/40" />
          <div v-else class="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700/40" />
        </td>
        <td class="px-4 py-3">
          <p class="text-sm text-slate-200 font-medium max-w-[200px] truncate">{{ row.name }}</p>
          <p class="text-xs text-slate-500">#{{ row._id?.slice(-6) }}</p>
        </td>
        <td class="px-4 py-3 text-sm text-slate-400">{{ row.categoryId?.name || '—' }}</td>
        <td class="px-4 py-3">
          <p class="text-sm text-slate-400">{{ row.sellerId?.name || '—' }}</p>
          <p class="text-xs text-slate-600">{{ row.sellerId?.email }}</p>
        </td>
        <td class="px-4 py-3 text-sm font-semibold text-slate-200">${{ row.price?.toFixed(2) }}</td>
        <td class="px-4 py-3">
          <span :class="['text-sm font-medium', row.stock === 0 ? 'text-rose-400' : row.stock < 5 ? 'text-amber-400' : 'text-slate-300']">
            {{ row.stock }}
          </span>
        </td>
        <td class="px-4 py-3">
          <StatusBadge :status="row.isActive ? 'active' : 'inactive'" />
        </td>
        <td class="px-4 py-3">
          <div class="flex items-center justify-end gap-1">
            <button @click="router.push(`/products/${row._id}`)" class="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition" title="View listing">
              <Eye class="w-4 h-4" />
            </button>
            <button @click="openToggle(row)" :class="['p-1.5 rounded-lg transition', row.isActive ? 'text-rose-400 hover:bg-rose-500/10' : 'text-emerald-400 hover:bg-emerald-500/10']" :title="row.isActive ? 'Disable' : 'Enable'">
              <ToggleRight v-if="row.isActive" class="w-4 h-4" />
              <ToggleLeft v-else class="w-4 h-4" />
            </button>
          </div>
        </td>
      </template>

      <template #empty>
        <EmptyState title="No products found" subtitle="Try a different search or filter." />
      </template>
    </AdminTable>

    <Pagination v-bind="pagination" @page-change="onPageChange" />

    <ConfirmModal
      v-if="confirmModal.show"
      :title="confirmModal.targetActive ? 'Enable Product' : 'Disable Product'"
      :message="`Are you sure you want to ${confirmModal.targetActive ? 'enable' : 'disable'} &quot;${confirmModal.productName}&quot;? ${confirmModal.targetActive ? 'It will reappear on the storefront.' : 'It will be hidden from customers.'}`"
      :confirm-label="confirmModal.targetActive ? 'Enable' : 'Disable'"
      :confirm-class="confirmModal.targetActive ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-rose-500 hover:bg-rose-400'"
      :loading="confirmModal.loading"
      @confirm="confirmToggle"
      @cancel="confirmModal.show = false"
    />
  </div>
</template>
