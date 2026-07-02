<template>
  <nav
    class="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center">
          <router-link
            to="/"
            class="flex items-center space-x-2 text-xl font-bold bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent transition duration-200 hover:opacity-90"
          >
            <span>MEVN Market</span>
          </router-link>
        </div>

        <div class="flex items-center space-x-1.5 sm:space-x-2">
          <router-link
            to="/"
            class="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition duration-200"
            active-class="bg-slate-850 text-emerald-400 font-semibold"
          >
            <House class="h-4 w-4" />
            <span>Home</span>
          </router-link>

          <router-link
            to="/products"
            class="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition duration-200"
            active-class="bg-slate-850 text-emerald-400 font-semibold"
          >
            <ShoppingBag class="h-4 w-4" />
            <span>Products</span>
          </router-link>

          <template v-if="!isAuthenticated">
            <router-link
              to="/login"
              class="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition duration-200"
              active-class="bg-slate-850 text-emerald-400 font-semibold"
            >
              <LogIn class="h-4 w-4" />
              <span>Login</span>
            </router-link>

            <router-link
              to="/register"
              class="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition duration-200"
              active-class="bg-slate-850 text-emerald-400 font-semibold"
            >
              <UserPlus class="h-4 w-4" />
              <span>Register</span>
            </router-link>
          </template>

          <template v-else>
            <router-link
              v-if="isSellerOrAdmin"
              to="/seller/products"
              class="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition duration-200"
              active-class="bg-slate-850 text-emerald-400 font-semibold"
            >
              <Package2 class="h-4 w-4" />
              <span>Manage Products</span>
            </router-link>

            <router-link
              v-if="isAdmin"
              to="/admin/categories"
              class="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition duration-200"
              active-class="bg-slate-850 text-emerald-400 font-semibold"
            >
              <Tags class="h-4 w-4" />
              <span>Manage Categories</span>
            </router-link>

            <router-link
              to="/profile"
              class="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition duration-200"
              active-class="bg-slate-850 text-emerald-400 font-semibold"
            >
              <UserCircle2 class="h-4 w-4" />
              <span>Profile</span>
              <span
                v-if="currentUser"
                class="text-xs text-slate-400 font-normal"
                >({{ currentUser.name }})</span
              >
            </router-link>

            <button
              @click="handleLogout"
              class="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-rose-450 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition duration-200"
            >
              <LogOut class="h-4 w-4" />
              <span>Logout</span>
            </button>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import {
  House,
  LogIn,
  LogOut,
  Package2,
  ShoppingBag,
  Tags,
  UserCircle2,
  UserPlus,
} from "lucide-vue-next";

const store = useStore();
const router = useRouter();

const isAuthenticated = computed(() => store.getters["auth/isAuthenticated"]);
const currentUser = computed(() => store.getters["auth/currentUser"]);
const isSellerOrAdmin = computed(
  () => store.getters["auth/isSeller"] || store.getters["auth/isAdmin"],
);
const isAdmin = computed(() => store.getters["auth/isAdmin"]);

const handleLogout = async () => {
  try {
    await store.dispatch("auth/logout");
    router.push("/");
  } catch (err) {
    console.error("Logout failed:", err);
  }
};
</script>
