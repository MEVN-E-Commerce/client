<script setup>
import { ref, computed } from 'vue';
import { Upload, X, Image } from 'lucide-vue-next';
import { uploadBannerImage } from '../../api/admin';
import { useToast } from '../../composables/useToast';

const props = defineProps({
  modelValue: { type: String, default: '' },
  accept: { type: String, default: 'image/*' },
  maxMb: { type: Number, default: 5 }
});

const emit = defineEmits(['update:modelValue']);
const toast = useToast();

const fileInput = ref(null);
const dragOver = ref(false);
const uploading = ref(false);
const preview = computed(() => props.modelValue);

const handleFile = async (file) => {
  if (!file) return;

  // Validate type
  if (!file.type.startsWith('image/')) {
    toast.error('Please upload an image file');
    return;
  }

  // Validate size
  if (file.size > props.maxMb * 1024 * 1024) {
    toast.error(`Image must be smaller than ${props.maxMb}MB`);
    return;
  }

  const formData = new FormData();
  formData.append('image', file);
  uploading.value = true;

  try {
    const data = await uploadBannerImage(formData);
    emit('update:modelValue', data.imageUrl);
    toast.success('Image uploaded successfully');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Upload failed');
  } finally {
    uploading.value = false;
  }
};

const onDrop = (e) => {
  dragOver.value = false;
  const file = e.dataTransfer?.files[0];
  handleFile(file);
};

const onInputChange = (e) => handleFile(e.target.files[0]);

const removeImage = () => {
  emit('update:modelValue', '');
  if (fileInput.value) fileInput.value.value = '';
};
</script>

<template>
  <div>
    <!-- Preview -->
    <div v-if="preview" class="relative mb-3 group">
      <img :src="preview" class="w-full h-40 object-cover rounded-xl border border-slate-700/60" alt="Preview" />
      <button
        @click="removeImage"
        class="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition"
        aria-label="Remove image"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Drop zone -->
    <div
      v-else
      @click="fileInput?.click()"
      @dragover.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @drop.prevent="onDrop"
      :class="[
        'flex flex-col items-center justify-center gap-2 h-36 rounded-xl border-2 border-dashed cursor-pointer transition',
        dragOver
          ? 'border-violet-400 bg-violet-500/10'
          : 'border-slate-700 hover:border-slate-500 bg-slate-800/40'
      ]"
    >
      <div v-if="uploading" class="flex flex-col items-center gap-2">
        <svg class="w-7 h-7 animate-spin text-violet-400" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p class="text-xs text-slate-400">Uploading…</p>
      </div>
      <template v-else>
        <div class="p-3 bg-slate-700/60 rounded-xl">
          <Upload class="w-5 h-5 text-slate-400" />
        </div>
        <p class="text-sm text-slate-400">Drag & drop or <span class="text-violet-400 font-medium">browse</span></p>
        <p class="text-xs text-slate-600">PNG, JPG, WebP up to {{ maxMb }}MB</p>
      </template>
    </div>

    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      class="hidden"
      @change="onInputChange"
    />
  </div>
</template>
