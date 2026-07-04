<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AdminLayout from './layouts/AdminLayout.vue';
import CustomerLayout from './layouts/CustomerLayout.vue';

const route = useRoute();
const layout = computed(() =>
  route.meta.layout === 'admin' ? AdminLayout : CustomerLayout
);
</script>

<template>
  <component :is="layout">
    <!-- router-view is rendered inside the chosen layout -->
  </component>
</template>
