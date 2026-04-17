// ===== Additional Client Pages =====
import { mockCategories, mockOrders, mockPromotions, getCurrentUser, setCurrentUser } from '../data.js';
import { StatusBadge } from '../components.js';
import { icon, formatPrice, formatDate } from '../utils.js';
import { toast } from '../toast.js';
import { navigateTo } from '../router.js';

// ===== Login Page =====
export function renderLoginPage() {
  return `
    <div class="min-h-screen bg-surface flex items-center justify-center p-4">
      <div class="bg-white rounded-xl border border-border p-8 w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold mb-2">Đăng nhập</h1>
          <p class="text-text-secondary">Chào mừng bạn đến với Fashion Store</p>
        </div>
        <form id="login-form" class="space-y-4">
          <div>
            <label class="label" for="login-email">Email hoặc số điện thoại</label>
            <input class="input" id="login-email" required placeholder="example@email.com" />
          </div>
          <div>
            <label class="label" for="login-password">Mật khẩu</label>
            <input class="input" id="login-password" type="password" required placeholder="••••••••" />
          </div>
          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" class="accent-primary" /> Ghi nhớ đăng nhập
            </label>
            <a href="#/forgot-password" class="text-primary hover:underline">Quên mật khẩu?</a>
          </div>
          <button type="submit" class="btn btn-default w-full btn-lg" id="login-btn">Đăng nhập</button>
          <div class="text-center text-sm">
            <span class="text-text-secondary">Chưa có tài khoản? </span>
            <a href="#/register" class="text-primary hover:underline font-medium">Đăng ký ngay</a>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function setupLoginPageEvents() {
  document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    btn.disabled = true;
    btn.textContent = 'Đang đăng nhập...';

    setTimeout(() => {
      setCurrentUser({
        id: 'user1',
        email: 'nguyenvana@email.com',
        phone: '0901234567',
        name: 'Nguyễn Văn A',
        role: 'customer',
        addresses: [
          { id: 'addr1', name: 'Nguyễn Văn A', phone: '0901234567', address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh', isDefault: true },
        ],
      });
      toast.success('Đăng nhập thành công');
      const query = new URLSearchParams(window.location.hash.split('?')[1] || '');
      navigateTo(query.get('redirect') || '/');
    }, 1000);
  });
}

// ===== Register Page =====
export function renderRegisterPage() {
  return `
    <div class="min-h-screen bg-surface flex items-center justify-center p-4">
      <div class="bg-white rounded-xl border border-border p-8 w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold mb-2">Đăng ký</h1>
          <p class="text-text-secondary">Tạo tài khoản mới tại Fashion Store</p>
        </div>
        <form id="register-form" class="space-y-4">
          <div>
            <label class="label" for="reg-name">Họ và tên</label>
            <input class="input" id="reg-name" required placeholder="Nguyễn Văn A" />
          </div>
          <div>
            <label class="label" for="reg-email">Email</label>
            <input class="input" id="reg-email" type="email" required placeholder="example@email.com" />
          </div>
          <div>
            <label class="label" for="reg-phone">Số điện thoại</label>
            <input class="input" id="reg-phone" type="tel" required placeholder="0901234567" />
          </div>
          <div>
            <label class="label" for="reg-password">Mật khẩu</label>
            <input class="input" id="reg-password" type="password" required placeholder="••••••••" minlength="6" />
          </div>
          <div>
            <label class="label" for="reg-confirm">Xác nhận mật khẩu</label>
            <input class="input" id="reg-confirm" type="password" required placeholder="••••••••" minlength="6" />
          </div>
          <button type="submit" class="btn btn-default w-full btn-lg" id="register-btn">Đăng ký</button>
          <div class="text-center text-sm">
            <span class="text-text-secondary">Đã có tài khoản? </span>
            <a href="#/login" class="text-primary hover:underline font-medium">Đăng nhập ngay</a>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function setupRegisterPageEvents() {
  document.getElementById('register-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const pw = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    if (pw !== confirm) { toast.error('Mật khẩu xác nhận không khớp'); return; }

    const btn = document.getElementById('register-btn');
    btn.disabled = true;
    btn.textContent = 'Đang đăng ký...';

    setTimeout(() => {
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigateTo('/login');
    }, 1000);
  });
}

// ===== Forgot Password Page =====
export function renderForgotPasswordPage() {
  return `
    <div class="min-h-screen bg-surface flex items-center justify-center p-4">
      <div class="bg-white rounded-xl border border-border p-8 w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold mb-2">Quên mật khẩu</h1>
          <p class="text-text-secondary">Nhập email của bạn để nhận hướng dẫn khôi phục mật khẩu</p>
        </div>
        <form id="forgot-form" class="space-y-4">
          <div>
            <label class="label" for="forgot-email">Email</label>
            <input class="input" id="forgot-email" type="email" required placeholder="example@email.com" />
          </div>
          <button type="submit" class="btn btn-default w-full btn-lg" id="forgot-btn">Gửi hướng dẫn</button>
          <div class="text-center text-sm">
            <a href="#/login" class="text-primary hover:underline">Quay lại đăng nhập</a>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function setupForgotPasswordEvents() {
  document.getElementById('forgot-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('forgot-btn');
    btn.disabled = true;
    btn.textContent = 'Đang gửi...';
    const email = document.getElementById('forgot-email').value;

    setTimeout(() => {
      const container = document.querySelector('main') || document.getElementById('root');
      container.innerHTML = `
        <div class="min-h-screen bg-surface flex items-center justify-center p-4">
          <div class="bg-white rounded-xl border border-border p-8 w-full max-w-md text-center">
            ${icon('check-circle-2', 'w-16 h-16 text-success mx-auto mb-4')}
            <h1 class="text-2xl font-bold mb-2">Kiểm tra email của bạn</h1>
            <p class="text-text-secondary mb-6">Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến email <strong>${email}</strong></p>
            <a href="#/login" class="btn btn-default w-full">Về trang đăng nhập</a>
          </div>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      toast.success('Đã gửi email khôi phục mật khẩu');
    }, 1000);
  });
}

// ===== Profile Page =====
export function renderProfilePage() {
  const user = getCurrentUser();
  if (!user) {
    return `
      <div class="min-h-screen bg-surface flex items-center justify-center">
        <div class="text-center">
          <h2 class="text-2xl font-semibold mb-4">Vui lòng đăng nhập</h2>
          <a href="#/login" class="btn btn-default">Đăng nhập</a>
        </div>
      </div>
    `;
  }

  return `
    <div class="py-8 bg-surface min-h-screen">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold mb-8">Tài khoản của tôi</h1>
        <div class="space-y-6">
          <div class="tabs-list">
            <button class="tab-trigger active" data-tab="profile">${icon('user', 'w-4 h-4')} Thông tin cá nhân</button>
            <button class="tab-trigger" data-tab="addresses">${icon('map-pin', 'w-4 h-4')} Địa chỉ</button>
            <button class="tab-trigger" data-tab="orders">${icon('shopping-bag', 'w-4 h-4')} Đơn hàng</button>
          </div>

          <div class="tab-content active" id="tab-profile">
            <div class="bg-white rounded-xl border border-border p-6">
              <h2 class="text-xl font-semibold mb-6">Thông tin cá nhân</h2>
              <form id="profile-form" class="space-y-4 max-w-2xl">
                <div>
                  <label class="label">Họ và tên</label>
                  <input class="input" value="${user.name}" />
                </div>
                <div>
                  <label class="label">Email</label>
                  <input class="input" type="email" value="${user.email}" />
                </div>
                <div>
                  <label class="label">Số điện thoại</label>
                  <input class="input" type="tel" value="${user.phone}" />
                </div>
                <button type="submit" class="btn btn-default">Lưu thay đổi</button>
              </form>
            </div>
          </div>

          <div class="tab-content" id="tab-addresses">
            <div class="bg-white rounded-xl border border-border p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold">Địa chỉ của tôi</h2>
                <button class="btn btn-default">Thêm địa chỉ mới</button>
              </div>
              <div class="space-y-4">
                ${(user.addresses || []).map(addr => `
                  <div class="border border-border rounded-lg p-4">
                    <div class="flex items-start justify-between">
                      <div>
                        <p class="font-medium">${addr.name}</p>
                        <p class="text-sm text-text-secondary">${addr.phone}</p>
                        <p class="text-sm text-text-secondary mt-2">${addr.address}</p>
                        ${addr.isDefault ? '<span class="inline-block mt-2 text-xs bg-primary text-white px-2 py-1 rounded">Mặc định</span>' : ''}
                      </div>
                      <div class="flex gap-2">
                        <button class="btn btn-outline btn-sm">Sửa</button>
                        <button class="btn btn-outline btn-sm">Xóa</button>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="tab-content" id="tab-orders">
            <div class="bg-white rounded-xl border border-border p-6">
              <h2 class="text-xl font-semibold mb-6">Đơn hàng của tôi</h2>
              <div class="text-center py-12 text-text-secondary">
                ${icon('shopping-bag', 'w-16 h-16 mx-auto mb-4')}
                <p>Bạn chưa có đơn hàng nào</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function setupProfilePageEvents() {
  // Tabs
  document.querySelectorAll('.tab-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      document.querySelectorAll('.tab-trigger').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      trigger.classList.add('active');
      document.getElementById(`tab-${trigger.dataset.tab}`)?.classList.add('active');
    });
  });

  document.getElementById('profile-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    toast.success('Cập nhật thông tin thành công');
  });
}

// ===== Orders List Page =====
export function renderOrdersListPage() {
  return `
    <div class="py-8 bg-surface min-h-screen">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold mb-8">Đơn hàng của tôi</h1>
        ${mockOrders.length > 0 ? `
          <div class="space-y-4">
            ${mockOrders.map(order => `
              <div class="bg-white rounded-xl border border-border p-6">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <p class="font-semibold text-lg">${order.orderNumber}</p>
                    <p class="text-sm text-text-secondary">${formatDate(order.createdAt)}</p>
                  </div>
                  <div class="text-right">
                    ${StatusBadge(order.status, 'order')}
                    ${StatusBadge(order.paymentStatus, 'payment', 'ml-2')}
                  </div>
                </div>
                <div class="space-y-3 mb-4">
                  ${order.items.map(item => `
                    <div class="flex gap-4">
                      <img src="${item.image}" alt="${item.productName}" class="w-16 h-16 object-cover rounded-lg" />
                      <div class="flex-1">
                        <p class="font-medium">${item.productName}</p>
                        <p class="text-sm text-text-secondary">${item.variantLabel} x ${item.quantity}</p>
                      </div>
                      <p class="font-semibold">${formatPrice(item.price * item.quantity)}</p>
                    </div>
                  `).join('')}
                </div>
                <div class="flex items-center justify-between pt-4 border-t border-border">
                  <p class="text-lg font-semibold">Tổng: ${formatPrice(order.total)}</p>
                  <a href="#/orders/${order.id}" class="btn btn-outline">Xem chi tiết</a>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="bg-white rounded-xl border border-border p-12 text-center">
            ${icon('shopping-bag', 'w-16 h-16 mx-auto text-text-secondary mb-4')}
            <p class="text-text-secondary mb-6">Bạn chưa có đơn hàng nào</p>
            <a href="#/shop" class="btn btn-default">Mua sắm ngay</a>
          </div>
        `}
      </div>
    </div>
  `;
}

// ===== Order Detail Page =====
export function renderOrderDetailPage(orderId) {
  const order = mockOrders.find(o => o.id === orderId);
  if (!order) {
    return `
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <h2 class="text-2xl font-semibold mb-4">Không tìm thấy đơn hàng</h2>
          <a href="#/orders" class="btn btn-default">Về danh sách đơn hàng</a>
        </div>
      </div>
    `;
  }

  const statusSteps = ['pending', 'confirmed', 'shipping', 'completed'];
  const currentStepIndex = statusSteps.indexOf(order.status);
  const stepLabels = { pending: 'Đã đặt', confirmed: 'Đã xác nhận', shipping: 'Đang giao', completed: 'Hoàn thành' };

  return `
    <div class="py-8 bg-surface min-h-screen">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-8">
          <a href="#/orders" class="text-primary hover:underline mb-4 inline-block">← Quay lại danh sách đơn hàng</a>
          <h1 class="text-3xl font-bold">Chi tiết đơn hàng</h1>
          <p class="text-text-secondary mt-2">${order.orderNumber}</p>
        </div>

        <!-- Status Timeline -->
        <div class="bg-white rounded-xl border border-border p-6 mb-6">
          <h2 class="font-semibold mb-6">Trạng thái đơn hàng</h2>
          <div class="flex items-center justify-between relative">
            ${statusSteps.map((step, i) => {
              const isCompleted = i <= currentStepIndex;
              return `
                <div class="flex flex-col items-center flex-1 relative">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-success text-white' : 'bg-surface text-text-secondary'}">
                    ${isCompleted ? icon('check-circle-2', 'w-6 h-6') : (i + 1)}
                  </div>
                  <p class="text-sm mt-2 ${isCompleted ? 'font-medium' : 'text-text-secondary'}">${stepLabels[step]}</p>
                  ${i < statusSteps.length - 1 ? `<div class="absolute top-5 left-1/2 w-full h-0.5 ${i < currentStepIndex ? 'bg-success' : 'bg-border'}"></div>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Order Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="bg-white rounded-xl border border-border p-6">
            <h2 class="font-semibold mb-4">Thông tin đơn hàng</h2>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between"><span class="text-text-secondary">Mã đơn:</span><span class="font-medium">${order.orderNumber}</span></div>
              <div class="flex justify-between"><span class="text-text-secondary">Ngày đặt:</span><span>${formatDate(order.createdAt)}</span></div>
              <div class="flex justify-between"><span class="text-text-secondary">Thanh toán:</span>${StatusBadge(order.paymentStatus, 'payment')}</div>
              <div class="flex justify-between"><span class="text-text-secondary">Phương thức:</span><span>${order.paymentMethod === 'cod' ? 'COD' : 'Online'}</span></div>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-border p-6">
            <h2 class="font-semibold mb-4">Địa chỉ nhận hàng</h2>
            <div class="text-sm space-y-1">
              <p class="font-medium">${order.shippingAddress.name}</p>
              <p class="text-text-secondary">${order.shippingAddress.phone}</p>
              <p class="text-text-secondary">${order.shippingAddress.address}</p>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="bg-white rounded-xl border border-border p-6 mb-6">
          <h2 class="font-semibold mb-4">Sản phẩm</h2>
          <div class="space-y-4">
            ${order.items.map(item => `
              <div class="flex gap-4 pb-4 border-b border-border last:border-0">
                <img src="${item.image}" alt="${item.productName}" class="w-20 h-20 object-cover rounded-lg" />
                <div class="flex-1">
                  <p class="font-medium">${item.productName}</p>
                  <p class="text-sm text-text-secondary">${item.variantLabel}</p>
                  <p class="text-sm text-text-secondary">Số lượng: ${item.quantity}</p>
                </div>
                <p class="font-semibold">${formatPrice(item.price * item.quantity)}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Order Summary -->
        <div class="bg-white rounded-xl border border-border p-6">
          <h2 class="font-semibold mb-4">Tổng đơn hàng</h2>
          <div class="space-y-3">
            <div class="flex justify-between"><span class="text-text-secondary">Tạm tính:</span><span>${formatPrice(order.subtotal)}</span></div>
            ${order.discount > 0 ? `<div class="flex justify-between"><span class="text-text-secondary">Giảm giá:</span><span class="text-success">-${formatPrice(order.discount)}</span></div>` : ''}
            <div class="flex justify-between pt-3 border-t border-border">
              <span class="font-semibold text-lg">Tổng cộng:</span>
              <span class="font-bold text-xl text-accent">${formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ===== Payment Result Page =====
export function renderPaymentResultPage(query) {
  const status = query.get('status');
  const orderId = query.get('orderId');
  const isSuccess = status === 'success';

  return `
    <div class="min-h-screen bg-surface flex items-center justify-center p-4">
      <div class="bg-white rounded-xl border border-border p-8 max-w-md w-full text-center">
        ${isSuccess
          ? icon('check-circle-2', 'w-20 h-20 text-success mx-auto mb-4')
          : icon('x-circle', 'w-20 h-20 text-error mx-auto mb-4')
        }
        <h1 class="text-2xl font-bold mb-2">${isSuccess ? 'Đặt hàng thành công!' : 'Thanh toán thất bại'}</h1>
        <p class="text-text-secondary mb-6">
          ${isSuccess ? 'Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn sớm nhất.' : 'Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.'}
        </p>
        ${orderId ? `
          <div class="bg-surface p-4 rounded-lg mb-6">
            <p class="text-sm text-text-secondary mb-1">Mã đơn hàng</p>
            <p class="font-semibold">${orderId}</p>
          </div>
        ` : ''}
        <div class="flex gap-4">
          <a href="#/orders" class="btn ${isSuccess ? 'btn-default' : 'btn-outline'} flex-1">Xem đơn hàng</a>
          <a href="#/" class="btn btn-outline flex-1">Về trang chủ</a>
        </div>
      </div>
    </div>
  `;
}

// ===== Categories Page =====
export function renderCategoriesPage() {
  return `
    <div class="py-12 bg-surface min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          ${mockCategories.filter(c => !c.parentId).map(cat => `
            <a href="#/shop/${cat.slug}" class="group bg-white rounded-xl border border-border p-8 hover:shadow-lg transition-all text-center">
              <h3 class="text-xl font-semibold group-hover:text-primary transition-colors">${cat.name}</h3>
            </a>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ===== Promotions Page =====
export function renderPromotionsPage() {
  return `
    <div class="py-12 bg-surface min-h-screen">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold mb-2">Khuyến mãi</h1>
        <p class="text-text-secondary mb-8">Sử dụng mã giảm giá khi thanh toán</p>
        <div class="space-y-4">
          ${mockPromotions.map(promo => `
            <div class="bg-white rounded-xl border border-border p-6 flex items-center gap-6">
              <div class="flex-shrink-0 w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                ${icon('tag', 'w-8 h-8 text-accent')}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="badge bg-accent text-white">${promo.code}</span>
                  <span class="badge badge-outline">${promo.type === 'percentage' ? `-${promo.value}%` : `-${formatPrice(promo.value)}`}</span>
                </div>
                <p class="font-medium mb-1">${promo.description}</p>
                ${promo.minOrder ? `<p class="text-sm text-text-secondary">Đơn tối thiểu: ${formatPrice(promo.minOrder)}</p>` : ''}
              </div>
              <button class="btn btn-default" data-copy-code="${promo.code}">
                ${icon('copy', 'w-4 h-4')} Sao chép
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

export function setupPromotionsPageEvents() {
  document.querySelectorAll('[data-copy-code]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.copyCode);
      toast.success('Đã sao chép mã giảm giá');
    });
  });
}

// ===== About Page =====
export function renderAboutPage() {
  return `
    <div class="py-12 bg-white min-h-screen">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-4xl font-bold mb-6">Về Fashion Store</h1>
        <div class="prose max-w-none">
          <p class="text-lg text-text-secondary mb-6">Fashion Store là điểm đến lý tưởng cho những ai yêu thích thời trang hiện đại và chất lượng.</p>
          <h2>Sứ mệnh của chúng tôi</h2>
          <p>Chúng tôi cam kết mang đến những sản phẩm thời trang chất lượng cao với giá cả hợp lý, giúp mọi người tự tin thể hiện phong cách riêng của mình.</p>
          <h2>Liên hệ</h2>
          <ul>
            <li><strong>Địa chỉ:</strong> 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</li>
            <li><strong>Điện thoại:</strong> 1900 xxxx</li>
            <li><strong>Email:</strong> support@fashionstore.com</li>
            <li><strong>Giờ làm việc:</strong> 8:00 - 22:00 (Tất cả các ngày)</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

// ===== Not Found Page =====
export function renderNotFoundPage() {
  return `
    <div class="min-h-screen flex items-center justify-center bg-surface">
      <div class="text-center">
        <h1 class="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 class="text-2xl font-semibold mb-4">Không tìm thấy trang</h2>
        <p class="text-text-secondary mb-8">Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.</p>
        <a href="#/" class="btn btn-default">${icon('home', 'w-4 h-4')} Về trang chủ</a>
      </div>
    </div>
  `;
}
