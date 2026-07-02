<script setup>
import { ref, onMounted } from "vue";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/products";
import {
  CheckCircle2,
  AlertTriangle,
  PencilLine,
  Trash2,
  PlusCircle,
} from "lucide-vue-next";

const categories = ref([]);
const loading = ref(false);
const submitLoading = ref(false);
const error = ref(null);
const successMessage = ref(null);

const isEditMode = ref(false);
const editCategoryId = ref(null);
const form = ref({
  name: "",
  description: "",
});

const loadCategories = async () => {
  loading.value = true;
  error.value = null;
  try {
    const data = await getCategories();
    categories.value = data.categories || [];
  } catch (err) {
    console.error("Failed to load categories:", err);
    error.value = "Failed to load categories catalog.";
  } finally {
    loading.value = false;
  }
};

const handleEditClick = (cat) => {
  isEditMode.value = true;
  editCategoryId.value = cat._id;
  form.value = {
    name: cat.name,
    description: cat.description || "",
  };
  error.value = null;
  successMessage.value = null;
};

const resetForm = () => {
  isEditMode.value = false;
  editCategoryId.value = null;
  form.value = {
    name: "",
    description: "",
  };
  error.value = null;
};

const handleFormSubmit = async () => {
  error.value = null;
  successMessage.value = null;

  const payload = {
    name: form.value.name.trim(),
    description: form.value.description.trim(),
  };

  if (!payload.name) {
    error.value = "Category name is required.";
    return;
  }

  submitLoading.value = true;
  try {
    if (isEditMode.value) {
      await updateCategory(editCategoryId.value, payload);
      triggerNotice("success", "Category updated successfully!");
    } else {
      await createCategory(payload);
      triggerNotice("success", "Category created successfully!");
    }
    resetForm();
    await loadCategories();
  } catch (err) {
    console.error("Failed to save category:", err);
    error.value =
      err.response?.data?.message || "Failed to save category details.";
  } finally {
    submitLoading.value = false;
  }
};

const handleDeleteClick = async (id, name) => {
  if (!confirm(`Are you sure you want to delete category "${name}"?`)) {
    return;
  }

  error.value = null;
  successMessage.value = null;
  loading.value = true;

  try {
    await deleteCategory(id);
    triggerNotice("success", "Category deleted successfully!");
    await loadCategories();
  } catch (err) {
    console.error("Category deletion error:", err);
    error.value = err.response?.data?.message || "Failed to delete category.";
  } finally {
    loading.value = false;
  }
};

const triggerNotice = (type, msg) => {
  if (type === "success") {
    successMessage.value = msg;
    setTimeout(() => {
      successMessage.value = null;
    }, 4500);
  }
};

onMounted(() => {
  loadCategories();
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold text-white tracking-tight">
        Category Dashboard
      </h1>
      <p class="text-slate-400 text-sm mt-1">
        Admin control panel to insert, adjust or purge catalog category labels.
      </p>
    </div>

    <div
      v-if="successMessage"
      class="mb-6 p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl text-emerald-450 text-sm flex items-center space-x-2"
    >
      <CheckCircle2 class="h-5 w-5 shrink-0" />
      <span>{{ successMessage }}</span>
    </div>

    <div
      v-if="error"
      class="mb-6 p-4 bg-rose-950/20 border border-rose-500/30 rounded-2xl text-rose-455 text-sm flex items-start space-x-2"
    >
      <AlertTriangle class="h-5 w-5 shrink-0 mt-0.5" />
      <span>{{ error }}</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-4">
        <div
          class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
        >
          <div
            class="p-6 border-b border-slate-850 bg-slate-900 flex items-center justify-between"
          >
            <div class="flex items-center space-x-2">
              <PlusCircle class="h-4 w-4 text-emerald-400" />
              <h2
                class="text-sm font-extrabold text-slate-100 uppercase tracking-widest"
              >
                Active Categories
              </h2>
            </div>
            <span
              class="px-2.5 py-0.5 bg-slate-950 text-emerald-450 border border-slate-850 rounded-full text-xs font-mono"
            >
              Count: {{ categories.length }}
            </span>
          </div>

          <div
            v-if="loading && categories.length === 0"
            class="flex flex-col items-center justify-center p-20 space-y-3"
          >
            <div
              class="animate-spin rounded-full h-8 w-8 border-2 border-emerald-400 border-t-transparent"
            ></div>
            <span class="text-xs text-slate-450"
              >Loading category indexes...</span
            >
          </div>

          <div
            v-else-if="categories.length === 0"
            class="p-12 text-center text-slate-500 italic"
          >
            No categories populated. Use the create panel to append labels.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr
                  class="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-450 uppercase tracking-wider"
                >
                  <th class="py-3 px-6">Category Label</th>
                  <th class="py-3 px-6">Description</th>
                  <th class="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-850 text-sm">
                <tr
                  v-for="cat in categories"
                  :key="cat._id"
                  class="hover:bg-slate-850/20 transition duration-100"
                >
                  <td class="py-4 px-6 font-semibold text-slate-200">
                    {{ cat.name }}
                  </td>
                  <td class="py-4 px-6 text-slate-400 max-w-70">
                    <p class="truncate" :title="cat.description">
                      {{ cat.description || "No description added..." }}
                    </p>
                  </td>
                  <td class="py-4 px-6 text-right whitespace-nowrap">
                    <div class="flex items-center justify-end space-x-2.5">
                      <button
                        @click="handleEditClick(cat)"
                        class="p-2 text-slate-450 hover:text-emerald-450 hover:bg-slate-800 rounded-lg cursor-pointer transition"
                        title="Edit Category Name"
                      >
                        <PencilLine class="h-4 w-4" />
                      </button>
                      <button
                        @click="handleDeleteClick(cat._id, cat.name)"
                        class="p-2 text-slate-450 hover:text-rose-455 hover:bg-slate-800 rounded-lg cursor-pointer transition"
                        title="Delete Category"
                      >
                        <Trash2 class="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="lg:col-span-1">
        <div
          class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 space-y-6"
        >
          <div class="border-b border-slate-850 pb-4">
            <h3
              class="text-sm font-extrabold text-slate-100 uppercase tracking-widest"
            >
              {{ isEditMode ? "Modify Category" : "Create Category" }}
            </h3>
            <p class="text-[10px] text-slate-500 mt-1">
              Configure attributes for product filtering categorizations.
            </p>
          </div>

          <form @submit.prevent="handleFormSubmit" class="space-y-4">
            <div class="space-y-2">
              <label
                class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block"
                >Category Title *</label
              >
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="e.g. Home Decor"
                class="w-full bg-slate-950 text-slate-200 text-sm border border-slate-850 focus:border-emerald-500 rounded-xl px-4 py-2.5 focus:outline-none transition"
              />
            </div>

            <div class="space-y-2">
              <label
                class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block"
                >Short Description</label
              >
              <textarea
                v-model="form.description"
                rows="3"
                placeholder="Describe this category listing scope..."
                class="w-full bg-slate-950 text-slate-200 text-sm border border-slate-850 focus:border-emerald-500 rounded-xl px-4 py-2.5 focus:outline-none transition resize-none"
              ></textarea>
            </div>

            <div class="pt-4 flex items-center justify-end space-x-2">
              <button
                v-if="isEditMode"
                type="button"
                @click="resetForm"
                class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-300 border border-slate-800 transition cursor-pointer"
              >
                Discard
              </button>

              <button
                type="submit"
                :disabled="submitLoading"
                class="px-5 py-2.5 bg-linear-to-r from-emerald-500 to-cyan-500 text-slate-950 font-extrabold rounded-xl text-xs transition duration-200 cursor-pointer shadow-md shadow-cyan-500/5 active:scale-95 disabled:opacity-40"
              >
                {{
                  submitLoading
                    ? "Saving..."
                    : isEditMode
                      ? "Upgrade"
                      : "Create"
                }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
