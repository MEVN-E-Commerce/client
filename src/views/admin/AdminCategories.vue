<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-vue-next';
import PageHeader from '../../components/admin/PageHeader.vue';
import ConfirmModal from '../../components/admin/ConfirmModal.vue';
import EmptyState from '../../components/admin/EmptyState.vue';
import LoadingSpinner from '../../components/admin/LoadingSpinner.vue';
import { useToast } from '../../composables/useToast';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/products';

const store = useStore();
const toast = useToast();

const categories = ref([]);
const loading = ref(true);

// Form state
const form = ref({ name: '', description: '' });
const editingId = ref(null);
const formLoading = ref(false);

// Delete confirm
const deleteModal = ref({ show: false, id: null, name: '', loading: false });

const load = async () => {
  loading.value = true;
  try {
    const data = await getCategories();
    categories.value = data.categories || [];
  } catch { toast.error('Failed to load categories'); }
  finally { loading.value = false; }
};

onMounted(load);

const startEdit = (cat) => {
  editingId.value = cat._id;
  form.value = { name: cat.name, description: cat.description || '' };
};

const cancelEdit = () => {
  editingId.value = null;
  form.value = { name: '', description: '' };
};

const saveCategory = async () => {
  if (!form.value.name.trim()) { toast.error('Category name is required'); return; }
  formLoading.value = true;
  try {
    if (editingId.value) {
      await updateCategory(editingId.value, form.value);
      toast.success('Category updated');
    } else {
      await createCategory(form.value);
      toast.success('Category created');
    }
    await load();
    cancelEdit();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Operation failed');
  } finally {
    formLoading.value = false;
  }
};

const confirmDelete = async () => {
  deleteModal.value.loading = true;
  try {
    await deleteCategory(deleteModal.value.id);
    toast.success('Category deleted');
    await load();
    deleteModal.value.show = false;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to delete category');
  } finally {
    deleteModal.value.loading = false;
  }
};
</script>

<template>
  <div>
    <PageHeader title="Category Management" :breadcrumb="[{ label: 'Admin', to: '/admin' }, { label: 'Categories' }]" />

    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Form panel -->
      <div class="bg-slate-900 rounded-2xl border border-slate-800/60 p-5 h-fit">
        <h3 class="text-sm font-semibold text-slate-300 mb-4">{{ editingId ? 'Edit Category' : 'New Category' }}</h3>
        <div class="space-y-3">
          <div>
            <label class="text-xs text-slate-500 mb-1 block">Name *</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="e.g. Electronics"
              maxlength="60"
              class="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/60 transition"
            />
          </div>
          <div>
            <label class="text-xs text-slate-500 mb-1 block">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Optional description…"
              class="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/60 transition resize-none"
            />
          </div>
          <div class="flex gap-2">
            <button
              @click="saveCategory"
              :disabled="formLoading"
              class="flex-1 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition"
            >
              {{ formLoading ? '…' : editingId ? 'Save Changes' : 'Create Category' }}
            </button>
            <button
              v-if="editingId"
              @click="cancelEdit"
              class="px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl text-sm transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Category list -->
      <div class="lg:col-span-2">
        <LoadingSpinner v-if="loading" />
        <EmptyState v-else-if="!categories.length" title="No categories yet" subtitle="Create the first category using the form." />
        <div v-else class="space-y-2">
          <div
            v-for="cat in categories"
            :key="cat._id"
            class="group flex items-center gap-4 bg-slate-900 border border-slate-800/60 hover:border-slate-700/80 rounded-xl px-4 py-3.5 transition"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-200">{{ cat.name }}</p>
              <p v-if="cat.description" class="text-xs text-slate-500 mt-0.5 truncate">{{ cat.description }}</p>
            </div>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
              <button
                @click="startEdit(cat)"
                class="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition"
                title="Edit"
              >
                <Edit2 class="w-4 h-4" />
              </button>
              <button
                @click="deleteModal = { show: true, id: cat._id, name: cat.name, loading: false }"
                class="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                title="Delete"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ConfirmModal
      v-if="deleteModal.show"
      title="Delete Category"
      :message="`Delete &quot;${deleteModal.name}&quot;? Products in this category will be uncategorized.`"
      confirm-label="Delete"
      confirm-class="bg-rose-500 hover:bg-rose-400"
      :loading="deleteModal.loading"
      @confirm="confirmDelete"
      @cancel="deleteModal.show = false"
    />
  </div>
</template>
