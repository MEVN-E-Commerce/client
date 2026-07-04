<template>
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl gap-4 hover:border-slate-700 transition duration-200">
    <div class="flex items-center space-x-4 w-full sm:w-auto">
      <!-- Product Image -->
      <div class="h-16 w-16 bg-slate-950 border border-slate-850 rounded-xl overflow-hidden flex items-center justify-center text-slate-500 shrink-0">
        <img v-if="imageUrl" :src="imageUrl" :alt="item.productId?.name" class="h-full w-full object-cover" />
        <ShoppingBag v-else class="h-6 w-6 text-slate-600" />
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <h4 class="font-bold text-white truncate text-base">{{ item.productId?.name }}</h4>
        <p class="text-emerald-400 font-semibold text-sm mt-0.5">
          ${{ formatPrice(price) }}
        </p>
        <!-- Stock availability hint -->
        <p v-if="item.productId?.stock <= 5" class="text-amber-500 text-xs mt-1 flex items-center space-x-1">
          <AlertCircle class="h-3.5 w-3.5" />
          <span>Only {{ item.productId?.stock }} left in stock</span>
        </p>
      </div>
    </div>

    <!-- Stepper & Actions -->
    <div class="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6 sm:space-x-8">
      <!-- Quantity Stepper -->
      <div class="flex flex-col items-center">
        <div class="flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
          <button
            type="button"
            @click="decrement"
            :disabled="item.quantity <= 1 || loading"
            class="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-900 transition duration-150 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
          >
            <Minus class="h-4 w-4" />
          </button>
          
          <span class="px-3 font-semibold text-white min-w-[2rem] text-center text-sm">
            {{ item.quantity }}
          </span>

          <button
            type="button"
            @click="increment"
            :disabled="loading || item.quantity >= (item.productId?.stock || 9999)"
            class="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-900 transition duration-150 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
          >
            <Plus class="h-4 w-4" />
          </button>
        </div>
        <span v-if="item.quantity >= (item.productId?.stock || 9999)" class="text-amber-500 text-[10px] mt-1 font-medium">
          Max stock reached
        </span>
      </div>

      <!-- Line Subtotal -->
      <div class="text-right min-w-[5.5rem] hidden sm:block">
        <span class="text-slate-400 text-xs block mb-0.5">Subtotal</span>
        <span class="text-white font-bold text-sm">
          ${{ formatPrice(price * item.quantity) }}
        </span>
      </div>

      <!-- Remove Button -->
      <button
        type="button"
        @click="$emit('remove')"
        :disabled="loading"
        class="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition duration-150 disabled:opacity-35 cursor-pointer"
      >
        <Trash2 class="h-5 w-5" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Minus, Plus, Trash2, ShoppingBag, AlertCircle } from 'lucide-vue-next';

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update-quantity', 'remove']);

const price = computed(() => {
  return props.item.priceAtAdd || props.item.productId?.price || 0;
});

const imageUrl = computed(() => {
  const images = props.item.productId?.images || [];
  return images.length > 0 ? images[0] : null;
});

const formatPrice = (val) => {
  return Number(val).toFixed(2);
};

const decrement = () => {
  if (props.item.quantity > 1) {
    emit('update-quantity', props.item.quantity - 1);
  }
};

const increment = () => {
  const stock = props.item.productId?.stock || 9999;
  if (props.item.quantity < stock) {
    emit('update-quantity', props.item.quantity + 1);
  }
};
</script>
