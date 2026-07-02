<script setup>
import { computed, ref } from "vue";
import { Star } from "lucide-vue-next";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

const hoveredRating = ref(null);

const selectedRating = computed({
  get: () => props.modelValue ?? "",
  set: (value) => emit("update:modelValue", value),
});

const displayedRating = computed(
  () => hoveredRating.value ?? selectedRating.value ?? 0,
);

const selectRating = (value) => {
  selectedRating.value = value;
  hoveredRating.value = null;
};

const clearRating = () => {
  selectedRating.value = "";
  hoveredRating.value = null;
};
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <span
        class="text-[11px] font-bold text-slate-400 uppercase tracking-widest"
        >Minimum Rating</span
      >
      <button
        type="button"
        @click="clearRating"
        class="text-[11px] font-semibold text-emerald-450 hover:text-emerald-400 transition"
      >
        Any
      </button>
    </div>

    <div class="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
      <div class="flex items-center gap-2">
        <button
          v-for="star in 5"
          :key="star"
          type="button"
          class="p-1 transition hover:scale-110"
          :aria-label="`${star} star${star > 1 ? 's' : ''}`"
          @click="selectRating(star)"
          @mouseenter="hoveredRating = star"
          @mouseleave="hoveredRating = null"
        >
          <Star
            class="h-5 w-5 transition"
            :class="
              star <= displayedRating
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-600'
            "
          />
        </button>
      </div>

      <p class="mt-2 text-[11px] text-slate-400">
        <span v-if="selectedRating !== ''"
          >Minimum: {{ selectedRating }} star{{
            selectedRating > 1 ? "s" : ""
          }}+</span
        >
        <span v-else>Tap the stars to set a minimum rating</span>
      </p>
    </div>
  </div>
</template>
