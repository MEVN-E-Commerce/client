<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { Plus, Edit2, ToggleLeft, ToggleRight, Trash2, X, Check } from 'lucide-vue-next';
import PageHeader from '../../components/admin/PageHeader.vue';
import ConfirmModal from '../../components/admin/ConfirmModal.vue';
import EmptyState from '../../components/admin/EmptyState.vue';
import LoadingSpinner from '../../components/admin/LoadingSpinner.vue';
import ImageUploader from '../../components/admin/ImageUploader.vue';
import { useToast } from '../../composables/useToast';

const store = useStore();
const toast = useToast();

const banners = computed(() => store.getters['admin/banners']);
const loading = computed(() => store.getters['admin/bannersLoading']);

onMounted(() => store.dispatch('admin/fetchBanners'));

// Form
const formDefaults = () => ({ title: '', subtitle: '', image: '', link: '', sortOrder: 0, isActive: true });
const formVisible = ref(false);
const editingId = ref(null);
const form = ref(formDefaults());
const formLoading = ref(false);

const openCreate = () => { editingId.value = null; form.value = formDefaults(); formVisible.value = true; };
const openEdit = (banner) => { editingId.value = banner._id; form.value = { ...banner }; formVisible.value = true; };
const closeForm = () => { formVisible.value = false; editingId.value = null; form.value = formDefaults(); };

const saveForm = async () => {
  if (!form.value.title.trim()) { toast.error('Title is required'); return; }
  if (!form.value.image) { toast.error('Image is required'); return; }
  formLoading.value = true;
  try {
    if (editingId.value) {
      await store.dispatch('admin/updateBanner', { id: editingId.value, bannerData: form.value });
      toast.success('Banner updated');
    } else {
      await store.dispatch('admin/createBanner', form.value);
      toast.success('Banner created');
    }
    closeForm();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Operation failed');
  } finally {
    formLoading.value = false;
  }
};

// Delete
const deleteModal = ref({ show: false, id: null, name: '', loading: false });
const confirmDelete = async () => {
  deleteModal.value.loading = true;
  try {
    await store.dispatch('admin/deleteBanner', deleteModal.value.id);
    toast.success('Banner deleted');
    deleteModal.value.show = false;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to delete banner');
  } finally {
    deleteModal.value.loading = false;
  }
};

const toggleStatus = async (banner) => {
  try {
    await store.dispatch('admin/updateBannerStatus', { id: banner._id, isActive: !banner.isActive });
    toast.success(`Banner ${banner.isActive ? 'hidden' : 'activated'}`);
  } catch (err) {
    toast.error('Failed to update banner status');
  }
};
</script>

<template>
  <div>
    <PageHeader
      title="Banner CMS"
      :breadcrumb="[{ label: 'Admin', to: '/admin' }, { label: 'Banners' }]"
      action-label="New Banner"
      :action-icon="Plus"
      @action="openCreate"
    />

    <LoadingSpinner v-if="loading" />
    <EmptyState v-else-if="!banners.length" title="No banners yet" subtitle="Create the first banner to promote on your homepage." >
      <button @click="openCreate" class="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition">
        Create Banner
      </button>
    </EmptyState>

    <!-- Banner grid -->
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="banner in banners"
        :key="banner._id"
        class="group bg-slate-900 rounded-2xl border border-slate-800/60 overflow-hidden hover:border-slate-700/80 transition"
      >
        <!-- Image -->
        <div class="relative">
          <img :src="banner.image" :alt="banner.title" class="w-full h-40 object-cover" />
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
            <button @click="openEdit(banner)" class="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition" title="Edit">
              <Edit2 class="w-4 h-4" />
            </button>
            <button
              @click="deleteModal = { show: true, id: banner._id, name: banner.title, loading: false }"
              class="p-2 bg-rose-500/70 hover:bg-rose-500 rounded-xl text-white transition"
              title="Delete"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
          <!-- Active badge -->
          <div class="absolute top-2 left-2">
            <span :class="['text-xs px-2 py-0.5 rounded-full font-semibold border', banner.isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-500 border-slate-700']">
              {{ banner.isActive ? 'Active' : 'Hidden' }}
            </span>
          </div>
        </div>

        <!-- Info -->
        <div class="p-4">
          <p class="text-sm font-semibold text-slate-200 truncate">{{ banner.title }}</p>
          <p v-if="banner.subtitle" class="text-xs text-slate-500 truncate mt-0.5">{{ banner.subtitle }}</p>
          <div class="flex items-center justify-between mt-3">
            <p class="text-xs text-slate-600">Order: {{ banner.sortOrder }}</p>
            <button @click="toggleStatus(banner)" :class="['p-1.5 rounded-lg transition', banner.isActive ? 'text-rose-400 hover:bg-rose-500/10' : 'text-emerald-400 hover:bg-emerald-500/10']" :title="banner.isActive ? 'Hide' : 'Activate'">
              <ToggleRight v-if="banner.isActive" class="w-4 h-4" />
              <ToggleLeft v-else class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="formVisible" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="closeForm" />
          <div class="relative bg-slate-900 border border-slate-700/60 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div class="flex items-center justify-between p-5 border-b border-slate-800/60">
              <h2 class="text-base font-semibold text-slate-100">{{ editingId ? 'Edit Banner' : 'New Banner' }}</h2>
              <button @click="closeForm" class="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition">
                <X class="w-4 h-4" />
              </button>
            </div>
            <div class="p-5 space-y-4">
              <div>
                <label class="text-xs text-slate-500 mb-1.5 block">Image *</label>
                <ImageUploader v-model="form.image" />
              </div>
              <div>
                <label class="text-xs text-slate-500 mb-1 block">Title *</label>
                <input v-model="form.title" type="text" maxlength="120" placeholder="Banner title" class="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/60 transition" />
              </div>
              <div>
                <label class="text-xs text-slate-500 mb-1 block">Subtitle</label>
                <input v-model="form.subtitle" type="text" maxlength="200" placeholder="Optional subtitle" class="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/60 transition" />
              </div>
              <div>
                <label class="text-xs text-slate-500 mb-1 block">Link URL</label>
                <input v-model="form.link" type="url" placeholder="https://…" class="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/60 transition" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs text-slate-500 mb-1 block">Sort Order</label>
                  <input v-model.number="form.sortOrder" type="number" min="0" class="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-violet-500/60 transition" />
                </div>
                <div class="flex items-end pb-0.5">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" v-model="form.isActive" class="rounded" />
                    <span class="text-sm text-slate-300">Active</span>
                  </label>
                </div>
              </div>
              <div class="flex gap-3 pt-2">
                <button @click="closeForm" class="flex-1 py-2.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition">Cancel</button>
                <button
                  @click="saveForm"
                  :disabled="formLoading"
                  class="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition"
                >
                  {{ formLoading ? 'Saving…' : editingId ? 'Save Changes' : 'Create Banner' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <ConfirmModal
      v-if="deleteModal.show"
      title="Delete Banner"
      :message="`Delete &quot;${deleteModal.name}&quot;? This action cannot be undone.`"
      confirm-label="Delete"
      confirm-class="bg-rose-500 hover:bg-rose-400"
      :loading="deleteModal.loading"
      @confirm="confirmDelete"
      @cancel="deleteModal.show = false"
    />
  </div>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.97); }
</style>
