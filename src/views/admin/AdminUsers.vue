<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { Eye, ToggleLeft, ToggleRight } from 'lucide-vue-next';
import PageHeader from '../../components/admin/PageHeader.vue';
import SearchBar from '../../components/admin/SearchBar.vue';
import AdminTable from '../../components/admin/AdminTable.vue';
import StatusBadge from '../../components/admin/StatusBadge.vue';
import Pagination from '../../components/admin/Pagination.vue';
import EmptyState from '../../components/admin/EmptyState.vue';
import ConfirmModal from '../../components/admin/ConfirmModal.vue';
import { useToast } from '../../composables/useToast';

const store = useStore();
const router = useRouter();
const toast = useToast();

const users = computed(() => store.getters['admin/users']);
const pagination = computed(() => store.getters['admin/usersPagination']);
const loading = computed(() => store.getters['admin/usersLoading']);

const search = ref('');
const roleFilter = ref('');
const activeFilter = ref('');

const confirmModal = ref({ show: false, userId: null, action: null, message: '', loading: false });

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'joined', label: 'Joined' },
  { key: 'actions', label: 'Actions', class: 'text-right' }
];

const load = (page = 1) => {
  store.commit('admin/SET_USERS_FILTERS', { search: search.value, role: roleFilter.value, isActive: activeFilter.value });
  store.dispatch('admin/fetchUsers', { page });
};

onMounted(() => load());

const onSearch = (q) => { search.value = q; load(1); };
watch([roleFilter, activeFilter], () => load(1));

const onPageChange = (p) => load(p);

const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

const openToggle = (user) => {
  const action = user.isActive ? 'deactivate' : 'activate';
  confirmModal.value = {
    show: true, userId: user._id, action,
    message: `Are you sure you want to ${action} "${user.name}"? ${action === 'deactivate' ? 'They will not be able to log in.' : 'They will regain access.'}`,
    loading: false
  };
};

const confirmAction = async () => {
  confirmModal.value.loading = true;
  try {
    const isActive = confirmModal.value.action === 'activate';
    await store.dispatch('admin/updateUserStatus', { id: confirmModal.value.userId, body: { isActive } });
    toast.success(`User ${confirmModal.value.action}d successfully`);
    confirmModal.value.show = false;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Operation failed');
  } finally {
    confirmModal.value.loading = false;
  }
};
</script>

<template>
  <div>
    <PageHeader title="User Management" :breadcrumb="[{ label: 'Admin', to: '/admin' }, { label: 'Users' }]" />

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-5">
      <div class="flex-1 min-w-[200px] max-w-sm">
        <SearchBar v-model="search" placeholder="Search by name or email…" @search="onSearch" />
      </div>
      <select
        v-model="roleFilter"
        class="px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-violet-500/60 transition"
      >
        <option value="">All Roles</option>
        <option value="customer">Customer</option>
        <option value="seller">Seller</option>
        <option value="admin">Admin</option>
      </select>
      <select
        v-model="activeFilter"
        class="px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-violet-500/60 transition"
      >
        <option value="">All Status</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
    </div>

    <!-- Table -->
    <AdminTable :columns="columns" :rows="users" :loading="loading">
      <template #default="{ row }">
        <td class="px-4 py-3.5">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
              <span class="text-xs font-bold text-violet-300">{{ row.name?.charAt(0).toUpperCase() }}</span>
            </div>
            <span class="text-sm text-slate-200 font-medium">{{ row.name }}</span>
          </div>
        </td>
        <td class="px-4 py-3.5 text-sm text-slate-400">{{ row.email }}</td>
        <td class="px-4 py-3.5"><StatusBadge :status="row.role" /></td>
        <td class="px-4 py-3.5">
          <StatusBadge :status="row.isActive ? 'active' : 'inactive'" />
        </td>
        <td class="px-4 py-3.5 text-xs text-slate-500">{{ formatDate(row.createdAt) }}</td>
        <td class="px-4 py-3.5">
          <div class="flex items-center justify-end gap-1">
            <button @click="router.push(`/admin/users/${row._id}`)" class="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition" title="View profile">
              <Eye class="w-4 h-4" />
            </button>
            <button @click="openToggle(row)" :class="['p-1.5 rounded-lg transition', row.isActive ? 'text-rose-400 hover:bg-rose-500/10' : 'text-emerald-400 hover:bg-emerald-500/10']" :title="row.isActive ? 'Deactivate' : 'Activate'">
              <ToggleRight v-if="row.isActive" class="w-4 h-4" />
              <ToggleLeft v-else class="w-4 h-4" />
            </button>
          </div>
        </td>
      </template>

      <template #empty>
        <EmptyState title="No users found" subtitle="Try adjusting your search or filters." />
      </template>
    </AdminTable>

    <Pagination v-bind="pagination" @page-change="onPageChange" />

    <ConfirmModal
      v-if="confirmModal.show"
      :title="`${confirmModal.action === 'deactivate' ? 'Deactivate' : 'Activate'} User`"
      :message="confirmModal.message"
      :confirm-label="confirmModal.action === 'deactivate' ? 'Deactivate' : 'Activate'"
      :confirm-class="confirmModal.action === 'deactivate' ? 'bg-rose-500 hover:bg-rose-400' : 'bg-emerald-500 hover:bg-emerald-400'"
      :loading="confirmModal.loading"
      @confirm="confirmAction"
      @cancel="confirmModal.show = false"
    />
  </div>
</template>
