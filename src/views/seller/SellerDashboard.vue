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
  deleteProduct,
  uploadProductImages
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
  images: [],
  isActive: true
});

// Image upload and staging state
const selectedFiles = ref([]);
const imagePreviews = ref([]);
const isUploading = ref(false);

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

// Payout detail structure state
const payoutMethod = ref('bank');
const bankDetails = ref({ bankName: '', holderName: '', accountNumber: '', iban: '', swift: '' });
const paypalDetails = ref({ email: '' });
const cardDetails = ref({ holderName: '', last4: '', expMonth: '', expYear: '' });

const currentUser = computed(() => store.getters['auth/currentUser']);

const fetchData = async () => {
  loading.value = true;
  error.value = '';
  try {
    // 1. Profile (always load first so it is available even for pending sellers)
    const profileRes = await getSellerProfile();
    profile.value = profileRes.seller;
    profileForm.value = {
      storeName: profile.value.storeName,
      description: profile.value.description || '',
      phone: profile.value.phone || '',
      address: profile.value.address || '',
      payoutInfo: profile.value.payoutInfo || ''
    };

    // Parse payout details object
    const payout = profile.value.payoutInfo;
    if (payout && typeof payout === 'object') {
      payoutMethod.value = payout.method || 'bank';
      if (payout.method === 'bank') bankDetails.value = { ...bankDetails.value, ...payout.bank };
      else if (payout.method === 'paypal') paypalDetails.value = { ...paypalDetails.value, ...payout.paypal };
      else if (payout.method === 'card') cardDetails.value = { ...cardDetails.value, ...payout.card };
    } else if (payout && typeof payout === 'string') {
      payoutMethod.value = 'bank';
      bankDetails.value.accountNumber = payout;
    }

    // 2. Categories (publicly accessible)
    const categoriesRes = await getCategories();
    categories.value = categoriesRes.categories;

    // 3. Approved-only data (only load if approved to prevent 403 errors)
    if (currentUser.value && currentUser.value.sellerStatus === 'approved') {
      const statsRes = await getDashboardStats();
      stats.value = statsRes.stats;

      const productsRes = await getSellerProducts();
      products.value = productsRes.products;

      const ordersRes = await getSellerOrders();
      orders.value = ordersRes.orders;

      const promoRes = await getPromoCodes();
      promoCodes.value = promoRes.promoCodes;
    }
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
  productForm.value = { name: '', description: '', price: 0, stock: 0, categoryId: '', isActive: true, images: [] };
  selectedFiles.value = [];
  imagePreviews.value = [];
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
    isActive: prod.isActive,
    images: [...(prod.images || [])]
  };
  selectedFiles.value = [];
  imagePreviews.value = [];
  showProductForm.value = true;
};

const handleFileChange = (e) => {
  const files = Array.from(e.target.files);
  error.value = '';

  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxBytes = 5 * 1024 * 1024;

  for (const file of files) {
    if (!validTypes.includes(file.type)) {
      error.value = 'Invalid file type. Only JPG, PNG, GIF, and WEBP images are supported.';
      return;
    }
    if (file.size > maxBytes) {
      error.value = 'File is too large. Maximum size allowed is 5MB per image.';
      return;
    }
  }

  selectedFiles.value.push(...files);
  imagePreviews.value.push(...files.map(file => URL.createObjectURL(file)));
};

const removeStagedImage = (index) => {
  selectedFiles.value.splice(index, 1);
  imagePreviews.value.splice(index, 1);
};

const removeExistingImage = (index) => {
  productForm.value.images.splice(index, 1);
};

const handleSaveProduct = async () => {
  try {
    error.value = '';
    success.value = '';
    isUploading.value = true;

    let finalImages = [...(productForm.value.images || [])];

    if (selectedFiles.value.length > 0) {
      const formData = new FormData();
      selectedFiles.value.forEach(file => {
        formData.append('images', file);
      });
      const uploadRes = await uploadProductImages(formData);
      if (uploadRes.imageUrls) {
        finalImages.push(...uploadRes.imageUrls);
      }
    }

    const productData = {
      ...productForm.value,
      images: finalImages
    };

    if (isEditMode.value) {
      await updateProduct(editingProductId.value, productData);
      success.value = 'Product updated successfully!';
    } else {
      await createProduct(productData);
      success.value = 'Product created successfully!';
    }
    showProductForm.value = false;
    await fetchData();
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Product operation failed';
  } finally {
    isUploading.value = false;
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

const handleUpdateStockClick = (prod) => {
  const inputEl = document.getElementById('stock-input-' + prod._id);
  if (inputEl) {
    handleUpdateStock(prod, parseInt(inputEl.value, 10));
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
  error.value = '';
  success.value = '';
  try {
    const payoutInfoObj = {
      method: payoutMethod.value,
      bank: payoutMethod.value === 'bank' ? bankDetails.value : undefined,
      paypal: payoutMethod.value === 'paypal' ? paypalDetails.value : undefined,
      card: payoutMethod.value === 'card' ? cardDetails.value : undefined
    };

    await updateSellerProfile({
      storeName: profileForm.value.storeName,
      description: profileForm.value.description,
      phone: profileForm.value.phone,
      address: profileForm.value.address,
      payoutInfo: payoutInfoObj
    });
    success.value = 'Store profile updated successfully!';
    await fetchData();
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to update profile';
  }
};
</script>

<template>
  <div style="max-width: 1200px; margin: 20px auto; padding: 20px; font-family: sans-serif; background: #0f172a; color: #f8fafc; border-radius: 8px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px;">
      <h1 style="margin: 0;">Seller Portal: {{ (profile && profile.storeName) || 'My Shop' }}</h1>
      <router-link
        to="/seller/products"
        style="padding: 8px 16px; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; transition: background 0.2s;"
      >
        Manage Products (Advanced)
      </router-link>
    </div>
    
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
            <div style="font-size: 1.5rem; font-weight: bold; margin-top: 5px;">${{ (stats && stats.totalSales) || 0 }}</div>
          </div>
          <div style="background: #1e293b; padding: 20px; border-radius: 6px; border-left: 4px solid #3b82f6;">
            <div style="font-size: 0.875rem; color: #94a3b8;">Total Orders</div>
            <div style="font-size: 1.5rem; font-weight: bold; margin-top: 5px;">{{ (stats && stats.totalOrders) || 0 }}</div>
          </div>
          <div style="background: #1e293b; padding: 20px; border-radius: 6px; border-left: 4px solid #8b5cf6;">
            <div style="font-size: 0.875rem; color: #94a3b8;">Listed Products</div>
            <div style="font-size: 1.5rem; font-weight: bold; margin-top: 5px;">{{ (stats && stats.totalProducts) || 0 }}</div>
          </div>
          <div style="background: #1e293b; padding: 20px; border-radius: 6px; border-left: 4px solid #ef4444;">
            <div style="font-size: 0.875rem; color: #94a3b8;">Low Stock Alert</div>
            <div style="font-size: 1.5rem; font-weight: bold; margin-top: 5px;">{{ (stats && stats.lowStockCount) || 0 }}</div>
          </div>
        </div>

        <div v-if="stats && stats.lowStockProducts && stats.lowStockProducts.length > 0" style="background: #7f1d1d; padding: 15px; border-radius: 6px;">
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
            <!-- Product Images Staging & Upload -->
            <div style="margin-bottom:15px; padding: 12px; background: #0f172a; border: 1px solid #334155; border-radius: 6px;">
              <label style="display:block; margin-bottom:8px; font-weight:bold;">Product Images</label>
              
              <!-- Existing Images -->
              <div v-if="productForm.images && productForm.images.length > 0" style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
                <div v-for="(img, index) in productForm.images" :key="img" style="position:relative; width:80px; height:80px; border:1px solid #475569; border-radius:4px; overflow:hidden;">
                  <img :src="img" style="width:100%; height:100%; object-fit:cover;" />
                  <button type="button" @click="removeExistingImage(index)" style="position:absolute; top:2px; right:2px; background:#ef4444; color:#fff; border:none; width:18px; height:18px; line-height:16px; text-align:center; font-size:12px; font-weight:bold; cursor:pointer; border-radius:50%; padding:0;">×</button>
                </div>
              </div>

              <!-- Staged Image Previews -->
              <div v-if="imagePreviews.length > 0" style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
                <div v-for="(preview, index) in imagePreviews" :key="index" style="position:relative; width:80px; height:80px; border:1px solid #10b981; border-radius:4px; overflow:hidden;">
                  <img :src="preview" style="width:100%; height:100%; object-fit:cover;" />
                  <button type="button" @click="removeStagedImage(index)" style="position:absolute; top:2px; right:2px; background:#ef4444; color:#fff; border:none; width:18px; height:18px; line-height:16px; text-align:center; font-size:12px; font-weight:bold; cursor:pointer; border-radius:50%; padding:0;">×</button>
                </div>
              </div>

              <input type="file" multiple accept="image/*" @change="handleFileChange" style="width:100%; color:#94a3b8;" />
              <p style="font-size:0.75rem; color:#64748b; margin-top:5px; margin-bottom:0;">Supported formats: JPG, PNG, GIF, WEBP. Max size: 5MB per file.</p>
            </div>

            <div style="margin-bottom:15px;">
              <label style="display:flex; align-items:center; gap:8px;">
                <input v-model="productForm.isActive" type="checkbox" /> Active / Available
              </label>
            </div>
            <div style="display:flex; gap:10px;">
              <button type="submit" :disabled="isUploading" style="padding: 8px 16px; background:#10b981; color:#000; border:none; cursor:pointer; font-weight:bold;">{{ isUploading ? 'Saving...' : 'Save' }}</button>
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
                <button @click="handleUpdateStockClick(p)" style="padding: 6px 12px; background: #10b981; color: #000; border: none; font-weight: bold; cursor: pointer;">Update Stock</button>
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
          <div style="margin-bottom: 20px; padding: 15px; background: #1e293b; border: 1px solid #334155; border-radius: 6px;">
            <h4 style="margin-top: 0; margin-bottom: 10px; color: #10b981;">Payout Details Setup</h4>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px;">Preferred Payout Method *</label>
              <select v-model="payoutMethod" style="width: 100%; padding: 8px; border: 1px solid #475569; background: #0f172a; color: #fff; border-radius: 4px;">
                <option value="bank">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="card">Debit/Credit Card</option>
              </select>
            </div>

            <!-- Bank Account Section -->
            <div v-if="payoutMethod === 'bank'" style="display: grid; grid-template-columns: 1fr; gap: 10px;">
              <div>
                <label style="display: block; font-size: 0.85em; margin-bottom: 3px;">Bank Name *</label>
                <input v-model="bankDetails.bankName" type="text" placeholder="Chase" style="width: 100%; padding: 8px; border: 1px solid #475569; background: #0f172a; color: #fff; border-radius: 4px;" />
              </div>
              <div>
                <label style="display: block; font-size: 0.85em; margin-bottom: 3px;">Account Holder Name *</label>
                <input v-model="bankDetails.holderName" type="text" placeholder="John Doe" style="width: 100%; padding: 8px; border: 1px solid #475569; background: #0f172a; color: #fff; border-radius: 4px;" />
              </div>
              <div>
                <label style="display: block; font-size: 0.85em; margin-bottom: 3px;">Account Number *</label>
                <input v-model="bankDetails.accountNumber" type="text" placeholder="1234567890" style="width: 100%; padding: 8px; border: 1px solid #475569; background: #0f172a; color: #fff; border-radius: 4px;" />
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                  <label style="display: block; font-size: 0.85em; margin-bottom: 3px;">IBAN (Optional)</label>
                  <input v-model="bankDetails.iban" type="text" placeholder="EG..." style="width: 100%; padding: 8px; border: 1px solid #475569; background: #0f172a; color: #fff; border-radius: 4px;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.85em; margin-bottom: 3px;">SWIFT Code (Optional)</label>
                  <input v-model="bankDetails.swift" type="text" placeholder="CHASUS33" style="width: 100%; padding: 8px; border: 1px solid #475569; background: #0f172a; color: #fff; border-radius: 4px;" />
                </div>
              </div>
            </div>

            <!-- PayPal Section -->
            <div v-if="payoutMethod === 'paypal'">
              <label style="display: block; font-size: 0.85em; margin-bottom: 3px;">PayPal Email Address *</label>
              <input v-model="paypalDetails.email" type="email" placeholder="billing@mybrand.com" style="width: 100%; padding: 8px; border: 1px solid #475569; background: #0f172a; color: #fff; border-radius: 4px;" />
            </div>

            <!-- Card Section -->
            <div v-if="payoutMethod === 'card'" style="display: grid; grid-template-columns: 1fr; gap: 10px;">
              <div>
                <label style="display: block; font-size: 0.85em; margin-bottom: 3px;">Card Holder Name *</label>
                <input v-model="cardDetails.holderName" type="text" placeholder="John Doe" style="width: 100%; padding: 8px; border: 1px solid #475569; background: #0f172a; color: #fff; border-radius: 4px;" />
              </div>
              <div>
                <label style="display: block; font-size: 0.85em; margin-bottom: 3px;">Last 4 Digits of Card *</label>
                <input v-model="cardDetails.last4" type="text" maxlength="4" placeholder="4321" style="width: 100%; padding: 8px; border: 1px solid #475569; background: #0f172a; color: #fff; border-radius: 4px;" />
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                  <label style="display: block; font-size: 0.85em; margin-bottom: 3px;">Expiration Month *</label>
                  <input v-model="cardDetails.expMonth" type="text" placeholder="MM" style="width: 100%; padding: 8px; border: 1px solid #475569; background: #0f172a; color: #fff; border-radius: 4px;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.85em; margin-bottom: 3px;">Expiration Year *</label>
                  <input v-model="cardDetails.expYear" type="text" placeholder="YYYY" style="width: 100%; padding: 8px; border: 1px solid #475569; background: #0f172a; color: #fff; border-radius: 4px;" />
                </div>
              </div>
            </div>
          </div>
          <button type="submit" style="padding: 10px 20px; background: #10b981; color: #000; border: none; font-weight: bold; cursor: pointer;">Save Changes</button>
        </form>
      </div>
    </div>
  </div>
</template>
