// ===== Checkout Page =====
import { getCart, getCurrentUser, clearCart, mockPromotions } from '../data.js';
import { icon, formatPrice } from '../utils.js';
import { toast } from '../toast.js';
import { navigateTo } from '../router.js';

export function renderCheckoutPage() {
  const cart = getCart();
  const user = getCurrentUser();

  if (!user && cart.length > 0) {
    setTimeout(() => navigateTo('/login?redirect=/checkout'), 0);
    return '<div class="min-h-screen flex items-center justify-center"><p>Đang chuyển hướng...</p></div>';
  }

  if (cart.length === 0) {
    setTimeout(() => navigateTo('/cart'), 0);
    return '<div class="min-h-screen flex items-center justify-center"><p>Giỏ hàng trống...</p></div>';
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 500000 ? 0 : 30000;

  return `
    <div class="py-8 bg-surface min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold mb-8">Thanh toán</h1>
        <form id="checkout-form">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Form -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Shipping Info -->
              <div class="bg-white p-6 rounded-xl border border-border">
                <h2 class="text-xl font-semibold mb-6">Thông tin nhận hàng</h2>
                <div class="space-y-4">
                  <div>
                    <label class="label" for="co-name">Họ và tên *</label>
                    <input class="input" id="co-name" value="${user?.name || ''}" required placeholder="Nguyễn Văn A" />
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="label" for="co-phone">Số điện thoại *</label>
                      <input class="input" id="co-phone" type="tel" value="${user?.phone || ''}" required placeholder="0901234567" />
                    </div>
                    <div>
                      <label class="label" for="co-email">Email</label>
                      <input class="input" id="co-email" type="email" value="${user?.email || ''}" placeholder="example@email.com" />
                    </div>
                  </div>
                  <div>
                    <label class="label" for="co-address">Địa chỉ nhận hàng *</label>
                    <textarea class="input" id="co-address" rows="3" required placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố">${user?.addresses?.[0]?.address || ''}</textarea>
                  </div>
                  <div>
                    <label class="label" for="co-note">Ghi chú đơn hàng (tùy chọn)</label>
                    <textarea class="input" id="co-note" rows="3" placeholder="Ghi chú về đơn hàng, ví dụ: thời gian giao hàng"></textarea>
                  </div>
                </div>
              </div>

              <!-- Payment Method -->
              <div class="bg-white p-6 rounded-xl border border-border">
                <h2 class="text-xl font-semibold mb-6">Phương thức thanh toán</h2>
                <div class="space-y-3">
                  <label class="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-surface transition-colors cursor-pointer">
                    <input type="radio" name="payment" value="cod" checked class="accent-primary" />
                    <div class="flex items-center gap-3 flex-1">
                      ${icon('dollar-sign', 'w-5 h-5 text-success')}
                      <div>
                        <div class="font-medium">Thanh toán khi nhận hàng (COD)</div>
                        <div class="text-sm text-text-secondary">Thanh toán bằng tiền mặt khi nhận hàng</div>
                      </div>
                    </div>
                  </label>
                  <label class="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-surface transition-colors cursor-pointer">
                    <input type="radio" name="payment" value="online" class="accent-primary" />
                    <div class="flex items-center gap-3 flex-1">
                      ${icon('credit-card', 'w-5 h-5 text-info')}
                      <div>
                        <div class="font-medium">Thanh toán online</div>
                        <div class="text-sm text-text-secondary">VNPay, Momo, Internet Banking</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Order Summary -->
            <div class="lg:col-span-1">
              <div class="bg-white p-6 rounded-xl border border-border sticky top-24">
                <h2 class="text-xl font-semibold mb-6">Đơn hàng của bạn</h2>
                <div class="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  ${cart.map(item => `
                    <div class="flex gap-3">
                      <img src="${item.image}" alt="${item.productName}" class="w-16 h-16 object-cover rounded-lg" />
                      <div class="flex-1 min-w-0">
                        <p class="font-medium text-sm line-clamp-2">${item.productName}</p>
                        <p class="text-xs text-text-secondary">${item.variantLabel} x ${item.quantity}</p>
                        <p class="text-sm font-semibold">${formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  `).join('')}
                </div>

                <!-- Voucher -->
                <div class="mb-6">
                  <label class="label">Mã giảm giá</label>
                  <div class="flex gap-2">
                    <input class="input" id="voucher-input" placeholder="Nhập mã" />
                    <button type="button" class="btn btn-default" id="apply-voucher">Áp dụng</button>
                  </div>
                  <p class="text-sm text-success mt-2 hidden" id="voucher-info"></p>
                </div>

                <!-- Summary -->
                <div class="space-y-3 pb-6 border-b border-border">
                  <div class="flex justify-between text-sm">
                    <span class="text-text-secondary">Tạm tính</span>
                    <span>${formatPrice(subtotal)}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-text-secondary">Phí vận chuyển</span>
                    <span>${shipping === 0 ? '<span class="text-success">Miễn phí</span>' : formatPrice(shipping)}</span>
                  </div>
                  <div class="flex justify-between text-sm hidden" id="discount-row">
                    <span class="text-text-secondary">Giảm giá</span>
                    <span class="text-success" id="discount-value"></span>
                  </div>
                </div>

                <div class="flex justify-between items-baseline mt-6 mb-6">
                  <span class="text-lg font-semibold">Tổng cộng</span>
                  <span class="text-2xl font-bold text-accent" id="checkout-total">${formatPrice(subtotal + shipping)}</span>
                </div>

                <button type="submit" class="btn btn-default btn-lg w-full" id="place-order-btn">Đặt hàng</button>

                <p class="text-xs text-text-secondary text-center mt-4">
                  Bằng việc đặt hàng, bạn đồng ý với
                  <a href="#" class="text-primary hover:underline">Điều khoản sử dụng</a>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function setupCheckoutPageEvents() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 500000 ? 0 : 30000;
  let discount = 0;
  let appliedVoucher = null;

  function updateTotal() {
    const total = subtotal + shipping - discount;
    document.getElementById('checkout-total').textContent = formatPrice(total);
  }

  // Apply voucher
  document.getElementById('apply-voucher')?.addEventListener('click', () => {
    const code = document.getElementById('voucher-input').value.toUpperCase();
    const voucher = mockPromotions.find(p => p.code === code && p.status === 'active');

    if (!voucher) { toast.error('Mã giảm giá không hợp lệ'); return; }
    if (voucher.minOrder && subtotal < voucher.minOrder) {
      toast.error(`Đơn hàng tối thiểu ${formatPrice(voucher.minOrder)}`); return;
    }

    appliedVoucher = voucher;
    if (voucher.type === 'percentage') {
      discount = (subtotal * voucher.value) / 100;
      if (voucher.maxDiscount && discount > voucher.maxDiscount) discount = voucher.maxDiscount;
    } else {
      discount = voucher.value;
    }

    document.getElementById('discount-row')?.classList.remove('hidden');
    document.getElementById('discount-value').textContent = `-${formatPrice(discount)}`;
    document.getElementById('voucher-info').textContent = `✓ ${voucher.description}`;
    document.getElementById('voucher-info')?.classList.remove('hidden');
    document.getElementById('voucher-input').disabled = true;
    document.getElementById('apply-voucher').textContent = 'Xóa';
    toast.success('Áp dụng mã giảm giá thành công');
    updateTotal();
  });

  // Form submit
  document.getElementById('checkout-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('co-name').value;
    const phone = document.getElementById('co-phone').value;
    const address = document.getElementById('co-address').value;

    if (!name || !phone || !address) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const btn = document.getElementById('place-order-btn');
    btn.disabled = true;
    btn.textContent = 'Đang xử lý...';

    setTimeout(() => {
      clearCart();
      const orderId = 'ORD-2024-' + Date.now();
      navigateTo(`/payment/result?status=success&orderId=${orderId}`);
      toast.success('Đặt hàng thành công');
    }, 1500);
  });
}
