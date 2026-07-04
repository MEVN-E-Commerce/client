<script setup>
import { AlertTriangle } from 'lucide-vue-next';

const props = defineProps({
  title: { type: String, default: 'Confirm Action' },
  message: { type: String, default: 'Are you sure you want to proceed?' },
  confirmLabel: { type: String, default: 'Confirm' },
  confirmClass: { type: String, default: 'bg-rose-500 hover:bg-rose-400' },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['confirm', 'cancel']);
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/70 backdrop-blur-sm"
          @click="!loading && emit('cancel')"
        />

        <!-- Modal -->
        <div class="relative bg-slate-900 border border-slate-700/60 rounded-2xl w-full max-w-md p-6 shadow-2xl">
          <!-- Icon -->
          <div class="flex items-center gap-4 mb-4">
            <div class="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
              <AlertTriangle class="w-6 h-6 text-rose-400" />
            </div>
            <h2 class="text-base font-semibold text-slate-100">{{ title }}</h2>
          </div>

          <p class="text-sm text-slate-400 mb-6 leading-relaxed">{{ message }}</p>

          <div class="flex gap-3 justify-end">
            <button
              @click="emit('cancel')"
              :disabled="loading"
              class="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-50 transition"
            >
              Cancel
            </button>
            <button
              @click="emit('confirm')"
              :disabled="loading"
              :class="['px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition flex items-center gap-2', confirmClass]"
            >
              <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ loading ? 'Processing...' : confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.96); }
</style>
