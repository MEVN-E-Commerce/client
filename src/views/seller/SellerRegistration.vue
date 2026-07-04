<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { registerSeller } from '../../api/seller';

const store = useStore();
const router = useRouter();

const storeName = ref('');
const description = ref('');
const phone = ref('');
const address = ref('');
const payoutInfo = ref('');

const error = ref('');
const success = ref('');
const loading = ref(false);

const currentUser = computed(() => store.getters['auth/currentUser']);

const handleSubmit = async () => {
  error.value = '';
  success.value = '';
  loading.value = true;

  try {
    const res = await registerSeller({
      storeName: storeName.value,
      description: description.value,
      phone: phone.value,
      address: address.value,
      payoutInfo: payoutInfo.value
    });

    if (res.success) {
      success.value = res.message || 'Seller registration submitted successfully!';
      // Refresh current user state
      await store.dispatch('auth/getProfile');
      setTimeout(() => {
        router.push('/seller/dashboard');
      }, 2000);
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to submit registration';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div style="max-width: 600px; margin: 40px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; background: #1e293b; color: #fff;">
    <h2>Become a Seller</h2>
    <p v-if="currentUser && currentUser.sellerStatus === 'pending'" style="color: #fbbf24;">
      Your application is currently PENDING approval by an administrator. You can update your details below.
    </p>
    <p v-else>Fill in the details below to register your store on MEVN Marketplace.</p>

    <div v-if="error" style="color: #f87171; margin-bottom: 15px; padding: 10px; background: #7f1d1d; border-radius: 4px;">
      {{ error }}
    </div>

    <div v-if="success" style="color: #34d399; margin-bottom: 15px; padding: 10px; background: #064e3b; border-radius: 4px;">
      {{ success }}
    </div>

    <form @submit.prevent="handleSubmit">
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">Store Name *</label>
        <input v-model="storeName" type="text" required style="width: 100%; padding: 8px; border: 1px solid #475569; background: #0f172a; color: #fff; border-radius: 4px;" />
      </div>

      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">Store Description</label>
        <textarea v-model="description" rows="4" style="width: 100%; padding: 8px; border: 1px solid #475569; background: #0f172a; color: #fff; border-radius: 4px;"></textarea>
      </div>

      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">Phone Number</label>
        <input v-model="phone" type="text" style="width: 100%; padding: 8px; border: 1px solid #475569; background: #0f172a; color: #fff; border-radius: 4px;" />
      </div>

      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">Address</label>
        <input v-model="address" type="text" style="width: 100%; padding: 8px; border: 1px solid #475569; background: #0f172a; color: #fff; border-radius: 4px;" />
      </div>

      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">Payout Info (e.g. Bank Account / PayPal)</label>
        <input v-model="payoutInfo" type="text" style="width: 100%; padding: 8px; border: 1px solid #475569; background: #0f172a; color: #fff; border-radius: 4px;" />
      </div>

      <button type="submit" :disabled="loading" style="padding: 10px 20px; background: #10b981; color: #000; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
        {{ loading ? 'Submitting...' : 'Submit Application' }}
      </button>
    </form>
  </div>
</template>
