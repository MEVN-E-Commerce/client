<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { updateProfile, addAddress, removeAddress } from '../../api/auth';

const store = useStore();
const router = useRouter();

const user = computed(() => store.getters['auth/currentUser']);
const authLoading = computed(() => store.getters['auth/authLoading']);

// Form states
const isEditingName = ref(false);
const editNameInput = ref('');
const editNameLoading = ref(false);
const editNameError = ref('');

// Add Address state
const street = ref('');
const city = ref('');
const label = ref('Home'); // default
const postalCode = ref('');
const country = ref('');
const addressLoading = ref(false);
const addressError = ref('');

onMounted(async () => {
  if (!user.value) {
    try {
      await store.dispatch('auth/fetchProfile');
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  }
  if (user.value) {
    editNameInput.value = user.value.name;
  }
});

const handleLogout = async () => {
  try {
    await store.dispatch('auth/logout');
    router.push('/');
  } catch (err) {
    console.error('Logout failed:', err);
  }
};

const handleUpdateName = async () => {
  if (!editNameInput.value.trim()) return;
  editNameLoading.value = true;
  editNameError.value = '';
  try {
    await updateProfile({ name: editNameInput.value });
    await store.dispatch('auth/fetchProfile');
    isEditingName.value = false;
  } catch (err) {
    editNameError.value = err.response?.data?.message || 'Failed to update name';
  } finally {
    editNameLoading.value = false;
  }
};

const handleAddAddress = async () => {
  if (!street.value || !city.value || !postalCode.value || !country.value) {
    addressError.value = 'All fields are required';
    return;
  }
  addressLoading.value = true;
  addressError.value = '';
  try {
    await addAddress({
      street: street.value,
      city: city.value,
      label: label.value,
      postalCode: postalCode.value,
      country: country.value
    });
    await store.dispatch('auth/fetchProfile');
    // Clear form
    street.value = '';
    city.value = '';
    label.value = 'Home';
    postalCode.value = '';
    country.value = '';
  } catch (err) {
    addressError.value = err.response?.data?.message || 'Failed to add address';
  } finally {
    addressLoading.value = false;
  }
};

const handleRemoveAddress = async (addressId) => {
  if (!confirm('Are you sure you want to remove this address?')) return;
  try {
    await removeAddress(addressId);
    await store.dispatch('auth/fetchProfile');
  } catch (err) {
    console.error('Failed to remove address:', err);
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div v-if="authLoading && !user" class="flex flex-col items-center justify-center py-12 space-y-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      <p class="text-slate-400">Loading your profile...</p>
    </div>

    <div v-else-if="user" class="space-y-8">
      <!-- Header Card: Profile details -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold text-2xl uppercase shadow-md select-none">
            {{ user.name.charAt(0) }}
          </div>
          <div>
            <!-- View Mode -->
            <div v-if="!isEditingName" class="flex items-center space-x-3">
              <h2 class="text-2xl font-bold text-white">{{ user.name }}</h2>
              <button @click="isEditingName = true" class="text-slate-400 hover:text-emerald-400 transition">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
            <!-- Edit Name Mode -->
            <form v-else @submit.prevent="handleUpdateName" class="flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                v-model="editNameInput"
                type="text"
                class="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm"
                required
              />
              <div class="flex items-center space-x-2">
                <button
                  type="submit"
                  :disabled="editNameLoading"
                  class="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition"
                >
                  Save
                </button>
                <button
                  type="button"
                  @click="isEditingName = false"
                  class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
            <p v-if="editNameError" class="text-rose-400 text-xs mt-1">{{ editNameError }}</p>

            <p class="text-slate-400 text-sm mt-1">{{ user.email }}</p>
            <div class="flex items-center space-x-2 mt-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-850 text-emerald-400 border border-emerald-500/10">
                Role: {{ user.role }}
              </span>
            </div>
          </div>
        </div>

        <div>
          <button @click="handleLogout" class="w-full md:w-auto px-6 py-2.5 bg-slate-850 hover:bg-slate-805 border border-slate-805 hover:border-slate-700 text-white font-medium rounded-xl transition flex items-center justify-center space-x-2">
            <svg xmlns="http://www.w3.org/2050/svg" class="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      <!-- Address Book Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Addresses List (2 cols) -->
        <div class="md:col-span-2 space-y-4">
          <h3 class="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Address Book</span>
          </h3>

          <div v-if="!user.addresses || user.addresses.length === 0" class="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-sm">
            No addresses added yet. Use the form to add one.
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="addr in user.addresses"
              :key="addr._id"
              class="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex items-start justify-between gap-4 transition duration-200"
            >
              <div>
                <div class="flex items-center space-x-2 mb-2">
                  <span class="px-2 py-0.5 bg-slate-850 border border-slate-800 rounded text-xs font-semibold text-white">
                    {{ addr.label }}
                  </span>
                </div>
                <p class="text-white text-sm font-medium">{{ addr.street }}</p>
                <p class="text-slate-400 text-xs mt-1">
                  {{ addr.city }}, {{ addr.postalCode }}
                </p>
                <p class="text-slate-400 text-xs uppercase font-medium">{{ addr.country }}</p>
              </div>

              <button
                @click="handleRemoveAddress(addr._id)"
                class="p-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-xl transition duration-200"
                title="Delete Address"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Add Address Form (1 col) -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit space-y-4">
          <h3 class="text-lg font-bold text-white border-b border-slate-800 pb-3">Add Address</h3>

          <div v-if="addressError" class="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-xl text-xs">
            {{ addressError }}
          </div>

          <form @submit.prevent="handleAddAddress" class="space-y-4">
            <div>
              <label for="addr-label" class="block text-xs text-slate-400 mb-1">Label</label>
              <select
                id="addr-label"
                v-model="label"
                class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm"
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label for="addr-street" class="block text-xs text-slate-400 mb-1">Street Address</label>
              <input
                id="addr-street"
                v-model="street"
                type="text"
                required
                placeholder="123 Main St"
                class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label for="addr-city" class="block text-xs text-slate-400 mb-1">City</label>
              <input
                id="addr-city"
                v-model="city"
                type="text"
                required
                placeholder="New York"
                class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="addr-postal" class="block text-xs text-slate-400 mb-1">Postal Code</label>
                <input
                  id="addr-postal"
                  v-model="postalCode"
                  type="text"
                  required
                  placeholder="10001"
                  class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label for="addr-country" class="block text-xs text-slate-400 mb-1">Country</label>
                <input
                  id="addr-country"
                  v-model="country"
                  type="text"
                  required
                  placeholder="USA"
                  class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              :disabled="addressLoading"
              class="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
            >
              <span v-if="addressLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-950"></span>
              <span>{{ addressLoading ? 'Adding...' : 'Add Address' }}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
