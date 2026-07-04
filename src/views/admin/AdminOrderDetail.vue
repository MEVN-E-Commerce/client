<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Truck, Clock, DollarSign } from 'lucide-vue-next';
import { fetchAdminOrderById } from '../../api/admin';
import { useStore } from 'vuex';
import { useToast } from '../../composables/useToast';
import LoadingSpinner from '../../components/admin/LoadingSpinner.vue';
import StatusBadge from '../../components/admin/StatusBadge.vue';
import PageHeader from '../../components/admin/PageHeader.vue';

const route = useRoute();
const router = useRouter();
const store = useStore();
const toast = useToast();

const order = ref(null);
const loading = ref(true);
const statusLoading = ref(false);
const shippingLoading = ref(false);

const newStatus = ref('');
const statusNote = ref('');
const shippingForm = ref({ trackingNumber: '', courier: '', estimatedDelivery: '', deliveryDate: '', notes: '' });

onMounted(async () => {
  try {
    const data = await fetchAdminOrderById(route.params.id);
    order.value = data.order;
    newStatus.value = data.order.status;
    if (data.order.shippingInfo) {
      const si = data.order.shippingInfo;
      shippingForm.value = {
        trackingNumber: si.trackingNumber || '',
        courier: si.courier || '',
        estimatedDelivery: si.estimatedDelivery ? si.estimatedDelivery.slice(0, 10) : '',
        deliveryDate: si.deliveryDate ? si.deliveryDate.slice(0, 10) : '',
        notes: si.notes || ''
      };
    }
  } catch (err) {
    toast.error('Failed to load order');
    router.push('/admin/orders');
  } finally {
    loading.value = false;
  }
});

// State machine transitions
const allowedTransitions = {
  pending: ['paid', 'cancelled'],
  paid: ['processing', 'cancelled'],
  processing: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: []
};

const availableStatuses = computed(() => allowedTransitions[order.value?.status || 'pending'] || []);

const updateStatus = async () => {
  if (!newStatus.value || newStatus.value === order.value.status) return;
  statusLoading.value = true;
  try {
    const data = await store.dispatch('admin/updateAdminOrderStatus', {
      id: order.value._id, status: newStatus.value, note: statusNote.value
    });
    order.value = data.order;
    toast.success(`Order status updated to "${newStatus.value}"`);
    statusNote.value = '';
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to update status');
  } finally {
    statusLoading.value = false;
  }
};

const updateShipping = async () => {
  shippingLoading.value = true;
  try {
    const data = await store.dispatch('admin/updateOrderShipping', {
      id: order.value._id,
      shippingData: shippingForm.value
    });
    order.value = data.order;
    toast.success('Shipping info saved');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to save shipping info');
  } finally {
    shippingLoading.value = false;
  }
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { dateStyle: 'medium' }) : '—';
const fmtTime = (d) => d ? new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
</script>

<template>
  <div>
    <PageHeader
      title="Order Detail"
      :breadcrumb="[{ label: 'Admin', to: '/admin' }, { label: 'Orders', to: '/admin/orders' }, { label: 'Detail' }]"
    >
      <template #actions>
        <button @click="router.back()" class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition">
          <ArrowLeft class="w-4 h-4" /> Back
        </button>
      </template>
    </PageHeader>

    <LoadingSpinner v-if="loading" />

    <div v-else-if="order" class="grid lg:grid-cols-3 gap-6">
      <!-- Left column: summary + items + timeline -->
      <div class="lg:col-span-2 space-y-5">
        <!-- Order summary -->
        <div class="bg-slate-900 rounded-2xl border border-slate-800/60 p-5">
          <div class="flex items-start justify-between gap-4 mb-4">
            <div>
              <p class="text-xs text-slate-500 font-mono">ORDER #{{ order._id?.slice(-10).toUpperCase() }}</p>
              <p class="text-xs text-slate-600 mt-0.5">{{ fmtTime(order.createdAt) }}</p>
            </div>
            <div class="flex gap-2 flex-wrap">
              <StatusBadge :status="order.status" />
              <StatusBadge :status="order.paymentStatus" />
            </div>
          </div>

          <!-- Customer info -->
          <div class="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-xs text-slate-500 mb-1">Customer</p>
              <p class="text-slate-200 font-medium">{{ order.userId?.name || 'Guest' }}</p>
              <p class="text-slate-400">{{ order.contactEmail }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 mb-1">Shipping Address</p>
              <p class="text-slate-200 font-medium">{{ order.shippingAddress?.fullName }}</p>
              <p class="text-slate-400">{{ order.shippingAddress?.line1 }}</p>
              <p class="text-slate-400">{{ order.shippingAddress?.city }}, {{ order.shippingAddress?.state }} {{ order.shippingAddress?.postalCode }}</p>
            </div>
          </div>
        </div>

        <!-- Items -->
        <div class="bg-slate-900 rounded-2xl border border-slate-800/60 overflow-hidden">
          <div class="px-5 py-3 border-b border-slate-800/60">
            <h3 class="text-sm font-semibold text-slate-300">Items ({{ order.items?.length }})</h3>
          </div>
          <div class="divide-y divide-slate-800/40">
            <div v-for="item in order.items" :key="item._id" class="flex items-center gap-4 px-5 py-3.5">
              <div class="flex-1 min-w-0">
                <p class="text-sm text-slate-200 font-medium truncate">{{ item.name }}</p>
                <p class="text-xs text-slate-500">Qty: {{ item.quantity }} × ${{ item.price?.toFixed(2) }}</p>
              </div>
              <p class="text-sm font-semibold text-slate-200 shrink-0">${{ item.subtotal?.toFixed(2) }}</p>
            </div>
          </div>
          <!-- Totals -->
          <div class="px-5 py-4 border-t border-slate-800/60 space-y-1.5 text-sm">
            <div class="flex justify-between text-slate-400"><span>Subtotal</span><span>${{ order.subtotal?.toFixed(2) }}</span></div>
            <div class="flex justify-between text-slate-400"><span>Shipping</span><span>{{ order.shipping === 0 ? 'Free' : `$${order.shipping?.toFixed(2)}` }}</span></div>
            <div class="flex justify-between text-slate-400"><span>Tax</span><span>${{ order.tax?.toFixed(2) }}</span></div>
            <div class="flex justify-between font-bold text-slate-100 pt-1 border-t border-slate-800/40"><span>Total</span><span>${{ order.total?.toFixed(2) }}</span></div>
          </div>
        </div>

        <!-- Status History timeline -->
        <div class="bg-slate-900 rounded-2xl border border-slate-800/60 p-5">
          <h3 class="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Clock class="w-4 h-4 text-violet-400" /> Status Timeline
          </h3>
          <div class="space-y-3">
            <div
              v-for="(entry, idx) in [...(order.statusHistory || [])].reverse()"
              :key="idx"
              class="flex items-start gap-3"
            >
              <div class="w-2 h-2 rounded-full bg-violet-500 mt-1.5 shrink-0" />
              <div>
                <div class="flex items-center gap-2">
                  <StatusBadge :status="entry.status" />
                  <span class="text-xs text-slate-600">{{ fmtTime(entry.changedAt) }}</span>
                </div>
                <p v-if="entry.note" class="text-xs text-slate-500 mt-0.5">{{ entry.note }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column: status update + shipping -->
      <div class="space-y-5">
        <!-- Status update -->
        <div class="bg-slate-900 rounded-2xl border border-slate-800/60 p-5">
          <h3 class="text-sm font-semibold text-slate-300 mb-4">Update Status</h3>

          <div v-if="!availableStatuses.length" class="text-sm text-slate-600 text-center py-4">
            No further transitions available for "{{ order.status }}"
          </div>
          <div v-else class="space-y-3">
            <select
              v-model="newStatus"
              class="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-violet-500/60 transition"
            >
              <option :value="order.status" disabled>{{ order.status }} (current)</option>
              <option v-for="s in availableStatuses" :key="s" :value="s">{{ s }}</option>
            </select>
            <textarea
              v-model="statusNote"
              placeholder="Add a note (optional)…"
              rows="2"
              class="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500/60 transition resize-none"
            />
            <button
              @click="updateStatus"
              :disabled="statusLoading || newStatus === order.status"
              class="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              <svg v-if="statusLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ statusLoading ? 'Updating…' : 'Update Status' }}
            </button>
          </div>
        </div>

        <!-- Shipping info -->
        <div class="bg-slate-900 rounded-2xl border border-slate-800/60 p-5">
          <h3 class="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Truck class="w-4 h-4 text-sky-400" /> Shipping Info
          </h3>
          <div class="space-y-3">
            <div>
              <label class="text-xs text-slate-500 mb-1 block">Tracking Number</label>
              <input v-model="shippingForm.trackingNumber" type="text" placeholder="e.g. TRK1234567890" class="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-violet-500/60 transition" />
            </div>
            <div>
              <label class="text-xs text-slate-500 mb-1 block">Courier</label>
              <input v-model="shippingForm.courier" type="text" placeholder="e.g. FedEx, UPS, DHL" class="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-violet-500/60 transition" />
            </div>
            <div>
              <label class="text-xs text-slate-500 mb-1 block">Estimated Delivery</label>
              <input v-model="shippingForm.estimatedDelivery" type="date" class="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-violet-500/60 transition" />
            </div>
            <div>
              <label class="text-xs text-slate-500 mb-1 block">Actual Delivery Date</label>
              <input v-model="shippingForm.deliveryDate" type="date" class="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-violet-500/60 transition" />
            </div>
            <div>
              <label class="text-xs text-slate-500 mb-1 block">Notes</label>
              <textarea v-model="shippingForm.notes" rows="2" placeholder="Internal notes…" class="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500/60 transition resize-none" />
            </div>
            <button
              @click="updateShipping"
              :disabled="shippingLoading"
              class="w-full py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              <svg v-if="shippingLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ shippingLoading ? 'Saving…' : 'Save Shipping Info' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
