<script setup>
import { toasts, useToast } from '../../composables/useToast';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next';

const { remove } = useToast();

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

const colorMap = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  error: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  info: 'border-sky-500/30 bg-sky-500/10 text-sky-300'
};

const iconColor = {
  success: 'text-emerald-400',
  error: 'text-rose-400',
  warning: 'text-amber-400',
  info: 'text-sky-400'
};
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed top-4 right-4 z-[200] flex flex-col gap-2.5 w-80 pointer-events-none"
      aria-live="polite"
    >
      <TransitionGroup name="toast" tag="div" class="flex flex-col gap-2.5">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl pointer-events-auto',
            colorMap[toast.type] || colorMap.info
          ]"
        >
          <component
            :is="iconMap[toast.type] || Info"
            :class="['w-4 h-4 shrink-0 mt-0.5', iconColor[toast.type] || 'text-sky-400']"
          />
          <p class="flex-1 text-sm font-medium leading-snug">{{ toast.message }}</p>
          <button
            @click="remove(toast.id)"
            class="shrink-0 opacity-60 hover:opacity-100 transition"
            aria-label="Dismiss"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-leave-active { transition: all 0.2s ease-in; }
.toast-enter-from { opacity: 0; transform: translateX(100%) scale(0.9); }
.toast-leave-to { opacity: 0; transform: translateX(60px) scale(0.9); }
.toast-move { transition: transform 0.3s ease; }
</style>
