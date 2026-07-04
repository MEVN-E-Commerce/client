# Order and Payment Integration Details

This document outlines the design decisions and integration assumptions made during the implementation of the Cart, Checkout, and Order/Payment tracking modules.

## Assumptions & Integrations

### 1. Authentication Integration
* **Cart Merging on Login**: Rather than modifying `/client/src/store/modules/auth.js` directly (preserving core authentication logic), we integrated the cart merging logic directly into the submit handler (`handleLogin`) of `Login.vue` (located at `/client/src/views/auth/Login.vue`).
* Once `store.dispatch('auth/login')` resolves successfully:
  * We immediately dispatch `store.dispatch('cart/mergeCart')`.
  * This merges any local guest session cart items into the permanent user cart on the database.
  * It also automatically clears the guest session ID from `localStorage`.
* **Guest session retention**: If a user is not logged in, we retain their guest session in `localStorage` under the key `guestSessionId`.

### 2. Stripe Webhook & Redirections
* The backend Stripe success URL is configured in `.env` as `http://localhost:5173/checkout/success`.
* In `router/index.js`, we registered `/checkout/success` as a valid route pointing to `OrderConfirmation.vue`.
* To handle guest tracking lookup on checkout completion:
  * In `Checkout.vue`'s submit handler, right before redirecting to Stripe, we store the newly created `orderId` in `localStorage` under `lastOrderId` and the guest contact email under `guestContactEmail`.
  * This allows the `OrderConfirmation.vue` view to display a direct and working link to `/track/:id?email=...` immediately for guest users without requiring them to re-enter details.

### 3. State Hydration
* To keep the shopping cart count badge in the navigation bar accurate and responsive, we dispatch `store.dispatch('cart/fetchCart')` inside `/client/src/components/shared/NavBar.vue`'s `onMounted` lifecycle hook. This ensures that the user's active session cart (guest or member) is fetched immediately on page load.
