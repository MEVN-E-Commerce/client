<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Mail, MapPin, Heart, ShoppingBag } from 'lucide-vue-next';
import { fetchUserById } from '../../api/admin';
import { useToast } from '../../composables/useToast';
import LoadingSpinner from '../../components/admin/LoadingSpinner.vue';
import StatusBadge from '../../components/admin/StatusBadge.vue';
import PageHeader from '../../components/admin/PageHeader.vue';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const user = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const data = await fetchUserById(route.params.id);
    user.value = data.user;
  } catch (err) {
    toast.error('Failed to load user');
    router.push('/admin/users');
  } finally {
    loading.value = false;
  }
});

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
</script>

<template>
  <div>
    <PageHeader
      title="User Profile"
      :breadcrumb="[{ label: 'Admin', to: '/admin' }, { label: 'Users', to: '/admin/users' }, { label: 'Profile' }]"
    >
      <template #actions>
        <button @click="router.back()" class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition">
          <ArrowLeft class="w-4 h-4" /> Back
        </button>
      </template>
    </PageHeader>

    <LoadingSpinner v-if="loading" />

    <div v-else-if="user" class="grid lg:grid-cols-3 gap-6">
      <!-- Profile card -->
      <div class="bg-slate-900 rounded-2xl border border-slate-800/60 p-6">
        <div class="flex flex-col items-center text-center mb-6">
          <div class="w-20 h-20 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mb-4">
            <span class="text-3xl font-bold text-violet-300">{{ user.name?.charAt(0).toUpperCase() }}</span>
          </div>
          <h2 class="text-lg font-bold text-slate-100">{{ user.name }}</h2>
          <p class="text-sm text-slate-500 flex items-center gap-1 mt-1"><Mail class="w-3 h-3" /> {{ user.email }}</p>
          <div class="flex gap-2 mt-3">
            <StatusBadge :status="user.role" />
            <StatusBadge :status="user.isActive ? 'active' : 'inactive'" />
          </div>
          <div v-if="user.role === 'seller'" class="mt-2">
            <StatusBadge :status="user.sellerStatus || 'approved'" />
          </div>
        </div>

        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-500">Joined</span>
            <span class="text-slate-300">{{ fmt(user.createdAt) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Verified</span>
            <span :class="user.isVerified ? 'text-emerald-400' : 'text-rose-400'">
              {{ user.isVerified ? 'Yes' : 'No' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Wishlist</span>
            <span class="text-slate-300 flex items-center gap-1"><Heart class="w-3 h-3 text-rose-400" /> {{ user.wishlist?.length || 0 }} items</span>
          </div>
        </div>
      </div>

      <!-- Addresses + details -->
      <div class="lg:col-span-2 space-y-5">
        <!-- Addresses -->
        <div class="bg-slate-900 rounded-2xl border border-slate-800/60 p-5">
          <h3 class="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <MapPin class="w-4 h-4 text-violet-400" /> Saved Addresses
          </h3>
          <div v-if="!user.addresses?.length" class="text-sm text-slate-600 text-center py-6">No addresses saved</div>
          <div v-else class="grid sm:grid-cols-2 gap-3">
            <div
              v-for="addr in user.addresses"
              :key="addr._id"
              class="p-3 bg-slate-800/50 rounded-xl border border-slate-700/40 text-sm space-y-0.5"
            >
              <p class="text-slate-200 font-medium">{{ addr.fullName }}</p>
              <p class="text-slate-400">{{ addr.line1 }}<span v-if="addr.line2">, {{ addr.line2 }}</span></p>
              <p class="text-slate-400">{{ addr.city }}, {{ addr.state }} {{ addr.postalCode }}</p>
              <p class="text-slate-500">{{ addr.country }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
