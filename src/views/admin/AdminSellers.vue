<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { Eye, UserCheck, UserX, X } from 'lucide-vue-next';
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

const sellers = computed(() => store.getters['admin/users']);
const pagination = computed(() => store.getters['admin/usersPagination']);
const loading = computed(() => store.getters['admin/usersLoading']);

const search = ref('');
const sellerStatusFilter = ref('');

const confirmModal = ref({ show: false, sellerId: null, sellerName: '', targetStatus: '', currentStatus: '', message: '', loading: false });
const lastAction = ref(null);
let undoTimer = null;

const columns = [
  { key: 'name', label: 'Store Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Active Status' },
  { key: 'sellerStatus', label: 'Seller Status' },
  { key: 'joined', label: 'Joined' },
  { key: 'actions', label: 'Actions', class: 'text-right' }
];

const load = (page = 1) => {
  // Always filter query for role: 'seller' and set the corresponding sellerStatus filter
  store.commit('admin/SET_USERS_FILTERS', { 
    search: search.value, 
    role: 'seller', 
    sellerStatus: sellerStatusFilter.value 
  });
  store.dispatch('admin/fetchUsers', { page });
};

onMounted(() => load());

const onSearch = (q) => { search.value = q; load(1); };
watch(sellerStatusFilter, () => load(1));

const onPageChange = (p) => load(p);

const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

const promptStatusChange = (seller, targetStatus) => {
  const current = seller.sellerStatus || 'approved';
  confirmModal.value = {
    show: true,
    sellerId: seller._id,
    sellerName: seller.name,
    targetStatus,
    currentStatus: current,
    message: `Are you sure you want to change the status of "${seller.name}" from "${current}" to "${targetStatus}"?`,
    loading: false
  };
};

const executeChangeStatus = async (isUndo = false) => {
  let sellerId, targetStatus, currentStatus;

  if (isUndo) {
    sellerId = lastAction.value.sellerId;
    targetStatus = lastAction.value.previousStatus;
    currentStatus = lastAction.value.targetStatus;
  } else {
    sellerId = confirmModal.value.sellerId;
    targetStatus = confirmModal.value.targetStatus;
    currentStatus = confirmModal.value.currentStatus;
    confirmModal.value.loading = true;
  }

  try {
    await store.dispatch('admin/updateUserStatus', { 
      id: sellerId, 
      body: { sellerStatus: targetStatus } 
    });
    
    if (isUndo) {
      toast.success(`Action undone. Reverted status back to "${targetStatus}"`);
      lastAction.value = null;
    } else {
      toast.success(`Seller status updated to "${targetStatus}"`);
      
      // Save last action for undo capability
      lastAction.value = {
        sellerId,
        sellerName: confirmModal.value.sellerName,
        targetStatus,
        previousStatus: currentStatus
      };

      // Auto-expire undo window after 12 seconds
      clearTimeout(undoTimer);
      undoTimer = setTimeout(() => {
        lastAction.value = null;
      }, 12000);

      confirmModal.value.show = false;
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to update seller status');
  } finally {
    if (!isUndo) confirmModal.value.loading = false;
  }
};

const triggerUndo = () => {
  if (lastAction.value) {
    executeChangeStatus(true);
  }
};
</script>

<template>
  <div>
    <PageHeader title="Seller Management" :breadcrumb="[{ label: 'Admin', to: '/admin' }, { label: 'Sellers' }]" />

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-5">
      <div class="flex-1 min-w-[200px] max-w-sm">
        <SearchBar v-model="search" placeholder="Search sellers…" @search="onSearch" />
      </div>
      <select
        v-model="sellerStatusFilter"
        class="px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-violet-500/60 transition"
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending Approval</option>
        <option value="approved">Approved Sellers</option>
        <option value="restricted">Restricted Sellers</option>
      </select>
    </div>

    <!-- Table -->
    <AdminTable :columns="columns" :rows="sellers" :loading="loading">
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
        <td class="px-4 py-3.5">
          <StatusBadge :status="row.isActive ? 'active' : 'inactive'" />
        </td>
        <td class="px-4 py-3.5">
          <StatusBadge :status="row.sellerStatus || 'approved'" />
        </td>
        <td class="px-4 py-3.5 text-xs text-slate-500">{{ formatDate(row.createdAt) }}</td>
        <td class="px-4 py-3.5">
          <div class="flex items-center justify-end gap-1">
            <button @click="router.push(`/admin/users/${row._id}`)" class="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition" title="View details">
              <Eye class="w-4 h-4" />
            </button>
            
            <!-- Approve seller button (visible if currently restricted or pending) -->
            <button 
              v-if="(row.sellerStatus || 'approved') !== 'approved'"
              @click="promptStatusChange(row, 'approved')" 
              class="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition" 
              title="Approve Seller"
            >
              <UserCheck class="w-4 h-4" />
            </button>

            <!-- Restrict seller button (visible if currently approved or pending) -->
            <button 
              v-if="(row.sellerStatus || 'approved') !== 'restricted'"
              @click="promptStatusChange(row, 'restricted')" 
              class="p-1.5 rounded-lg text-rose-450 hover:bg-rose-500/10 transition" 
              title="Restrict Seller"
            >
              <UserX class="w-4 h-4" />
            </button>
          </div>
        </td>
      </template>

      <template #empty>
        <EmptyState title="No sellers found" subtitle="Try adjusting your search or filters." />
      </template>
    </AdminTable>

    <Pagination v-bind="pagination" @page-change="onPageChange" />

    <!-- Confirmation Modal -->
    <ConfirmModal
      v-if="confirmModal.show"
      :title="`Moderate Seller Status`"
      :message="confirmModal.message"
      :confirm-label="confirmModal.targetStatus === 'approved' ? 'Approve' : 'Restrict'"
      :confirm-class="confirmModal.targetStatus === 'approved' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-rose-500 hover:bg-rose-400'"
      :loading="confirmModal.loading"
      @confirm="executeChangeStatus(false)"
      @cancel="confirmModal.show = false"
    />

    <!-- Floating Undo Action Banner -->
    <Transition name="slide-up">
      <div v-if="lastAction" class="fixed bottom-6 right-6 z-50 bg-slate-900 border border-violet-500/35 text-slate-100 px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm">
        <div class="flex-1">
          <p class="text-sm font-semibold text-slate-200">Status Changed Successfully</p>
          <p class="text-xs text-slate-400 mt-0.5">"${lastAction.sellerName}" is now marked as {{ lastAction.targetStatus }}.</p>
        </div>
        <button 
          @click="triggerUndo" 
          class="px-4 py-2 bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-xs font-bold rounded-xl transition cursor-pointer"
        >
          Undo
        </button>
        <button @click="lastAction = null" class="text-slate-500 hover:text-slate-350 transition">
          <X class="w-4 h-4" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-up-enter-from { opacity: 0; transform: translateY(20px); }
.slide-up-leave-to { opacity: 0; transform: translateY(20px); }
</style>
