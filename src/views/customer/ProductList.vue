<script setup>
import { ref, onMounted, watch } from "vue";
import { getProducts, getCategories } from "../../api/products";
import {
  Search,
  SlidersHorizontal,
  PackageOpen,
  Star,
  ArrowRight,
} from "lucide-vue-next";
import RatingFilter from "../../components/product/RatingFilter.vue";

const search = ref("");
const selectedCategory = ref("");
const minPrice = ref("");
const maxPrice = ref("");
const minRating = ref("");

const products = ref([]);
const categories = ref([]);
const loading = ref(false);
const categoriesLoading = ref(false);
const error = ref(null);
const defaultImage =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600";

const loadCategories = async () => {
  categoriesLoading.value = true;
  try {
    const data = await getCategories();
    categories.value = data.categories || [];
  } catch (err) {
    console.error("Failed to load categories:", err);
  } finally {
    categoriesLoading.value = false;
  }
};

const fetchFilteredProducts = async () => {
  loading.value = true;
  error.value = null;

  try {
    const params = {
      isActive: "true",
    };

    const normalizedSearch = search.value.trim();
    if (normalizedSearch) {
      params.search = normalizedSearch;
    }

    if (selectedCategory.value) {
      params.categoryId = selectedCategory.value;
    }

    if (minPrice.value !== "" && !isNaN(parseFloat(minPrice.value))) {
      params.minPrice = minPrice.value;
    }

    if (maxPrice.value !== "" && !isNaN(parseFloat(maxPrice.value))) {
      params.maxPrice = maxPrice.value;
    }

    if (minRating.value !== "") {
      params.minRating = minRating.value;
    }

    const data = await getProducts(params);
    products.value = data.products || [];
  } catch (err) {
    console.error("Failed to load products:", err);
    error.value = "Failed to load products. Check your api service connection.";
  } finally {
    loading.value = false;
  }
};

let debounceTimeout = null;
const triggerDebouncedFetch = () => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    fetchFilteredProducts();
  }, 350);
};

watch([search, minPrice, maxPrice], () => {
  triggerDebouncedFetch();
});

watch(minRating, () => {
  fetchFilteredProducts();
});

const selectCategory = (catId) => {
  if (selectedCategory.value === catId) {
    selectedCategory.value = "";
  } else {
    selectedCategory.value = catId;
  }
  fetchFilteredProducts();
};

const clearFilters = () => {
  search.value = "";
  selectedCategory.value = "";
  minPrice.value = "";
  maxPrice.value = "";
  minRating.value = "";
  fetchFilteredProducts();
};

onMounted(() => {
  loadCategories();
  fetchFilteredProducts();
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold text-white tracking-tight">
        Marketplace Catalog
      </h1>
      <p class="text-slate-450 text-sm mt-1">
        Browse, filter, and search through verified products.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div class="space-y-6 lg:col-span-1">
        <div
          class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2"
        >
          <div
            class="flex items-center justify-between border-b border-slate-850 pb-4 mb-5"
          >
            <div class="flex items-center space-x-2">
              <SlidersHorizontal class="h-4 w-4 text-emerald-400" />
              <span class="text-sm font-extrabold text-slate-200"
                >Catalog Filter Bar</span
              >
            </div>
            <button
              @click="clearFilters"
              class="text-xs text-emerald-450 hover:text-emerald-400 font-semibold cursor-pointer underline decoration-dotted transition"
            >
              Reset Filters
            </button>
          </div>

          <div class="space-y-2 mb-5">
            <label
              class="text-[11px] font-bold text-slate-400 uppercase tracking-widest block"
              >Search Title</label
            >
            <div class="relative">
              <input
                v-model="search"
                type="text"
                placeholder="Type keywords (e.g. watch)..."
                class="w-full bg-slate-950 text-slate-200 text-sm border border-slate-850 focus:border-emerald-500 rounded-xl pl-4 pr-10 py-2.5 focus:outline-none transition"
              />
              <span
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600"
              >
                <Search class="h-4 w-4" />
              </span>
            </div>
          </div>

          <div class="space-y-2 mb-5">
            <label
              class="text-[11px] font-bold text-slate-400 uppercase tracking-widest block"
              >Pick Category</label
            >
            <div
              class="flex flex-col space-y-1.5 max-h-52 overflow-y-auto pr-1"
            >
              <button
                v-for="cat in categories"
                :key="cat._id"
                @click="selectCategory(cat._id)"
                class="w-full px-3 py-2 text-left rounded-xl transition text-xs font-semibold flex items-center justify-between border cursor-pointer"
                :class="
                  selectedCategory === cat._id
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-450'
                    : 'bg-slate-950/20 border-slate-850 hover:border-slate-800 text-slate-350'
                "
              >
                <span class="truncate">{{ cat.name }}</span>
                <span
                  v-if="selectedCategory === cat._id"
                  class="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 select-none"
                ></span>
              </button>
              <div
                v-if="categories.length === 0"
                class="text-xs text-slate-500 italic"
              >
                No categories loaded.
              </div>
            </div>
          </div>

          <div class="space-y-2 mb-5">
            <label
              class="text-[11px] font-bold text-slate-400 uppercase tracking-widest block"
              >Price Match ($)</label
            >
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model.number="minPrice"
                type="number"
                min="0"
                placeholder="Min 0.0"
                class="w-full bg-slate-950 text-slate-100 text-xs border border-slate-850 focus:border-emerald-500 rounded-lg px-2.5 py-2 focus:outline-none transition"
              />
              <input
                v-model.number="maxPrice"
                type="number"
                min="0"
                placeholder="Max max"
                class="w-full bg-slate-950 text-slate-100 text-xs border border-slate-850 focus:border-emerald-500 rounded-lg px-2.5 py-2 focus:outline-none transition"
              />
            </div>
          </div>

          <div class="space-y-2">
            <RatingFilter v-model="minRating" />
          </div>
        </div>
      </div>

      <div class="lg:col-span-3 space-y-6">
        <div
          v-if="loading"
          class="flex flex-col items-center justify-center py-28 bg-slate-900 border border-slate-800 rounded-3xl space-y-4"
        >
          <div
            class="animate-spin rounded-full h-10 w-10 border-2 border-emerald-400 border-t-transparent"
          ></div>
          <span class="text-slate-400 text-sm font-medium animate-pulse"
            >Running database matchers...</span
          >
        </div>

        <div
          v-else-if="error"
          class="p-8 bg-red-950/25 border border-red-500/20 rounded-3xl text-center"
        >
          <span class="text-red-400 block font-bold">Catalog Fetch Error</span>
          <p class="text-slate-500 text-xs mt-1">{{ error }}</p>
        </div>

        <div
          v-else-if="products.length === 0"
          class="bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center py-20"
        >
          <PackageOpen class="h-16 w-16 text-slate-700 mx-auto mb-4" />
          <h3 class="text-xl font-bold text-slate-300">No items found</h3>
          <p
            class="text-slate-500 text-sm mt-1 max-w-sm mx-auto leading-relaxed"
          >
            We couldn't query any records matching current details. Discard some
            fields to rebuild items registry.
          </p>
          <button
            @click="clearFilters"
            class="mt-6 px-5 py-2.5 bg-slate-850 hover:bg-slate-800 font-bold rounded-xl text-xs text-slate-200 border border-slate-750 transition"
          >
            Reset Catalog Search
          </button>
        </div>

        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        >
          <div
            v-for="prod in products"
            :key="prod._id"
            class="bg-slate-900 border border-slate-800/80 rounded-3xl overflow-hidden hover:border-slate-700 shadow-xl flex flex-col justify-between group transition duration-200"
          >
            <div>
              <div
                class="h-44 bg-slate-950 border-b border-slate-850 overflow-hidden relative flex items-center justify-center p-2"
              >
                <img
                  :src="prod.images?.[0] || defaultImage"
                  class="object-contain max-h-full transition duration-300 group-hover:scale-103"
                  loading="lazy"
                />

                <div class="absolute top-3 left-3">
                  <span
                    class="px-2.5 py-0.5 bg-slate-900/90 border border-slate-800/60 text-slate-400 text-[10px] font-semibold rounded-full uppercase tracking-wider font-mono"
                  >
                    {{ prod.categoryId?.name || "Category" }}
                  </span>
                </div>

                <div
                  class="absolute top-3 right-3 flex items-center bg-slate-950/80 backdrop-blur-md px-2 py-0.5 border border-slate-800 rounded-full"
                >
                  <Star class="h-3 w-3 text-amber-400 mr-1 fill-current" />
                  <span
                    class="text-slate-100 font-bold text-[10px] font-mono leading-none"
                    >{{
                      prod.rating !== undefined
                        ? Number(prod.rating).toFixed(1)
                        : "0.0"
                    }}</span
                  >
                </div>

                <div
                  v-if="prod.stock <= 0"
                  class="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center"
                >
                  <span
                    class="px-3 py-1 bg-red-950 border border-red-500/30 text-rose-455 text-xs font-bold rounded-full uppercase tracking-wider"
                  >
                    Sold Out
                  </span>
                </div>
              </div>

              <div class="p-5 flex flex-col space-y-1.5">
                <router-link
                  :to="`/products/${prod._id}`"
                  class="text-base font-bold text-slate-100 hover:text-emerald-450 whitespace-nowrap overflow-hidden text-ellipsis block tracking-tight transition"
                  :title="prod.name"
                >
                  {{ prod.name }}
                </router-link>

                <p
                  class="text-xs text-slate-450 line-clamp-2 leading-relaxed min-h-9"
                >
                  {{ prod.description || "No description listed." }}
                </p>
              </div>
            </div>

            <div
              class="p-5 mt-auto flex items-center justify-between border-t border-slate-800/50 pb-5 pt-4"
            >
              <div>
                <span
                  class="text-[9px] text-slate-500 block uppercase font-medium"
                  >UnitPrice</span
                >
                <span class="text-lg font-bold text-slate-205 font-mono"
                  >${{ prod.price.toFixed(2) }}</span
                >
              </div>

              <router-link
                :to="`/products/${prod._id}`"
                class="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-850 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-750 group-hover:border-emerald-500/70 rounded-xl transition duration-150"
              >
                <span>Inspect</span>
                <ArrowRight class="h-3.5 w-3.5" />
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
