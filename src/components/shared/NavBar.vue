<template>
  <nav
    class="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center">
          <router-link
            :to="isAdmin ? '/admin' : '/'"
            class="flex items-center space-x-2 text-xl font-bold bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent transition duration-200 hover:opacity-90"
          >
            <span>MEVN Market</span>
          </router-link>
        </div>

        <div class="flex items-center space-x-1.5 sm:space-x-2">
          <router-link
            v-if="!isAdmin"
            to="/"
            class="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition duration-200"
            active-class="bg-slate-850 text-emerald-400 font-semibold"
          >
            <House class="h-4 w-4" />
            <span>Home</span>
          </router-link>

          <router-link
            v-if="!isAdmin"
            to="/products"
            class="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition duration-200"
            active-class="bg-slate-850 text-emerald-400 font-semibold"
          >
            <ShoppingBag class="h-4 w-4" />
            <span>Products</span>
          </router-link>

          <!-- Cart link (hide for admin) -->
          <router-link
            v-if="!isAdmin"
            to="/cart"
            class="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition duration-200 relative"
            active-class="bg-slate-850 text-emerald-400 font-semibold"
          >
            <ShoppingCart class="h-4 w-4" />
            <span>Cart</span>
            <span
              v-if="cartCount > 0"
              class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
            >
              {{ cartCount }}
            </span>
          </router-link>

          <!-- Guest actions -->
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

          <!-- Authenticated actions -->
          <template v-else>
            <!-- Seller link -->
            <router-link
              v-if="isSeller"
              to="/seller/products"
              class="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition duration-200"
              active-class="bg-slate-850 text-emerald-400 font-semibold"
            >
              <Package2 class="h-4 w-4" />
              <span>Manage Products</span>
            </router-link>

            <!-- Admin dashboard panel link -->
            <router-link
              v-if="isAdmin"
              to="/admin"
              class="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 transition duration-200"
              active-class="bg-violet-500/20 text-violet-300 font-semibold border border-violet-500/30"
            >
              <ShieldCheck class="h-4 w-4" />
              <span>Admin Panel</span>
            </router-link>

            <!-- Profile (hide for admin) -->
            <router-link
              v-if="!isAdmin"
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

            <!-- Admin Display Name -->
            <div v-if="isAdmin && currentUser" class="flex items-center space-x-1 px-3 py-2 text-sm text-slate-400">
              <UserCircle2 class="h-4 w-4 text-slate-500" />
              <span>{{ currentUser.name }}</span>
            </div>

            <!-- Logout -->
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
import { computed, onMounted } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import {
  House,
  LogIn,
  LogOut,
  Package2,
  ShoppingBag,
  ShoppingCart,
  Tags,
  UserCircle2,
  UserPlus,
  ShieldCheck
} from "lucide-vue-next";

const store = useStore();
const router = useRouter();

const isAuthenticated = computed(() => store.getters["auth/isAuthenticated"]);
const currentUser = computed(() => store.getters["auth/currentUser"]);
const isSellerOrAdmin = computed(
  () => store.getters["auth/isSeller"] || store.getters["auth/isAdmin"],
);
const isSeller = computed(() => store.getters["auth/isSeller"]);
const isAdmin = computed(() => store.getters["auth/isAdmin"]);
const cartCount = computed(() => store.getters["cart/cartCount"]);

const handleLogout = async () => {
  try {
    await store.dispatch("auth/logout");
    router.push("/");
  } catch (err) {
    console.error("Logout failed:", err);
  }
};

onMounted(() => {
  store.dispatch("cart/fetchCart").catch((err) => {
    console.error("Failed to fetch cart on NavBar mount:", err);
  });
});
</script>
