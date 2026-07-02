<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getProductById } from "../../api/products";
import { useStore } from "vuex";
import {
  ArrowLeft,
  PencilLine,
  ShoppingBag,
  Star,
  AlertTriangle,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const store = useStore();

const product = ref(null);
const loading = ref(true);
const error = ref(null);
const activeImageIndex = ref(0);

const isAuthenticated = computed(() => store.getters["auth/isAuthenticated"]);
const currentUser = computed(() => store.getters["auth/currentUser"]);

const canEdit = computed(() => {
  if (!isAuthenticated.value || !currentUser.value || !product.value)
    return false;
  return (
    currentUser.value.role === "admin" ||
    (currentUser.value.role === "seller" &&
      product.value.sellerId?._id === currentUser.value._id)
  );
});

const loadProduct = async () => {
  loading.value = true;
  error.value = null;
  try {
    const data = await getProductById(route.params.id);
    product.value = data.product;
    activeImageIndex.value = 0;
  } catch (err) {
    console.error("Failed to load product details:", err);
    error.value =
      err.response?.data?.message || "Product not found or failed to load.";
  } finally {
    loading.value = false;
  }
};

const handleBack = () => {
  router.push("/products");
};

const navigateToEdit = () => {
  router.push({
    path: "/seller/products",
    query: { edit: product.value._id },
  });
};

const getStars = (rating = 0) => {
  const rounded = Math.round(Math.max(0, Math.min(5, rating || 0)));
  return Array.from({ length: 5 }, (_, index) => index < rounded);
};

onMounted(() => {
  loadProduct();
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-6 flex items-center justify-between">
      <button
        @click="handleBack"
        class="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition duration-200"
      >
        <ArrowLeft class="h-5 w-5" />
        <span class="text-sm font-medium">Back to Products</span>
      </button>

      <button
        v-if="canEdit"
        @click="navigateToEdit"
        class="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold rounded-xl text-sm transition duration-200 cursor-pointer shadow-lg shadow-emerald-500/20"
      >
        <PencilLine class="h-4 w-4" />
        <span>Edit Product</span>
      </button>
    </div>

    <div
      v-if="loading"
      class="flex flex-col items-center justify-center py-20 space-y-4"
    >
      <div
        class="animate-spin rounded-full h-10 w-10 border-2 border-emerald-400 border-t-transparent"
      ></div>
      <span class="text-slate-400 font-medium animate-pulse"
        >Loading product details...</span
      >
    </div>

    <div
      v-else-if="error"
      class="bg-red-950/20 border border-red-500/20 p-8 rounded-3xl text-center max-w-lg mx-auto py-12"
    >
      <AlertTriangle class="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 class="text-xl font-bold text-red-200">Error Loading Product</h3>
      <p class="text-slate-400 mt-2 leading-relaxed">{{ error }}</p>
      <button
        @click="loadProduct"
        class="mt-6 px-5 py-2 bg-slate-800 text-sm font-semibold rounded-xl text-slate-200 border border-slate-700 hover:bg-slate-700"
      >
        Retry
      </button>
    </div>

    <div
      v-else-if="product"
      class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
    >
      <div class="flex flex-col space-y-4">
        <div
          class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden aspect-video flex items-center justify-center relative shadow-xl"
        >
          <img
            :src="
              product.images?.[activeImageIndex] ||
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'
            "
            :alt="product.name"
            class="object-contain w-full h-full max-h-112.5"
          />

          <div class="absolute top-4 left-4">
            <span
              class="px-3 py-1 bg-slate-950/80 backdrop-blur-md border border-slate-700/50 text-emerald-400 text-xs font-semibold rounded-full uppercase tracking-wider"
            >
              {{ product.categoryId?.name || "Uncategorized" }}
            </span>
          </div>

          <div v-if="!product.isActive" class="absolute top-4 right-4">
            <span
              class="px-3 py-1 bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-semibold rounded-full"
            >
              Draft / Inactive
            </span>
          </div>
        </div>

        <div
          v-if="product.images && product.images.length > 1"
          class="flex items-center space-x-3 overflow-x-auto py-2"
        >
          <button
            v-for="(img, idx) in product.images"
            :key="idx"
            @click="activeImageIndex = idx"
            class="w-20 h-20 bg-slate-900 border rounded-2xl overflow-hidden shrink-0 flex items-center justify-center p-1 relative transition duration-200"
            :class="
              activeImageIndex === idx
                ? 'border-emerald-400 ring-2 ring-emerald-500/20'
                : 'border-slate-800 hover:border-slate-700'
            "
          >
            <img :src="img" class="object-cover w-full h-full rounded-xl" />
          </button>
        </div>
      </div>

      <div class="flex flex-col justify-between space-y-6">
        <div>
          <h1
            class="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-2"
          >
            {{ product.name }}
          </h1>

          <div class="flex items-center space-x-2 text-sm text-slate-400 mb-6">
            <span>Sold by:</span>
            <span class="font-semibold text-slate-200">{{
              product.sellerId?.name || "Verified Seller"
            }}</span>
            <span class="text-slate-650">•</span>
            <span
              class="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
              >{{ product.sellerId?.email }}</span
            >
          </div>

          <div
            class="flex flex-wrap items-center gap-3 mb-6 border-b border-slate-800/80 pb-6"
          >
            <span class="text-4xl font-extrabold text-slate-100"
              >${{ product.price.toFixed(2) }}</span
            >
            <div
              class="flex items-center space-x-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5"
            >
              <div class="flex items-center">
                <Star
                  v-for="(filled, index) in getStars(product.rating || 0)"
                  :key="index"
                  class="h-4 w-4"
                  :class="
                    filled ? 'text-amber-400 fill-current' : 'text-slate-600'
                  "
                />
              </div>
              <span class="text-sm font-semibold text-slate-200"
                >{{ Number(product.rating || 0).toFixed(1) }} / 5</span
              >
            </div>
            <div class="flex items-center space-x-2">
              <span
                v-if="product.stock > 10"
                class="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium"
              >
                In Stock ({{ product.stock }})
              </span>
              <span
                v-else-if="product.stock > 0"
                class="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-medium"
              >
                Low Stock ({{ product.stock }} left)
              </span>
              <span
                v-else
                class="px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-full text-xs font-medium"
              >
                Out of Stock
              </span>
            </div>
          </div>

          <div class="space-y-3 mb-8">
            <h3
              class="text-sm font-semibold text-slate-350 uppercase tracking-wider"
            >
              Product Description
            </h3>
            <p
              class="text-slate-300 leading-relaxed whitespace-pre-line text-base"
            >
              {{
                product.description ||
                "No description available for this product."
              }}
            </p>
          </div>
        </div>

        <div
          class="bg-slate-900/50 border border-slate-850 p-6 rounded-3xl mt-auto"
        >
          <div class="flex items-center justify-between mb-4">
            <div>
              <span class="text-xs text-slate-500 block">Total Price</span>
              <span class="text-2xl font-bold text-white"
                >${{ product.price.toFixed(2) }}</span
              >
            </div>
            <div class="text-right">
              <span class="text-xs text-slate-500 block">Shipment</span>
              <span class="text-sm font-semibold text-emerald-400"
                >Free Shipping</span
              >
            </div>
          </div>

          <button
            class="w-full inline-flex items-center justify-center space-x-2 py-4 bg-linear-to-r from-emerald-500 to-cyan-500 text-slate-950 font-extrabold text-center rounded-2xl shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-98 transition duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="product.stock <= 0"
          >
            <ShoppingBag class="h-4 w-4" />
            <span>{{
              product.stock > 0 ? "Add to Cart" : "Out of Stock"
            }}</span>
          </button>

          <p class="text-[11px] text-slate-500 text-center mt-3">
            Directly ready to purchase. Cart/Checkout implementation will follow
            in next updates.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
