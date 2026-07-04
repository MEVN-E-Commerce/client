<template>
  <div class="w-full py-6 px-4">
    <!-- Cancelled State -->
    <div v-if="isCancelled" class="flex items-center justify-center space-x-8">
      <div class="flex flex-col items-center">
        <div class="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
          <Clock class="h-5 w-5" />
        </div>
        <span class="text-xs font-semibold text-slate-400 mt-2">Pending</span>
      </div>
      <div class="h-0.5 w-16 bg-rose-500"></div>
      <div class="flex flex-col items-center">
        <div class="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500 flex items-center justify-center text-rose-400">
          <XCircle class="h-5 w-5 animate-pulse" />
        </div>
        <span class="text-xs font-bold text-rose-400 mt-2">Cancelled</span>
      </div>
    </div>

    <!-- Active/Normal States -->
    <div v-else class="flex items-center justify-between relative max-w-xl mx-auto">
      <template v-for="(step, idx) in steps" :key="step">
        <!-- Connecting Line -->
        <div
          v-if="idx > 0"
          class="flex-1 h-0.5 mx-2 transition-all duration-500"
          :class="idx <= activeIndex ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-slate-800'"
        ></div>

        <!-- Step node -->
        <div class="flex flex-col items-center relative z-10">
          <div
            class="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300"
            :class="[
              idx < activeIndex ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 border-transparent shadow-[0_0_15px_rgba(16,185,129,0.2)]' : '',
              idx === activeIndex ? 'bg-slate-950 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse' : '',
              idx > activeIndex ? 'bg-slate-900 border-slate-800 text-slate-500' : ''
            ]"
          >
            <!-- Custom icons per step -->
            <Clock v-if="step === 'pending'" class="h-5 w-5" />
            <CreditCard v-else-if="step === 'paid'" class="h-5 w-5" />
            <Package v-else-if="step === 'processing'" class="h-5 w-5" />
            <Truck v-else-if="step === 'shipped'" class="h-5 w-5" />
            <CheckCircle2 v-else-if="step === 'delivered'" class="h-5 w-5" />
          </div>
          <span
            class="text-[10px] sm:text-xs font-semibold mt-2.5 whitespace-nowrap transition-colors duration-200"
            :class="idx <= activeIndex ? 'text-white' : 'text-slate-500'"
          >
            {{ formatStepName(step) }}
          </span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Clock, CreditCard, Package, Truck, CheckCircle2, XCircle } from 'lucide-vue-next';
import { ORDER_STATUS } from '../../constants/order';

const props = defineProps({
  status: {
    type: String,
    required: true
  }
});

const steps = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

const isCancelled = computed(() => props.status?.toLowerCase() === ORDER_STATUS.CANCELLED);

const activeIndex = computed(() => {
  return steps.indexOf(props.status?.toLowerCase());
});

const formatStepName = (name) => {
  if (name === 'paid') return 'Paid';
  if (name === 'processing') return 'Processing';
  return name.charAt(0).toUpperCase() + name.slice(1);
};
</script>
