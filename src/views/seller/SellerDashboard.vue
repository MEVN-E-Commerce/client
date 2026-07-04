<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import {
  getDashboardStats,
  getSellerProducts,
  updateProductStock,
  getSellerOrders,
  updateSellerOrderStatus,
  getSellerProfile,
  updateSellerProfile
} from '../../api/seller';
import {
  getPromoCodes,
  createPromoCode,
  deletePromoCode
} from '../../api/bonus';
import {
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct
} from '../../api/products';

const store = useStore();
const router = useRouter();

const activeTab = ref('overview');
const stats = ref(null);
const products = ref([]);
const orders = ref([]);
const promoCodes = ref([]);
const categories = ref([]);
const profile = ref(null);

const loading = ref(false);
const error = ref('');
const success = ref('');

// Product Form state
const showProductForm = ref(false);
const isEditMode = ref(false);
const editingProductId = ref(null);
const productForm = ref({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  categoryId: '',
  isActive: true
});

// Promo Code Form state
const showPromoForm = ref(false);
const promoForm = ref({
  code: '',
  discountType: 'percentage',
  discountValue: 0,
  minOrderAmount: 0,
  isActive: true
});

// Profile update form
const profileForm = ref({
  storeName: '',
  description: '',
  phone: '',
  address: '',
  payoutInfo: ''
});

const currentUser = computed(() => store.getters['auth/currentUser']);

const fetchData = async () => {
  loading.value = true;
  error.value = '';
  try {
    // 1. Stats
    const statsRes = await getDashboardStats();
    stats.value = statsRes.stats;

    // 2. Products
    const productsRes = await getSellerProducts();
    products.value = productsRes.products;

    // 3. Orders
    const ordersRes = await getSellerOrders();
    orders.value = ordersRes.orders;

    // 4. Promo codes
    const promoRes = await getPromoCodes();
    promoCodes.value = promoRes.promoCodes;

    // 5. Categories
    const categoriesRes = await getCategories();
    categories.value = categoriesRes.categories;

    // 6. Profile
    const profileRes = await getSellerProfile();
    profile.value = profileRes.seller;
    profileForm.value = {
      storeName: profile.value.storeName,
      description: profile.value.description || '',
      phone: profile.value.phone || '',
      address: profile.value.address || '',
      payoutInfo: profile.value.payoutInfo || ''
    };
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to load seller data';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

// Tab navigation
const setTab = (tab) => {
  activeTab.value = tab;
  error.value = '';
  success.value = '';
};

// --- PRODUCT CRUD ---
const openAddProduct = () => {
  isEditMode.value = false;
  editingProductId.value = null;
  productForm.value = { name: '', description: '', price: 0, stock: 0, categoryId: '', isActive: true };
  showProductForm.value = true;
};

const openEditProduct = (prod) => {
  isEditMode.value = true;
  editingProductId.value = prod._id;
  productForm.value = {
    name: prod.name,
    description: prod.description || '',
    price: prod.price,
    stock: prod.stock,
    categoryId: prod.categoryId._id || prod.categoryId,
    isActive: prod.isActive
  };
  showProductForm.value = true;
};

const handleSaveProduct = async () => {
  try {
    if (isEditMode.value) {
      await updateProduct(editingProductId.value, productForm.value);
      success.value = 'Product updated successfully!';
    } else {
      await createProduct(productForm.value);
      success.value = 'Product created successfully!';
    }
    showProductForm.value = false;
    await fetchData();
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Product operation failed';
  }
};

const handleDeleteProduct = async (id) => {
  if (!confirm('Are you sure you want to delete this product?')) return;
  try {
    await deleteProduct(id);
    success.value = 'Product deleted successfully!';
    await fetchData();
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to delete product';
  }
};

// --- STOCK UPDATE ---
const handleUpdateStock = async (prod, newStock) => {
  try {
    await updateProductStock(prod._id, newStock);
    success.value = `Stock for ${prod.name} updated to ${newStock}`;
    await fetchData();
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to update stock';
  }
};

// --- ORDER STATUS UPDATE ---
const handleUpdateOrderStatus = async (orderId, status) => {
  try {
    await updateSellerOrderStatus(orderId, status);
    success.value = `Order status updated to ${status}`;
    await fetchData();
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to update order status';
  }
};

// --- PROMO CODE CRUD ---
const handleCreatePromo = async () => {
  try {
    await createPromoCode(promoForm.value);
    success.value = 'Promo code created successfully!';
    showPromoForm.value = false;
    promoForm.value = { code: '', discountType: 'percentage', discountValue: 0, minOrderAmount: 0, isActive: true };
    await fetchData();
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to create promo code';
  }
};

const handleDeletePromo = async (id) => {
  if (!confirm('Delete this promo code?')) return;
  try {
    await deletePromoCode(id);
    success.value = 'Promo code deleted successfully!';
    await fetchData();
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to delete promo code';
  }
};

// --- PROFILE UPDATE ---
const handleUpdateProfile = async () => {
  try {
    await updateSellerProfile(profileForm.value);
    success.value = 'Store profile updated successfully!';
    await fetchData();
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to update profile';
  }
};
</script>

<template>
  <div style="max-width: 1200px; margin: 20px auto; padding: 20px; font-family: sans-serif; background: #0f172a; color: #f8fafc; border-radius: 8px;">
    <h1>Seller Portal: {{ profile?.storeName || 'My Shop' }}</h1>
    
    <div v-if="currentUser && currentUser.sellerStatus !== 'approved'" style="padding: 15px; background: #78350f; color: #fef3c7; border-radius: 4px; margin-bottom: 20px;">
      <strong>Notice:</strong> Your seller account status is <strong>{{ currentUser.sellerStatus }}</strong>. You will not be able to list products or manage orders until approved by an administrator.
    </div>

    <!-- Tab navigation buttons -->
    <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #334155; padding-bottom: 10px;">
      <button @click="setTab('overview')" :style="activeTab === 'overview' ? 'background:#10b981;color:#000;' : 'background:#334155;'" style="padding:8px 16px; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Overview</button>
      <button @click="setTab('products')" :style="activeTab === 'products' ? 'background:#10b981;color:#000;' : 'background:#334155;'" style="padding:8px 16px; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">My Products</button>
      <button @click="setTab('inventory')" :style="activeTab === 'inventory' ? 'background:#10b981;color:#000;' : 'background:#334155;'" style="padding:8px 16px; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Inventory</button>
      <button @click="setTab('orders')" :style="activeTab === 'orders' ? 'background:#10b981;color:#000;' : 'background:#334155;'" style="padding:8px 16px; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Orders</button>
      <button @click="setTab('promos')" :style="activeTab === 'promos' ? 'background:#10b981;color:#000;' : 'background:#334155;'" style="padding:8px 16px; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Promo Codes</button>
      <button @click="setTab('profile')" :style="activeTab === 'profile' ? 'background:#10b981;color:#000;' : 'background:#334155;'" style="padding:8px 16px; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Profile</button>
    </div>

    <!-- Messages -->
    <div v-if="error" style="color: #f87171; background: #7f1d1d; padding: 10px; border-radius: 4px; margin-bottom: 20px;">{{ error }}</div>
    <div v-if="success" style="color: #34d399; background: #064e3b; padding: 10px; border-radius: 4px; margin-bottom: 20px;">{{ success }}</div>

    <!-- Tab contents -->
    <div v-if="loading" style="padding: 20px; text-align: center;">Loading...</div>

    <div v-else>
      <!-- OVERVIEW -->
      <div v-if="activeTab === 'overview'">
        <h2>Dashboard Statistics</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
          <div style="background: #1e293b; padding: 20px; border-radius: 6px; border-left: 4px solid #10b981;">
            <div style="font-size: 0.875rem; color: #94a3b8;">Total Sales</div>
            <div style="font-size: 1.5rem; font-weight: bold; margin-top: 5px;">${{ stats?.totalSales || 0 }}</div>
          </div>
          <div style="background: #1e293b; padding: 20px; border-radius: 6px; border-left: 4px solid #3b82f6;">
            <div style="font-size: 0.875rem; color: #94a3b8;">Total Orders</div>
            <div style="font-size: 1.5rem; font-weight: bold; margin-top: 5px;">{{ stats?.totalOrders || 0 }}</div>
          </div>
          <div style="background: #1e293b; padding: 20px; border-radius: 6px; border-left: 4px solid #8b5cf6;">
            <div style="font-size: 0.875rem; color: #94a3b8;">Listed Products</div>
            <div style="font-size: 1.5rem; font-weight: bold; margin-top: 5px;">{{ stats?.totalProducts || 0 }}</div>
          </div>
          <div style="background: #1e293b; padding: 20px; border-radius: 6px; border-left: 4px solid #ef4444;">
            <div style="font-size: 0.875rem; color: #94a3b8;">Low Stock Alert</div>
            <div style="font-size: 1.5rem; font-weight: bold; margin-top: 5px;">{{ stats?.lowStockCount || 0 }}</div>
          </div>
        </div>

        <div v-if="stats?.lowStockProducts?.length > 0" style="background: #7f1d1d; padding: 15px; border-radius: 6px;">
          <h3>⚠️ Low Stock Alert (5 items or less)</h3>
          <ul>
            <li v-for="p in stats.lowStockProducts" :key="p._id">
              {{ p.name }} - Only <strong>{{ p.stock }}</strong> remaining
            </li>
          </ul>
        </div>
      </div>

      <!-- MY PRODUCTS -->
      <div v-if="activeTab === 'products'">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
          <h2>My Products</h2>
          <button @click="openAddProduct" style="padding: 8px 16px; background: #10b981; color: #000; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">+ Add Product</button>
        </div>

        <!-- Product Form Modal/Panel -->
        <div v-if="showProductForm" style="background: #1e293b; padding: 20px; border-radius: 6px; margin-bottom: 30px; border: 1px solid #475569;">
          <h3>{{ isEditMode ? 'Edit Product' : 'Add New Product' }}</h3>
          <form @submit.prevent="handleSaveProduct">
            <div style="margin-bottom:12px;">
              <label style="display:block; margin-bottom:4px;">Product Name *</label>
              <input v-model="productForm.name" type="text" required style="width:100%; padding:8px; background:#0f172a; border:1px solid #475569; color:#fff;" />
            </div>
            <div style="margin-bottom:12px;">
              <label style="display:block; margin-bottom:4px;">Description</label>
              <textarea v-model="productForm.description" style="width:100%; padding:8px; background:#0f172a; border:1px solid #475569; color:#fff;"></textarea>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:12px;">
              <div>
                <label style="display:block; margin-bottom:4px;">Price ($) *</label>
                <input v-model="productForm.price" type="number" step="0.01" required style="width:100%; padding:8px; background:#0f172a; border:1px solid #475569; color:#fff;" />
              </div>
              <div>
                <label style="display:block; margin-bottom:4px;">Initial Stock *</label>
                <input v-model="productForm.stock" type="number" required style="width:100%; padding:8px; background:#0f172a; border:1px solid #475569; color:#fff;" />
              </div>
            </div>
            <div style="margin-bottom:12px;">
              <label style="display:block; margin-bottom:4px;">Category *</label>
              <select v-model="productForm.categoryId" required style="width:100%; padding:8px; background:#0f172a; border:1px solid #475569; color:#fff;">
                <option value="">Select Category</option>
                <option v-for="cat in categories" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
              </select>
            </div>
            <div style="margin-bottom:15px;">
              <label style="display:flex; align-items:center; gap:8px;">
                <input v-model="productForm.isActive" type="checkbox" /> Active / Available
              </label>
            </div>
            <div style="display:flex; gap:10px;">
              <button type="submit" style="padding: 8px 16px; background:#10b981; color:#000; border:none; cursor:pointer; font-weight:bold;">Save</button>
              <button type="button" @click="showProductForm = false" style="padding: 8px 16px; background:#475569; color:#fff; border:none; cursor:pointer;">Cancel</button>
            </div>
          </form>
        </div>

        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 2px solid #334155;">
              <th style="padding: 10px;">Name</th>
              <th style="padding: 10px;">Price</th>
              <th style="padding: 10px;">Stock</th>
              <th style="padding: 10px;">Status</th>
              <th style="padding: 10px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in products" :key="p._id" style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 10px;">{{ p.name }}</td>
              <td style="padding: 10px;">${{ p.price }}</td>
              <td style="padding: 10px;">{{ p.stock }}</td>
              <td style="padding: 10px;">
                <span :style="p.isActive ? 'color:#10b981' : 'color:#f87171'">{{ p.isActive ? 'Active' : 'Draft' }}</span>
              </td>
              <td style="padding: 10px;">
                <button @click="openEditProduct(p)" style="padding: 4px 8px; background: #3b82f6; color: #fff; border: none; cursor: pointer; margin-right: 5px;">Edit</button>
                <button @click="handleDeleteProduct(p._id)" style="padding: 4px 8px; background: #ef4444; color: #fff; border: none; cursor: pointer;">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- INVENTORY -->
      <div v-if="activeTab === 'inventory'">
        <h2>Inventory / Stock Updates</h2>
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 2px solid #334155;">
              <th style="padding: 10px;">Product</th>
              <th style="padding: 10px;">Current Stock</th>
              <th style="padding: 10px;">New Stock Input</th>
              <th style="padding: 10px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in products" :key="p._id" style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 10px;">{{ p.name }}</td>
              <td style="padding: 10px;">{{ p.stock }}</td>
              <td style="padding: 10px;">
                <input type="number" :id="'stock-input-' + p._id" :defaultValue="p.stock" style="width: 80px; padding: 4px; background: #0f172a; border: 1px solid #475569; color: #fff;" />
              </td>
              <td style="padding: 10px;">
                <button @click="handleUpdateStock(p, parseInt(document.getElementById('stock-input-' + p._id).value))" style="padding: 6px 12px; background: #10b981; color: #000; border: none; font-weight: bold; cursor: pointer;">Update Stock</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ORDERS -->
      <div v-if="activeTab === 'orders'">
        <h2>Seller Orders Queue</h2>
        <div v-if="orders.length === 0" style="padding: 20px; text-align: center; color: #94a3b8;">No orders found containing your products.</div>
        <div v-else>
          <div v-for="o in orders" :key="o._id" style="background: #1e293b; padding: 20px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #334155;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #334155; padding-bottom: 10px; margin-bottom: 10px;">
              <div>
                <strong>Order ID:</strong> {{ o._id }} <br />
                <span style="font-size: 0.85rem; color: #94a3b8;">Placed on: {{ new Date(o.createdAt).toLocaleString() }}</span>
              </div>
              <div>
                <span style="padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.85rem; background: #0f172a;" :style="o.status === 'delivered' ? 'color:#10b981;' : 'color:#fbbf24;'">
                  {{ o.status.toUpperCase() }}
                </span>
              </div>
            </div>

            <!-- Items list -->
            <div style="margin-bottom: 15px;">
              <strong>Items details:</strong>
              <ul>
                <li v-for="item in o.items" :key="item.productId" style="margin-bottom:5px;">
                  {{ item.name }} - Qty: {{ item.quantity }} @ ${{ item.price }} (Subtotal: ${{ item.subtotal }})
                </li>
              </ul>
            </div>

            <!-- Shipping address -->
            <div style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 15px;">
              <strong>Ship to:</strong> {{ o.shippingAddress.fullName }}, {{ o.shippingAddress.line1 }}, {{ o.shippingAddress.city }}, {{ o.shippingAddress.country }} (Phone: {{ o.shippingAddress.phone }})
            </div>

            <!-- Update actions -->
            <div style="display:flex; gap:10px; align-items:center;">
              <strong>Update Status:</strong>
              <button @click="handleUpdateOrderStatus(o._id, 'processing')" :disabled="o.status !== 'paid'" style="padding: 6px 12px; cursor: pointer; background: #3b82f6; border: none; color: #fff;">Processing</button>
              <button @click="handleUpdateOrderStatus(o._id, 'shipped')" :disabled="o.status !== 'processing'" style="padding: 6px 12px; cursor: pointer; background: #8b5cf6; border: none; color: #fff;">Shipped</button>
              <button @click="handleUpdateOrderStatus(o._id, 'delivered')" :disabled="o.status !== 'shipped'" style="padding: 6px 12px; cursor: pointer; background: #10b981; border: none; color: #000; font-weight: bold;">Delivered</button>
            </div>
          </div>
        </div>
      </div>

      <!-- PROMO CODES -->
      <div v-if="activeTab === 'promos'">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <h2>Promo Codes</h2>
          <button @click="showPromoForm = true" style="padding: 8px 16px; background: #10b981; color: #000; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">+ Create Promo Code</button>
        </div>

        <!-- Create Promo Form -->
        <div v-if="showPromoForm" style="background: #1e293b; padding: 20px; border-radius: 6px; margin-bottom: 30px; border: 1px solid #475569;">
          <h3>New Promo Code</h3>
          <form @submit.prevent="handleCreatePromo">
            <div style="margin-bottom:12px;">
              <label style="display:block; margin-bottom:4px;">Code (Uppercase) *</label>
              <input v-model="promoForm.code" type="text" required placeholder="e.g. SAVE10" style="width:100%; padding:8px; background:#0f172a; border:1px solid #475569; color:#fff;" />
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:12px;">
              <div>
                <label style="display:block; margin-bottom:4px;">Discount Type *</label>
                <select v-model="promoForm.discountType" required style="width:100%; padding:8px; background:#0f172a; border:1px solid #475569; color:#fff;">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
              <div>
                <label style="display:block; margin-bottom:4px;">Discount Value *</label>
                <input v-model="promoForm.discountValue" type="number" required style="width:100%; padding:8px; background:#0f172a; border:1px solid #475569; color:#fff;" />
              </div>
            </div>
            <div style="margin-bottom:12px;">
              <label style="display:block; margin-bottom:4px;">Minimum Order Amount ($)</label>
              <input v-model="promoForm.minOrderAmount" type="number" style="width:100%; padding:8px; background:#0f172a; border:1px solid #475569; color:#fff;" />
            </div>
            <div style="margin-bottom:15px;">
              <label style="display:flex; align-items:center; gap:8px;">
                <input v-model="promoForm.isActive" type="checkbox" /> Active
              </label>
            </div>
            <div style="display:flex; gap:10px;">
              <button type="submit" style="padding: 8px 16px; background:#10b981; color:#000; border:none; cursor:pointer; font-weight:bold;">Create</button>
              <button type="button" @click="showPromoForm = false" style="padding: 8px 16px; background:#475569; color:#fff; border:none; cursor:pointer;">Cancel</button>
            </div>
          </form>
        </div>

        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 2px solid #334155;">
              <th style="padding: 10px;">Code</th>
              <th style="padding: 10px;">Type</th>
              <th style="padding: 10px;">Value</th>
              <th style="padding: 10px;">Min Order</th>
              <th style="padding: 10px;">Active</th>
              <th style="padding: 10px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="promo in promoCodes" :key="promo._id" style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 10px;"><strong>{{ promo.code }}</strong></td>
              <td style="padding: 10px;">{{ promo.discountType }}</td>
              <td style="padding: 10px;">{{ promo.discountValue }}{{ promo.discountType === 'percentage' ? '%' : '$' }}</td>
              <td style="padding: 10px;">${{ promo.minOrderAmount }}</td>
              <td style="padding: 10px;">
                <span :style="promo.isActive ? 'color:#10b981' : 'color:#f87171'">{{ promo.isActive ? 'Yes' : 'No' }}</span>
              </td>
              <td style="padding: 10px;">
                <button @click="handleDeletePromo(promo._id)" style="padding: 4px 8px; background: #ef4444; color: #fff; border: none; cursor: pointer;">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PROFILE -->
      <div v-if="activeTab === 'profile'">
        <h2>Edit Store Details</h2>
        <form @submit.prevent="handleUpdateProfile" style="max-width: 600px;">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px;">Store Name</label>
            <input v-model="profileForm.storeName" type="text" style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid #475569; color: #fff;" />
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px;">Store Description</label>
            <textarea v-model="profileForm.description" rows="4" style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid #475569; color: #fff;"></textarea>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px;">Phone Number</label>
            <input v-model="profileForm.phone" type="text" style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid #475569; color: #fff;" />
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px;">Address</label>
            <input v-model="profileForm.address" type="text" style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid #475569; color: #fff;" />
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px;">Payout Details</label>
            <input v-model="profileForm.payoutInfo" type="text" style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid #475569; color: #fff;" />
          </div>
          <button type="submit" style="padding: 10px 20px; background: #10b981; color: #000; border: none; font-weight: bold; cursor: pointer;">Save Changes</button>
        </form>
      </div>
    </div>
  </div>
</template>
