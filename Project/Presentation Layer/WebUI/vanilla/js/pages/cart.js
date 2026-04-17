// ===== Cart Page =====
import { getCart, updateCartItem, removeFromCart, getCurrentUser } from '../data.js';
import { icon, formatPrice, initIcons } from '../utils.js';
import { toast } from '../toast.js';
import { navigateTo } from '../router.js';

export function renderCartPage() {
  const cart = getCart();

  if (cart.length === 0) {
    return `
      <div class="py-16 bg-surface min-h-screen">
        <div class="max-w-7xl mx-auto px-4 text-center">
          <div class="w-24 h-24 mx-auto mb-6 text-text-secondary">${icon('shopping-cart', 'w-24 h-24')}</div>
          <h2 class="text-2xl font-semibold mb-4">Giỏ hàng trống</h2>
          <p class="text-text-secondary mb-8">Hãy thêm sản phẩm vào giỏ hàng</p>
          <a href="#/shop" class="btn btn-default btn-lg">Tiếp tục mua sắm</a>
        </div>
      </div>
    `;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shipping;

  return `
    <div class="py-8 bg-surface min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold mb-8">Giỏ hàng (${cart.length})</h1>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Cart Items -->
          <div class="lg:col-span-2 space-y-4" id="cart-items">
            ${cart.map(item => `
              <div class="bg-white rounded-xl border border-border p-4 flex gap-4" data-variant="${item.variantId}">
                <img src="${item.image}" alt="${item.productName}" class="w-24 h-24 object-cover rounded-lg" />
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium mb-1">${item.productName}</h3>
                  <p class="text-sm text-text-secondary mb-2">${item.variantLabel}</p>
                  <p class="font-semibold text-accent">${formatPrice(item.price)}</p>
                </div>
                <div class="flex flex-col items-end justify-between">
                  <button class="text-text-secondary hover:text-error" data-remove="${item.variantId}">
                    ${icon('trash-2', 'w-5 h-5')}
                  </button>
                  <div class="flex items-center border border-border rounded-lg">
                    <button class="btn btn-ghost btn-icon btn-sm" data-qty-minus="${item.variantId}">
                      ${icon('minus', 'w-3 h-3')}
                    </button>
                    <span class="w-8 text-center text-sm font-medium">${item.quantity}</span>
                    <button class="btn btn-ghost btn-icon btn-sm" data-qty-plus="${item.variantId}">
                      ${icon('plus', 'w-3 h-3')}
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Order Summary -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-xl border border-border p-6 sticky top-24">
              <h2 class="text-xl font-semibold mb-6">Tóm tắt đơn hàng</h2>
              <div class="space-y-3 pb-6 border-b border-border">
                <div class="flex justify-between text-sm">
                  <span class="text-text-secondary">Tạm tính</span>
                  <span id="cart-subtotal">${formatPrice(subtotal)}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-text-secondary">Phí vận chuyển</span>
                  <span id="cart-shipping">${shipping === 0 ? '<span class="text-success">Miễn phí</span>' : formatPrice(shipping)}</span>
                </div>
              </div>
              <div class="flex justify-between items-baseline mt-6 mb-6">
                <span class="text-lg font-semibold">Tổng cộng</span>
                <span class="text-2xl font-bold text-accent" id="cart-total">${formatPrice(total)}</span>
              </div>
              <button class="btn btn-default btn-lg w-full" id="checkout-btn">
                Tiến hành đặt hàng
              </button>
              <a href="#/shop" class="block text-center text-sm text-primary hover:underline mt-4">
                Tiếp tục mua sắm
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function setupCartPageEvents() {
  function refreshPage() {
    const root = document.getElementById('root');
    // Re-render via route
    window.location.hash = '/cart';
  }

  // Remove items
  document.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromCart(btn.dataset.remove);
      toast.success('Đã xóa khỏi giỏ hàng');
      refreshPage();
    });
  });

  // Quantity controls
  document.querySelectorAll('[data-qty-minus]').forEach(btn => {
    btn.addEventListener('click', () => {
      const cart = getCart();
      const item = cart.find(c => c.variantId === btn.dataset.qtyMinus);
      if (item && item.quantity > 1) {
        updateCartItem(btn.dataset.qtyMinus, item.quantity - 1);
        refreshPage();
      }
    });
  });

  document.querySelectorAll('[data-qty-plus]').forEach(btn => {
    btn.addEventListener('click', () => {
      const cart = getCart();
      const item = cart.find(c => c.variantId === btn.dataset.qtyPlus);
      if (item && item.quantity < item.stock) {
        updateCartItem(btn.dataset.qtyPlus, item.quantity + 1);
        refreshPage();
      }
    });
  });

  // Checkout
  document.getElementById('checkout-btn')?.addEventListener('click', () => {
    if (!getCurrentUser()) {
      toast.error('Vui lòng đăng nhập trước khi đặt hàng');
      navigateTo('/login?redirect=/checkout');
      return;
    }
    navigateTo('/checkout');
  });
}
