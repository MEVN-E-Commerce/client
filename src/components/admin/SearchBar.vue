<script setup>
import { ref, watch } from 'vue';
import { Search } from 'lucide-vue-next';

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Search...' },
  debounce: { type: Number, default: 350 }
});

const emit = defineEmits(['update:modelValue', 'search']);

const local = ref(props.modelValue);
let timer = null;

watch(() => props.modelValue, v => { local.value = v; });

const onInput = (e) => {
  local.value = e.target.value;
  emit('update:modelValue', local.value);
  clearTimeout(timer);
  timer = setTimeout(() => emit('search', local.value), props.debounce);
};

const clear = () => {
  local.value = '';
  emit('update:modelValue', '');
  emit('search', '');
};
</script>

<template>
  <div class="relative">
    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
    <input
      type="text"
      :value="local"
      :placeholder="placeholder"
      @input="onInput"
      class="w-full pl-9 pr-8 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition"
    />
    <button
      v-if="local"
      @click="clear"
      class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
      aria-label="Clear search"
    >
      <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>
</template>
