<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import {
  LayoutDashboard, Users, Store, Package2, ShoppingBag, Tags,
  Image, ChevronLeft, ChevronRight, LogOut, X
} from 'lucide-vue-next';

defineProps({
  collapsed: { type: Boolean, default: false },
  mobileOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['toggle-collapse', 'close-mobile']);

const route = useRoute();
const router = useRouter();
const storeVal = useStore(); // rename local store to avoid collision with Store icon

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Sellers', to: '/admin/sellers', icon: Store },
  { label: 'Products', to: '/admin/products', icon: Package2 },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingBag },
  { label: 'Categories', to: '/admin/categories', icon: Tags },
  { label: 'Banners', to: '/admin/banners', icon: Image }
];

const isActive = (item) => {
  if (item.exact) return route.path === item.to;
  return route.path.startsWith(item.to);
};

const handleLogout = async () => {
  await storeVal.dispatch('auth/logout');
  router.push('/login');
};
</script>

<template>
  <!-- Mobile overlay -->
  <Transition name="fade">
    <div
      v-if="mobileOpen"
      class="fixed inset-0 bg-black/60 z-40 lg:hidden"
      @click="emit('close-mobile')"
    />
  </Transition>

  <!-- Sidebar panel -->
  <aside
    :class="[
      'fixed top-0 left-0 h-full z-50 flex flex-col',
      'bg-slate-900 border-r border-slate-800/60',
      'transition-all duration-300 ease-in-out',
      // Desktop collapse
      collapsed ? 'lg:w-16' : 'lg:w-64',
      // Mobile: slide in/out
      mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
    ]"
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-slate-800/60 min-h-[64px]">
      <Transition name="slide-fade" mode="out-in">
        <span
          v-if="!collapsed"
          class="text-sm font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent whitespace-nowrap overflow-hidden"
        >
          ⚡ Admin Panel
        </span>
        <span v-else class="text-violet-400 font-bold text-lg">⚡</span>
      </Transition>

      <!-- Mobile close -->
      <button
        @click="emit('close-mobile')"
        class="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        aria-label="Close sidebar"
      >
        <X class="w-4 h-4" />
      </button>

      <!-- Desktop collapse toggle -->
      <button
        @click="emit('toggle-collapse')"
        class="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <ChevronLeft v-if="!collapsed" class="w-4 h-4" />
        <ChevronRight v-else class="w-4 h-4" />
      </button>
    </div>

    <!-- Nav items -->
    <nav class="flex-1 py-4 space-y-1 overflow-y-auto overflow-x-hidden px-2">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        @click="emit('close-mobile')"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
          isActive(item)
            ? 'bg-violet-500/15 text-violet-300 border border-violet-500/25'
            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
        ]"
      >
        <component
          :is="item.icon"
          :class="['w-5 h-5 shrink-0', isActive(item) ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300']"
        />
        <Transition name="slide-fade">
          <span v-if="!collapsed" class="whitespace-nowrap overflow-hidden">{{ item.label }}</span>
        </Transition>
      </router-link>
    </nav>

    <!-- Logout -->
    <div class="p-2 border-t border-slate-800/60">
      <button
        @click="handleLogout"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
          'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-200'
        ]"
      >
        <LogOut class="w-5 h-5 shrink-0" />
        <Transition name="slide-fade">
          <span v-if="!collapsed">Logout</span>
        </Transition>
      </button>
    </div>
  </aside>

  <!-- Desktop spacer (avoids content under sidebar) -->
  <div
    class="hidden lg:block shrink-0 transition-all duration-300"
    :class="collapsed ? 'w-16' : 'w-64'"
  />
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-fade-enter-active { transition: all 0.15s ease-out; }
.slide-fade-leave-active { transition: all 0.1s ease-in; }
.slide-fade-enter-from, .slide-fade-leave-to { opacity: 0; transform: translateX(-6px); }
</style>
