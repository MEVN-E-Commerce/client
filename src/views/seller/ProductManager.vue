<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { 
  getProducts, 
  getCategories, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  uploadProductImages 
} from '../../api/products';

const store = useStore();
const router = useRouter();
const route = useRoute();

const currentUser = computed(() => store.getters['auth/currentUser']);

// View toggles: 'list' or 'form'
const viewState = ref('list');

// Data lists
const products = ref([]);
const categories = ref([]);
const loading = ref(false);
const error = ref(null);
const successMessage = ref(null);

// Form state
const isEditMode = ref(false);
const editProductId = ref(null);
const categoryLoading = ref(false);
const uploadLoading = ref(false);

const form = ref({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  categoryId: '',
  images: [],
  isActive: true
});

// Load all seller products (or all products if admin)
const loadProducts = async () => {
  loading.value = true;
  error.value = null;
  try {
    const params = {
      isActive: 'all' // We want to see inactive drafts too
    };
    // If not admin, restrict to sellerId
    if (currentUser.value && currentUser.value.role === 'seller') {
      params.sellerId = currentUser.value._id;
    }
    
    const data = await getProducts(params);
    products.value = data.products || [];
  } catch (err) {
    console.error('Failed to load products:', err);
    error.value = 'Failed to load your products list.';
  } finally {
    loading.value = false;
  }
};

// Fetch category dropdown options
const loadCategories = async () => {
  categoryLoading.value = true;
  try {
    const data = await getCategories();
    categories.value = data.categories || [];
  } catch (err) {
    console.error('Failed to load categories:', err);
  } finally {
    categoryLoading.value = false;
  }
};

// File Upload Handler (automatic client-side upload via Multer to Cloudinary)
const handleImageUpload = async (event) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('images', files[i]);
  }

  uploadLoading.value = true;
  error.value = null;
  
  try {
    const response = await uploadProductImages(formData);
    if (response.success && response.imageUrls) {
      form.value.images = [...form.value.images, ...response.imageUrls];
      triggerNotice('success', 'Images uploaded successfully!');
    }
  } catch (err) {
    console.error('Image upload failed:', err);
    error.value = err.response?.data?.message || 'Failed to upload images.';
  } finally {
    uploadLoading.value = false;
    event.target.value = ''; // clear input
  }
};

// Remove image from draft array
const removeImage = (index) => {
  form.value.images.splice(index, 1);
};

// Trigger form opening for create
const openCreateForm = () => {
  isEditMode.value = false;
  editProductId.value = null;
  form.value = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: categories.value[0]?._id || '',
    images: [],
    isActive: true
  };
  viewState.value = 'form';
};

// Trigger form opening for edit
const openEditForm = (prod) => {
  isEditMode.value = true;
  editProductId.value = prod._id;
  form.value = {
    name: prod.name,
    description: prod.description || '',
    price: prod.price,
    stock: prod.stock,
    categoryId: prod.categoryId?._id || prod.categoryId,
    images: [...prod.images],
    isActive: prod.isActive
  };
  viewState.value = 'form';
};

// Cancel and discard form
const cancelForm = () => {
  viewState.value = 'list';
  error.value = null;
  // If we came here from raw query params, clear them
  if (route.query.edit) {
    router.replace({ path: '/seller/products' });
  }
};

// Form submission (Save / Add)
const submitForm = async () => {
  error.value = null;
  
  if (!form.value.name.trim()) {
    error.value = 'Product name is required.';
    return;
  }
  if (form.value.price < 0) {
    error.value = 'Price cannot be negative.';
    return;
  }
  if (form.value.stock < 0) {
    error.value = 'Stock cannot be negative.';
    return;
  }
  if (!form.value.categoryId) {
    error.value = 'Please select a product category.';
    return;
  }

  loading.value = true;
  try {
    const payload = {
      ...form.value,
      price: parseFloat(form.value.price),
      stock: parseInt(form.value.stock, 10)
    };

    if (isEditMode.value) {
      await updateProduct(editProductId.value, payload);
      triggerNotice('success', 'Product updated successfully!');
    } else {
      await createProduct(payload);
      triggerNotice('success', 'Product created successfully!');
    }

    // Go back and refresh list
    await loadProducts();
    viewState.value = 'list';
    if (route.query.edit) {
      router.replace({ path: '/seller/products' });
    }
  } catch (err) {
    console.error('Failed to save product:', err);
    error.value = err.response?.data?.message || 'Failed to save product details.';
  } finally {
    loading.value = false;
  }
};

// Delete product handler
const handleDeleteProduct = async (id, name) => {
  if (!confirm(`Are you sure you want to delete "${name}"?`)) {
    return;
  }

  loading.value = true;
  try {
    await deleteProduct(id);
    triggerNotice('success', 'Product deleted successfully.');
    await loadProducts();
  } catch (err) {
    console.error('Deletion error:', err);
    error.value = err.response?.data?.message || 'Failed to delete product.';
  } finally {
    loading.value = false;
  }
};

// Helper alert duration trigger
const triggerNotice = (type, msg) => {
  if (type === 'success') {
    successMessage.value = msg;
    setTimeout(() => {
      successMessage.value = null;
    }, 4000);
  }
};

onMounted(async () => {
  await loadCategories();
  await loadProducts();
  
  // If URL has direct "?edit=id" query param, load/toggle edit view immediately
  if (route.query.edit) {
    const found = products.value.find(p => p._id === route.query.edit);
    if (found) {
      openEditForm(found);
    } else {
      // Fetch details directly if not in initial list query
      try {
        const detail = await getProductById(route.query.edit);
        if (detail.product) {
          openEditForm(detail.product);
        }
      } catch (err) {
        console.error('Direct edit retrieve failed:', err);
      }
    }
  }
});

// Watch query parameters for changes (e.g. clicking edit from details page)
watch(() => route.query.edit, (newId) => {
  if (newId) {
    const found = products.value.find(p => p._id === newId);
    if (found) {
      openEditForm(found);
    }
  } else {
    viewState.value = 'list';
  }
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    
    <!-- Title Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-white tracking-tight">
          {{ viewState === 'list' ? 'Product Management' : (isEditMode ? 'Modify Product Info' : 'Add New Product') }}
        </h1>
        <p class="text-slate-400 text-sm mt-1">
          Manage listings, inventories, pricing, and upload product images.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Dashboard List Toggle -->
        <button 
          v-if="viewState === 'list'" 
          @click="openCreateForm"
          class="px-5 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:opacity-90 active:scale-95 text-slate-950 font-bold rounded-xl text-sm transition duration-200 cursor-pointer shadow-lg shadow-cyan-500/10"
        >
          + Add Product
        </button>

        <button 
          v-else 
          @click="cancelForm"
          class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-semibold rounded-xl text-sm transition duration-200 border border-slate-700"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Alert Banners -->
    <div v-if="successMessage" class="mb-6 p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm flex items-center space-x-2">
      <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ successMessage }}</span>
    </div>

    <div v-if="error" class="mb-6 p-4 bg-rose-950/20 border border-rose-500/30 rounded-2xl text-rose-400 text-sm flex items-start space-x-2">
      <svg class="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- ======================================================== -->
    <!-- VIEW A: PRODUCTS TABLE LIST                              -->
    <!-- ======================================================== -->
    <div v-if="viewState === 'list'">
      <!-- Loading State -->
      <div v-if="loading && products.length === 0" class="flex flex-col items-center justify-center py-20 space-y-4">
        <svg class="animate-spin h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-slate-400 font-medium">Loading inventory lists...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="products.length === 0" class="bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center max-w-xl mx-auto py-16">
        <svg class="h-16 w-16 text-slate-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <h3 class="text-xl font-bold text-slate-200">No products uploaded yet</h3>
        <p class="text-slate-450 mt-2 max-w-sm mx-auto leading-relaxed">
          Create your very first listing to start selling on the MEVN marketplace.
        </p>
        <button 
          @click="openCreateForm" 
          class="mt-6 px-6 py-2.5 bg-slate-800 hover:bg-slate-750 text-sm font-semibold rounded-xl text-slate-200 border border-slate-700 cursor-pointer transition active:scale-95"
        >
          Create First Product
        </button>
      </div>

      <!-- Table View -->
      <div v-else class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold text-slate-450 uppercase tracking-wider">
                <th class="py-4 px-6">Product Details</th>
                <th class="py-4 px-6">Category</th>
                <th class="py-4 px-6">Price</th>
                <th class="py-4 px-6">Stock</th>
                <th class="py-4 px-6">Status</th>
                <th class="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            
            <tbody class="divide-y divide-slate-800/60 text-sm">
              <tr 
                v-for="prod in products" 
                :key="prod._id"
                class="hover:bg-slate-850/30 transition duration-150"
              >
                <!-- Image & Name -->
                <td class="py-4 px-6">
                  <div class="flex items-center space-x-3">
                    <img 
                      :src="prod.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'" 
                      class="w-12 h-12 rounded-xl object-contain bg-slate-950 border border-slate-800"
                    />
                    <div>
                      <router-link 
                        :to="`/products/${prod._id}`" 
                        class="font-semibold text-slate-200 hover:text-emerald-400 hover:underline block"
                      >
                        {{ prod.name }}
                      </router-link>
                      <span class="text-xs text-slate-500 line-clamp-1 max-w-[250px]">{{ prod.description }}</span>
                    </div>
                  </div>
                </td>

                <!-- Category -->
                <td class="py-4 px-6">
                  <span class="px-2.5 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 rounded-full text-xs font-medium uppercase font-mono">
                    {{ prod.categoryId?.name || 'Category' }}
                  </span>
                </td>

                <!-- Price -->
                <td class="py-4 px-6 text-slate-200 font-medium">
                  ${{ prod.price.toFixed(2) }}
                </td>

                <!-- Stock -->
                <td class="py-4 px-6">
                  <span 
                    :class="[
                      prod.stock > 10 ? 'text-slate-350' : 
                      prod.stock > 0 ? 'text-amber-400 font-semibold' : 
                      'text-rose-455 font-bold'
                    ]"
                  >
                    {{ prod.stock }} units
                  </span>
                </td>

                <!-- Status Checkbox -->
                <td class="py-4 px-6">
                  <span 
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                    :class="prod.isActive ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'"
                  >
                    {{ prod.isActive ? 'Active' : 'Draft' }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="py-4 px-6 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end space-x-3">
                    <!-- Edit Button -->
                    <button 
                      @click="openEditForm(prod)"
                      class="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg cursor-pointer transition"
                      title="Edit Product"
                    >
                      <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>

                    <!-- Delete Button -->
                    <button 
                      @click="handleDeleteProduct(prod._id, prod.name)"
                      class="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg cursor-pointer transition"
                      title="Delete Product"
                    >
                      <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>


    <!-- ======================================================== -->
    <!-- VIEW B: PRODUCT CREATE / EDIT FORM                       -->
    <!-- ======================================================== -->
    <div v-else-if="viewState === 'form'" class="max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl relative">
      <div v-if="loading" class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm z-30 rounded-3xl flex items-center justify-center">
        <div class="flex space-x-3 items-center text-emerald-400 font-bold bg-slate-900/90 border border-slate-850 px-6 py-4 rounded-2xl">
          <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm">Saving details & updating database...</span>
        </div>
      </div>

      <form @submit.prevent="submitForm" class="space-y-6">
        
        <!-- Two Column grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Product Name -->
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-300 uppercase tracking-wider block">Product Title <span class="text-red-400">*</span></label>
            <input 
              v-model="form.name"
              type="text"
              required
              placeholder="e.g. Noise cancelling wireless headphones"
              class="w-full bg-slate-950 text-slate-100 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition"
            />
          </div>

          <!-- Category Selection -->
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-300 uppercase tracking-wider block">Category <span class="text-red-400">*</span></label>
            <div class="relative">
              <select 
                v-model="form.categoryId"
                required
                class="w-full bg-slate-950 text-slate-100 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none transition cursor-pointer"
              >
                <option value="" disabled>Choose Category</option>
                <option v-for="cat in categories" :key="cat._id" :value="cat._id">
                  {{ cat.name }}
                </option>
              </select>
              <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Price -->
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-300 uppercase tracking-wider block">Retail Price ($) <span class="text-red-400">*</span></label>
            <input 
              v-model.number="form.price"
              type="number"
              step="0.01"
              min="0"
              required
              class="w-full bg-slate-950 text-slate-100 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition"
            />
          </div>

          <!-- Stock -->
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-300 uppercase tracking-wider block">Inventory Stock quantity <span class="text-red-400">*</span></label>
            <input 
              v-model.number="form.stock"
              type="number"
              min="0"
              required
              class="w-full bg-slate-950 text-slate-100 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition"
            />
          </div>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <label class="text-xs font-bold text-slate-300 uppercase tracking-wider block">Description</label>
          <textarea 
            v-model="form.description"
            rows="4"
            placeholder="Type comprehensive details describing the product design, size, model, warranty specifications etc..."
            class="w-full bg-slate-950 text-slate-100 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition resize-y"
          ></textarea>
        </div>

        <!-- Image Upload Section -->
        <div class="space-y-3">
          <label class="text-xs font-bold text-slate-300 uppercase tracking-wider block">Product Images</label>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Drag and drop zone / Upload Trigger -->
            <label 
              class="border-2 border-dashed rounded-3xl border-slate-800 hover:border-emerald-500 hover:bg-slate-950/45 transition duration-200 flex flex-col items-center justify-center py-8 text-center cursor-pointer relative"
              :class="{ 'opacity-50 pointer-events-none': uploadLoading }"
            >
              <input 
                type="file" 
                multiple 
                accept="image/*"
                @change="handleImageUpload" 
                class="hidden" 
              />
              
              <div v-if="uploadLoading" class="flex flex-col items-center space-y-2">
                <svg class="animate-spin h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-xs text-slate-400 font-medium">Uploading to cloud storage...</span>
              </div>
              
              <div v-else class="flex flex-col items-center space-y-2">
                <svg class="h-8 w-8 text-slate-650" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="text-xs font-semibold text-slate-300">Click to upload photos</span>
                <span class="text-[10px] text-slate-500">Supports PNG, JPG, GIF up to 5MB</span>
              </div>
            </label>

            <!-- Previews -->
            <div class="grid grid-cols-3 gap-3 border border-slate-800 p-4 rounded-3xl bg-slate-950/70 overflow-y-auto max-h-[140px]">
              <div 
                v-for="(imgUrl, index) in form.images" 
                :key="index"
                class="aspect-square bg-slate-900 rounded-xl relative overflow-hidden group border border-slate-800"
              >
                <img :src="imgUrl" class="object-cover w-full h-full" />
                <button 
                  type="button"
                  @click="removeImage(index)"
                  class="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-500/80 rounded-full text-white cursor-pointer transition"
                  title="Remove Image"
                >
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div 
                v-if="form.images.length === 0" 
                class="col-span-3 flex items-center justify-center h-full text-xs text-slate-600 italic"
              >
                No images added yet. Default unsplash photo will be used if ignored.
              </div>
            </div>

          </div>
        </div>

        <!-- Active Toggle -->
        <div class="flex items-center space-x-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800 max-w-sm">
          <input 
            v-model="form.isActive"
            type="checkbox"
            id="isActive"
            class="h-4.5 w-4.5 text-emerald-500 accent-emerald-500 cursor-pointer bg-slate-900 border-slate-800 rounded"
          />
          <div>
            <label for="isActive" class="text-xs font-bold text-slate-350 select-none cursor-pointer uppercase tracking-wider block">Publish Listing</label>
            <span class="text-[10px] text-slate-500 block">Make this store item immediately visible to buyers.</span>
          </div>
        </div>

        <!-- Form Button Row -->
        <div class="border-t border-slate-800/80 pt-6 flex items-center justify-end space-x-3">
          <button 
            type="button" 
            @click="cancelForm"
            class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-semibold rounded-xl text-sm transition duration-200 border border-slate-700 cursor-pointer"
          >
            Cancel
          </button>
          
          <button 
            type="submit"
            class="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-extrabold rounded-xl text-sm transition duration-200 cursor-pointer shadow-lg shadow-cyan-500/10 active:scale-95 scroll-smooth"
          >
            {{ isEditMode ? 'Save Upgrades' : 'List Product' }}
          </button>
        </div>

      </form>
    </div>

  </div>
</template>
