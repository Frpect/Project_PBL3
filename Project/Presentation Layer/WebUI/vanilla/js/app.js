// ===== Main Application Entry Point =====
import { router, navigateTo } from './router.js';
import { initIcons } from './utils.js';
import { addToCart, mockProducts, getCurrentUser, setCurrentUser } from './data.js';
import { toast } from './toast.js';
import { renderClientLayout, renderAdminLayout, setupClientLayoutEvents, setupAdminLayoutEvents } from './layouts.js';

// Client Pages
import { renderHomePage, setupHomePageEvents } from './pages/home.js';
import { renderShopPage, setupShopPageEvents } from './pages/shop.js';
import { renderProductDetailPage, setupProductDetailEvents } from './pages/product-detail.js';
import { renderCartPage, setupCartPageEvents } from './pages/cart.js';
import { renderCheckoutPage, setupCheckoutPageEvents } from './pages/checkout.js';
import {
  renderLoginPage, setupLoginPageEvents,
  renderRegisterPage, setupRegisterPageEvents,
  renderForgotPasswordPage, setupForgotPasswordEvents,
  renderProfilePage, setupProfilePageEvents,
  renderOrdersListPage,
  renderOrderDetailPage,
  renderPaymentResultPage,
  renderCategoriesPage,
  renderPromotionsPage, setupPromotionsPageEvents,
  renderAboutPage,
  renderNotFoundPage,
} from './pages/client-pages.js';

// Admin Pages
import {
  renderAdminLoginPage, setupAdminLoginEvents,
  renderAnalyticsPage, setupAnalyticsEvents,
  renderProductsListPage, setupProductsListEvents,
  renderAddProductPage, setupAddProductEvents,
  renderEditProductPage, setupEditProductEvents,
  renderOrdersPage, setupOrdersPageEvents,
  renderAdminOrderDetailPage, setupAdminOrderDetailEvents,
  renderAdminCategoriesPage, setupAdminCategoriesEvents,
  renderCustomersPage, setupCustomersPageEvents,
} from './pages/admin-pages.js';

import {
  renderInventoryPage, setupInventoryPageEvents,
  renderPOSPage, setupPOSPageEvents,
  renderAdminPromotionsPage, setupAdminPromotionsEvents,
  renderStaffPage, setupStaffPageEvents,
} from './pages/admin-pages2.js';

const root = document.getElementById('root');

// Quick add to cart from product cards
window.__addToCartQuick = (productId) => {
  const product = mockProducts.find(p => p.id === productId);
  if (!product) return;
  const variant = product.variants.find(v => v.stock > 0);
  if (!variant) { toast.error('Sản phẩm hết hàng'); return; }
  addToCart({
    variantId: variant.id,
    productId: product.id,
    productName: product.name,
    variantLabel: `${variant.size} / ${variant.color}`,
    quantity: 1,
    price: product.salePrice || product.basePrice,
    image: product.images[0],
    stock: variant.stock,
  });
  toast.success('Đã thêm vào giỏ hàng');
};

// Admin logout
window.__adminLogout = () => {
  setCurrentUser(null);
  navigateTo('/admin/login');
  toast.success('Đã đăng xuất');
};

// Helper to render client page
function renderClient(pageContent, setupFn, ...args) {
  root.innerHTML = renderClientLayout(pageContent);
  initIcons();
  setupClientLayoutEvents();
  if (setupFn) setupFn(...args);
}

// Helper to render admin page
function renderAdmin(pageContent, setupFn, ...args) {
  root.innerHTML = renderAdminLayout(pageContent);
  initIcons();
  setupAdminLayoutEvents();
  if (setupFn) setupFn(...args);
}

// ========== Client Routes ==========

router.add('/', () => {
  const content = renderHomePage();
  renderClient(content, setupHomePageEvents);
});

router.add('/shop', () => {
  const content = renderShopPage();
  renderClient(content, setupShopPageEvents);
});

router.add('/shop/:slug', ({ slug }) => {
  const content = renderShopPage(slug);
  renderClient(content, () => setupShopPageEvents(slug));
});

router.add('/product/:id', ({ id }) => {
  const content = renderProductDetailPage(id);
  renderClient(content, () => setupProductDetailEvents(id));
});

router.add('/cart', () => {
  const content = renderCartPage();
  renderClient(content, setupCartPageEvents);
});

router.add('/checkout', () => {
  const content = renderCheckoutPage();
  renderClient(content, setupCheckoutPageEvents);
});

router.add('/login', () => {
  const content = renderLoginPage();
  root.innerHTML = content;
  initIcons();
  setupLoginPageEvents();
});

router.add('/register', () => {
  const content = renderRegisterPage();
  root.innerHTML = content;
  initIcons();
  setupRegisterPageEvents();
});

router.add('/forgot-password', () => {
  const content = renderForgotPasswordPage();
  root.innerHTML = content;
  initIcons();
  setupForgotPasswordEvents();
});

router.add('/profile', () => {
  const content = renderProfilePage();
  renderClient(content, setupProfilePageEvents);
});

router.add('/orders', () => {
  const content = renderOrdersListPage();
  renderClient(content);
});

router.add('/orders/:id', ({ id }) => {
  const content = renderOrderDetailPage(id);
  renderClient(content);
});

router.add('/payment/result', ({ query }) => {
  const content = renderPaymentResultPage(query);
  renderClient(content);
});

router.add('/categories', () => {
  const content = renderCategoriesPage();
  renderClient(content);
});

router.add('/promotions', () => {
  const content = renderPromotionsPage();
  renderClient(content, setupPromotionsPageEvents);
});

router.add('/about', () => {
  const content = renderAboutPage();
  renderClient(content);
});

// ========== Admin Routes ==========

router.add('/admin/login', () => {
  const content = renderAdminLoginPage();
  root.innerHTML = content;
  initIcons();
  setupAdminLoginEvents();
});

router.add('/admin', () => {
  const content = renderAnalyticsPage();
  renderAdmin(content, setupAnalyticsEvents);
});

router.add('/admin/products', () => {
  const content = renderProductsListPage();
  renderAdmin(content, setupProductsListEvents);
});

router.add('/admin/products/add', () => {
  const content = renderAddProductPage();
  renderAdmin(content, setupAddProductEvents);
});

router.add('/admin/products/edit/:id', ({ id }) => {
  const content = renderEditProductPage(id);
  renderAdmin(content, setupEditProductEvents);
});

router.add('/admin/orders', () => {
  const content = renderOrdersPage();
  renderAdmin(content, setupOrdersPageEvents);
});

router.add('/admin/orders/:id', ({ id }) => {
  const content = renderAdminOrderDetailPage(id);
  renderAdmin(content, () => setupAdminOrderDetailEvents(id));
});

router.add('/admin/categories', () => {
  const content = renderAdminCategoriesPage();
  renderAdmin(content, setupAdminCategoriesEvents);
});

router.add('/admin/customers', () => {
  const content = renderCustomersPage();
  renderAdmin(content, setupCustomersPageEvents);
});

router.add('/admin/inventory', () => {
  const content = renderInventoryPage();
  renderAdmin(content, setupInventoryPageEvents);
});

router.add('/admin/pos', () => {
  const content = renderPOSPage();
  renderAdmin(content, setupPOSPageEvents);
});

router.add('/admin/promotions', () => {
  const content = renderAdminPromotionsPage();
  renderAdmin(content, setupAdminPromotionsEvents);
});

router.add('/admin/staff', () => {
  const content = renderStaffPage();
  renderAdmin(content, setupStaffPageEvents);
});

// ========== 404 ==========

router.notFound(() => {
  const content = renderNotFoundPage();
  renderClient(content);
});

// ========== Initialize ==========
router.resolve();
